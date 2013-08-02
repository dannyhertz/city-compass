/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'mixins/with_geo'
], function($, _, Backbone, WithGeo) {

  function dateFromString(str) {
    var a = $.map(str.split(/[^0-9]/), function(s) { return parseInt(s, 10) });
    return new Date(a[0], a[1]-1 || 0, a[2] || 1, a[3] || 0, a[4] || 0, a[5] || 0, a[6] || 0);
  }

  var Station = Backbone.Model.extend({
    initialize: function (attributes, options) {
      this.set('coordinates', {
        latitude: attributes.latitude,
        longitude: attributes.longitude
      }, { silent: true });
    },

    toJSON: function () {
      var attrs = this.attributes;

      return $.extend({}, attrs, {
        stationName: this.getStationName(),
        hasAvailableBikes: this.hasAvailableBikes(),
        hasAvailableDocks: this.hasAvailableDocks(),
        estimatedBikeCount: this.estimatedBikeCount(),
        estimatedDockCount: this.estimatedDockCount()
      });
    },

    getStationName: function () {
      return this.get('stationName')
        .replace(/Street/gi, 'St')
        .replace(/Avenue/gi, 'Ave');
    },

    isInService: function () {
      return this.get('statusKey') === 1;
    },

    estimatedBikeCount: function () {
      return Math.max(0, this.get('availableBikes') - this.confidencePadding());
    },

    estimatedDockCount: function () {
      return Math.max(0, this.get('availableDocks') - this.confidencePadding());
    },

    hasAvailableBikes: function () {
      return this.isInService() && this.get('availableBikes') > (0 + this.confidencePadding());
    },

    hasAvailableDocks: function () {
      return this.isInService() && this.get('availableDocks') > (0 + this.confidencePadding());
    },

    confidencePadding: function () {
      var refreshTime = dateFromString(this.get('updatedAt')),
          currentTime = new Date();

      return Math.min(currentTime.getMinutes() - refreshTime.getMinutes() + 1, Station.MAX_PADDING);
    }
  },
  {
    MAX_PADDING: 3
  });
  _.extend(Station.prototype, WithGeo);

  return Station;
});