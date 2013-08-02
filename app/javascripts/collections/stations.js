/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'models/station'
], function($, _, Backbone, Station) {

  var Stations = Backbone.Collection.extend({
    model: Station,
    url: '/api/stations',

    initialize: function (attrs, opts) {
      if (!opts.user) {
        throw new Error('Stations must have user references.');
      }

      this.userReference = opts.user;
    },

    comparator: function (station) {
      var compareVal;

      compareVal = station.distanceBetween(this.userReference);
      if (this.hasComparePenalty(station)) {
        compareVal *= 100;
      }

      return compareVal;
    },

    hasComparePenalty: function (station) {
      var searchMode = this.userReference.getSearchMode(),
          availabilityMethod;

      if (searchMode === 'bike') {
        availabilityMethod = 'hasAvailableBikes';
      } else {
        availabilityMethod = 'hasAvailableDocks';
      }

      return !station[availabilityMethod]();
    }
  });

  return Stations;
});