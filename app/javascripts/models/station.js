/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'mixins/with_geo'
], function($, _, Backbone, WithGeo) {

  var Station = Backbone.Model.extend({
    initialize: function (attributes) {},

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
      return this.get('label')
        .replace(/Street/gi, 'St')
        .replace(/Avenue/gi, 'Ave')
        .replace(/Terrace/gi, 'Ter');
    },

    getSearchQuantity: function (searchMode) {
      var searchModeType = searchMode.charAt(0).toUpperCase() + searchMode.substring(1).toLowerCase();
      return this['estimated' + searchModeType + 'Count']();
    },

    isInService: function () {
      return true;
    },

    estimatedBikeCount: function () {
      return Math.max(0, this.get('availableBikes') - this.confidencePadding());
    },

    estimatedDockCount: function () {
      return Math.max(0, this.get('availableDocks') - this.confidencePadding());
    },

    hasAvailableBikes: function () {
      return this.isInService() && this.estimatedBikeCount() > 0;
    },

    hasAvailableDocks: function () {
      return this.isInService() && this.estimatedDockCount() > 0;
    },

    confidencePadding: function () {
      var refreshTime = new Date(this.get('updatedAt') * 1000),
          currentTime = new Date(),
          minDifference = currentTime.getMinutes() - refreshTime.getMinutes();

      return minDifference > 3 ? 1 : 0;
    }
  },
  {
    MAX_PADDING: 2
  });
  _.extend(Station.prototype, WithGeo);

  return Station;
});