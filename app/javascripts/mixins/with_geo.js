/*global define*/
'use strict';

define([], function() {

  function degToRad(deg) {
    return deg * (Math.PI / 180);
  }

  function distanceBetweenPoints(point1, point2) {
    var R = 6371 * 1000, // Radius of the earth in meters
        dLat, dLon, a, c;

    dLat = degToRad(point2.latitude - point1.latitude);
    dLon = degToRad(point2.longitude - point1.longitude);
    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(point1.latitude)) * Math.cos(degToRad(point2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  return {
    getCoordinates: function () {
      return this.get('coordinates') || {
        latitude: 0,
        longitude: 0
      };
    },

    setCoordinates: function (coords) {
      return this.set('coordinates', coords);
    },

    distanceBetween: function (otherGeo, unit) {
      var unit = unit === 'ft' ? 'ft' : 'm',
          distance;

      distance = distanceBetweenPoints(this.getCoordinates(), otherGeo.getCoordinates());
      if (unit === 'ft') {
        distance *= 3.28084;
      }

      return parseInt(distance, 10);
    }
  }
});