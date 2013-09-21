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
      enableHighAccuracy: false,
      timeout: 5000
    },
    initializedServices: {
      user: false,
      stations: false
    },

    initialize: function (attrs, opts) {
      var seedStations = (opts || {}).seedStations || [];

      window.user = this;

      this.geoApi = window.navigator.geolocation;
      this.targetStations = new Stations(seedStations, { user: this });

      this.listenTo(this.targetStations, 'sort', this.onStationsSort);
      this.listenTo(this.targetStations, 'change:skipped', this.onStationSkip);

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

    skipCurrentStation: function () {
      var currStation = this.getNearestStation();
      if (currStation) {
        currStation.skip();
      }
    },

    onStationsSort: function (stations) {
      var nearestStation = stations.first(),
          currentTarget = this.get('targetStation');

      // Skip if only seed stations
      if (!nearestStation.has('latitude')) {
        return;
      }

      if (nearestStation !== currentTarget) {
        this.set('targetStation', stations.first());
        this.trigger('targetstation:new', stations);
      } else {
        this.trigger('targetstation:update', stations);
      }

      this.trigger('stationpoll:success');
      this.setInitializeFlag('stations');
    },

    onStationSkip: function (stations) {
      this.sortStations();
    },

    startGeoListening: function () {
      var user = this;

      user.startPostionWatching();
      user.fetchTargetStations();

      user.stationPollId = setInterval(function () {
        user.fetchTargetStations();
      }, User.STATION_POLL_INTERVAL);
    },

    stopGeoListening: function () {
      clearInterval(this.stationPollId);
    },

    fetchTargetStations: function () {
      this.targetStations.fetch();
      this.trigger('stationpoll:start');
    },

    startPostionWatching: function () {
      var boundSuccess = _.bind(this.onPositionWatchSuccess, this),
          boundError = _.bind(this.onPositionWatchError, this);

      this.trigger('positionwatch:start');
      this.geoApi.watchPosition(boundSuccess, boundError, this.geoOptions);
    },

    onPositionWatchSuccess: function (position) {
      var newCoords = _.pick(position.coords, ['latitude', 'longitude']),
          distanceDelta = this.distanceBetween(newCoords);

      this.setCoordinates(newCoords);
      if (!this.targetStations.isEmpty() && (!this.initializedServices.user || distanceDelta > 20)) {
        this.sortStations();
      }

      this.setInitializeFlag('user');
      this.trigger('positionwatch:success', newCoords);
    },

    onPositionWatchError: function (err) {
      this.trigger('positionwatch:error', err);
    }
  }, {
    STATION_POLL_INTERVAL: 15000
  });
  _.extend(User.prototype, WithGeo);

  return User;
});