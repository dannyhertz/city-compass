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
      maximumAge : 10000,
      timeout : 10000
    },
    initializedServices: {
      user: false,
      stations: false
    },

    initialize: function (attrs, opts) {
      var seedStations = (opts || {}).seedStations || [];

      this.geoApi = window.navigator.geolocation;
      this.targetStations = new Stations(seedStations, { user: this });

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
      allDone = _.every(this.initializedServices, function (service) {
        return !!service;
      });

      if (allDone) {
        this.trigger('ready');
        this.setInitializeFlag = function () {}; //set noop
      }
    },

    getCurrentLocation: function () {
      var boundSuccess = _.bind(this.onCurrentPositionSuccess, this),
          boundError = _.bind(this.onCurrentPositionError, this);

      this.geoApi.getCurrentPosition(boundSuccess, boundError, this.geoOptions);
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

      this.setInitializeFlag('stations');
    },

    startGeoListening: function () {
      this.startLocationPolling();
      this.startStationPolling();
    },

    stopGeoListening: function () {
      this.stopLocationPolling();
      this.stopStationPolling();
    },

    startLocationPolling: function () {
      this.trigger('locationpoll:start');

      this.getCurrentLocation();
      this.locationPollingId = setInterval(_.bind(function () {
        this.getCurrentLocation();
      }, this), User.USER_POLL_INTERVAL);

      return this.locationPollingId;
    },

    stopLocationPolling: function () {
      this.trigger('locationpoll:stop');
      this.geoApi.clearWatch(this.locationPollingId);
    },

    startStationPolling: function () {
      this.trigger('stationpoll:start');

      this.targetStations.fetch();
      this.stationPollingId = setInterval(_.bind(function () {
        this.targetStations.fetch();
      }, this), User.STATION_POLL_INTERVAL);

      return this.stationPollingId;
    },

    stopStationPolling: function () {
      this.trigger('stationpoll:stop');
      clearInterval(this.stationPollingId);
    },

    onCurrentPositionSuccess: function (position) {
      var newCoords = _.pick(position.coords, ['latitude', 'longitude']);

      this.setCoordinates(newCoords);
      this.setInitializeFlag('user');
      if (!this.targetStations.isEmpty() && this.distanceBetween(newCoords > 25)) {
        this.sortStations();
      }

      this.trigger('locationpoll:progress', newCoords);
    },

    onCurrentPositionError: function (err) {
      this.trigger('locationpoll:error', err);
    }
  }, {
    STATION_POLL_INTERVAL: 15000,
    USER_POLL_INTERVAL: 5000
  });
  _.extend(User.prototype, WithGeo);

  return User;
});