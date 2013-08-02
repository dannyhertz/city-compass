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
      searchMode: 'bike',
      pollTick: 0
    },

    initialize: function (attributes, options) {
      if (!navigator) {
        throw new Error('Geo API is not support.');
      }

      this.geoApi = navigator.geolocation;
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

    getNearestStation: function () {
      return this.targetStations.first();
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

    startLocationPolling: function () {
      this.trigger('locationpoll:start');
      return this.pollingId = this.geoApi.watchPosition(_.bind(this.onLocationPollingProgress, this));
    },

    stopLocationPolling: function () {
      this.trigger('locationpoll:stop');
      this.geoApi.clearWatch(this.pollingId);
    },

    onLocationPollingProgress: function (position) {
      var newCoords = _.pick(position.coords, ['latitude', 'longitude']),
          currentPollTick = this.get('pollTick');

      this.setCoordinates(newCoords);

      if (this.targetStations.isEmpty() || currentPollTick % User.POLL_TICK_SENSITIVITY === 0) {
        this.targetStations.fetch();
      } else {
        this.targetStations.sort();
      }
      this.set('pollTick', currentPollTick + 1);

      this.trigger('locationpoll:progress', newCoords);
    },

    onLocationPollingError: function (err) {
      this.trigger('locationpoll:error', err);
    },

    onStationsSort: function (stations) {
      this.trigger('targetstations:sort', stations);
    }
  }, {
    POLL_TICK_SENSITIVITY: 2
  });
  _.extend(User.prototype, WithGeo);

  return User;
});