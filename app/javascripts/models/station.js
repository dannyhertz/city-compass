/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'mixins/with_geo'
], function($, _, Backbone, WithGeo) {

  var Station = Backbone.Model.extend({
    initialize: function () {},

    isInService: function () {
      return this.get('statusKey') === 1;
    },

    hasAvailableBikes: function () {
      return this.isInService() && this.get('availableBikes') > (0 + this.confidencePadding());
    },

    hasAvailableDocks: function () {
      return this.isInService() && this.get('availableDocks') > (0 + this.confidencePadding());
    },

    confidencePadding: function () {
      var refreshTime = new Date(this.get('updatedAt')),
          currentTime = new Date();

      return Math.min(currentTime.getMinutes() - refreshTime.getMinutes(), Station.MAX_PADDING);
    }
  },
  {
    MAX_PADDING: 3
  });
  _.extend(Station.prototype, WithGeo);

  return Station;
});