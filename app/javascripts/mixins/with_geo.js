/*global define*/
'use strict';

define([], function() {

  function degToRad(deg) {
    return deg * (Math.PI / 180);
  }

  function radToDeg(rad) {
    return rad * 180 / Math.PI;
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

  function bearingBetweenPoints(point1, point2) {
    var dLon, y, x, brng;

    dLon = (point2.longitude - point1.longitude);
    y = Math.sin(dLon) * Math.cos(point2.latitude);
    x = Math.cos(point1.latitude) * Math.sin(point2.latitude) -
            Math.sin(point1.latitude) * Math.cos(point2.latitude) * Math.cos(dLon);
    brng = radToDeg(Math.atan2(y, x));

    return 360 - ((brng + 360) % 360);
  }

  return {
    hasCoordinates: function () {
      return this.get('latitude') !== undefined &&
             this.get('longitude') !== undefined;
    },

    getCoordinates: function () {
      return {
        latitude: this.get('latitude'),
        longitude: this.get('longitude')
      };
    },

    setCoordinates: function (coords) {
      var newCoords = this.set({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      this.trigger('change:coordinates', this, coords);

      return newCoords;
    },

    distanceBetween: function (otherGeo) {
      var distance = distanceBetweenPoints(this.getCoordinates(), otherGeo.getCoordinates());
      return distance;
    },

    bearingBetween: function (otherGeo, northOffset) {
      var bearing = bearingBetweenPoints(this.getCoordinates(), otherGeo.getCoordinates());
      return bearing + (northOffset || 0);
    },

    formatedDistanceBetween: function (otherGeo) {
      var distanceInMeters = this.distanceBetween(otherGeo),
          newDistance, newUnit, newRoundedDistance;

      if (distanceInMeters > 160) {
        newDistance = distanceInMeters / 1609.34;
        newRoundedDistance = Math.round(newDistance * 10)/10,
        newUnit = 'mi';
      } else {
        newDistance = distanceInMeters * 3.28084;
        newRoundedDistance = Math.round(newDistance);
        newUnit = 'ft';
      }

      return {
        distance: newRoundedDistance,
        unit: newUnit
      };
    }
  };
});