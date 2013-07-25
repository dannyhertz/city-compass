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

    initialize: function () {},

    comparator: function (station) {
      console.log('reference is', this.referencePoint);
      return this.referencePoint ? station.distanceBetween(this.referencePoint) : 1;
    },

    updateReferencePoint: function (newPoint) {
      this.referencePoint = newPoint;
      this.sort();
    }
  });

  return Stations;
});