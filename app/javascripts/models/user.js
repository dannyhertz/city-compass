/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'mixins/with_geo',
  'collections/stations'
], function($, _, Backbone, WithGeo, Stations) {

  var User = Backbone.Model.extend({
    defaults: {
      searchMode: 'bike'
    },
    geoOptions: {
      enableHighAccuracy: true,
      timeout: 12000
    },
    initializedServices: {
      user: false,
      stations: false
    },

    initialize: function (attrs, opts) {
      var seedStations = (opts || {}).seedStations || [];

      this.geoApi = window.navigator.geolocation;
      this.targetStations = new Stations([], { user: this, });

      this.pollCounter = 0;
      this.listenTo(this.targetStations, 'sort', this.onStationsSort);
      this.listenTo(this, 'change:searchMode', this.sortStations);
    },

    toJSON: function () {
      var attrs = this.attributes,
          nearestStation = this.getNearestStation();

      return $.extend({}, attrs, {
        nearestStation: nearestStation && nearestStation.toJSON()
      });
    },

    sortStations: function () {
      // defer to make things more responsive
      _.defer(_.bind(function () {
        this.targetStations.sort();
      }, this));
    },

    getNearestStation: function (count) {
      return this.targetStations.first(count);
    },

    getSearchMode: function () {
      return this.get('searchMode') === 'bike' ? 'bike' : 'dock';
    },

    setSearchMode: function (newMode) {
      this.set('searchMode', newMode === 'bike' ? 'bike' : 'dock');
    },

    toggleSearchMode: function () {
      var targetMode = { bike: 'dock', dock: 'bike' }[this.get('searchMode')];
      this.set('searchMode', targetMode);
    },

    setInitializeFlag: function (service) {
      var allDone = false;

      this.initializedServices[service] = true;
      this.trigger('ready:' + service, service);

      allDone = _.every(this.initializedServices, function (service) {
        return !!service;
      });

      if (allDone) {
        this.trigger('ready:all', 'all');
        this.setInitializeFlag = function () {}; //set noop
      }
    },

    onStationsSort: function (stations) {
      var nearestStation = stations.first(),
          currentTarget = this.get('targetStation');

      if (nearestStation !== currentTarget) {
        this.set('targetStation', stations.first());
        this.trigger('targetstation:new', stations);
      } else {
        this.trigger('targetstation:update', stations);
      }

      this.trigger('stationpoll:success');
      this.setInitializeFlag('stations');
    },

    startGeoListening: function () {
      var user = this;

      this.getCurrentLocation(true);
      this.fetchTargetStations();

      this.pollingId = setInterval(function () {
        user.pollCounter += User.TIMER_INTERVAL;

        if (user.pollCounter % User.USER_POLL_INTERVAL === 0) {
          user.getCurrentLocation(user.pollCounter % User.USER_POLL_SORT_INTERVAL === 0);
        }
        if (user.pollCounter % User.STATION_POLL_INTERVAL === 0) {
          user.fetchTargetStations();
        }
      }, User.TIMER_INTERVAL);
    },

    stopGeoListening: function () {
      clearInterval(this.pollingId);
    },

    fetchTargetStations: function () {
      this.targetStations.fetch();
      this.trigger('stationpoll:start');
    },

    getCurrentLocation: function (andSort) {
      if (this.locationPollInProgress) { return; }

      var boundSuccess = _.bind(this.onCurrentPositionSuccess, this, andSort),
          boundError = _.bind(this.onCurrentPositionError, this);

      this.locationPollInProgress = true;
      this.trigger('locationpoll:start');
      this.geoApi.getCurrentPosition(boundSuccess, boundError, this.geoOptions);
    },

    onCurrentPositionSuccess: function (andSort, position) {
      var newCoords = _.pick(position.coords, ['latitude', 'longitude']);

      this.setCoordinates(newCoords);
      if (!this.targetStations.isEmpty() && (!this.initializedServices.user || andSort)) {
        this.sortStations();
      }

      this.setInitializeFlag('user');
      this.locationPollInProgress = false;
      this.trigger('locationpoll:success', newCoords);
    },

    onCurrentPositionError: function (err) {
      this.locationPollInProgress = false;
      this.trigger('locationpoll:error', err);
    }
  }, {
    TIMER_INTERVAL: 1000,
    STATION_POLL_INTERVAL: 12000,
    USER_POLL_INTERVAL: 5000,
    USER_POLL_SORT_INTERVAL: 15000
  });
  _.extend(User.prototype, WithGeo);

  return User;
});