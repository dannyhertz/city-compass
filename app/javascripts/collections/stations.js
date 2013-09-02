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
    url: function () {
      return '/api/stations?update=' + !this.isEmpty();
    },

    initialize: function (attrs, opts) {
      if (!opts.user) {
        throw new Error('Stations must have user references.');
      }

      this.userReference = opts.user;
    },

    comparator: function (station) {
      var compareVal;

      compareVal = station.distanceBetween(this.userReference);
      if (this.hasComparePenalty(station) || station.get('skipped')) {
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