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

    initialize: function () {
      this.geoApi = window.navigator.geolocation;

      this.targetStations = new Stations([], { user: this });

      this.listenTo(this.targetStations, 'sort', this.onStationsSort);
    },

    toJSON: function () {
      var attrs = this.attributes,
          nearestStation = this.getNearestStation();

      return $.extend({}, attrs, {
        nearestStation: nearestStation && nearestStation.toJSON()
      });
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
      this.targetStations.sort();
    },

    onStationsSort: function (stations) {
      this.set('targetStation', stations.first());
      this.trigger('targetstations:update', stations);
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
      this.locationPollingId = this.geoApi.watchPosition(_.bind(this.onLocationPollingProgress, this));

      return this.locationPollingId;
    },

    stopLocationPolling: function () {
      this.trigger('locationpoll:stop');
      this.geoApi.clearWatch(this.locationPollingId);
    },

    startStationPolling: function () {
      this.trigger('stationpoll:start');
      this.stationPollingId = setInterval(_.bind(function () {
        this.targetStations.fetch();
      }, this), User.STATION_POLL_INTERVAL);

      return this.stationPollingId;
    },

    stopStationPolling: function () {
      this.trigger('stationpoll:stop');
      clearInterval(this.stationPollingId);
    },

    onLocationPollingProgress: function (position) {
      var newCoords = _.pick(position.coords, ['latitude', 'longitude']);

      this.setCoordinates(newCoords);

      if (this.targetStations.isEmpty()) {
        this.targetStations.fetch();
      } else {
        this.targetStations.sort();
      }

      this.trigger('locationpoll:progress', newCoords);
    },

    onLocationPollingError: function (err) {
      console.log('Location polling error:', err);
      this.trigger('locationpoll:error', err);
    }
  }, {
    STATION_POLL_INTERVAL: 10000
  });
  _.extend(User.prototype, WithGeo);

  return User;
});