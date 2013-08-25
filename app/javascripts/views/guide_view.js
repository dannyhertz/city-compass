/*global define, google*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'richmarker',
  'hbs!../templates/guide_view',
  'hbs!../templates/map_marker'
], function($, _, Backbone, RichMarker, guideViewTemplate, markerTemplate) {

  var GuideView = Backbone.View.extend({
    template: guideViewTemplate,
    markerTemplate: markerTemplate,

    markerTypes: {
      google: google.maps.Marker,
      custom: RichMarker
    },

    mapDefaultOptions: {
      center: new google.maps.LatLng(0, 0),
      zoom: 17,
      disableDefaultUI: true,
      panControl: false,
      zoomControl: false,
      scrollwheel: false,
      scaleControl: false,
      streetViewControl: false,
      disableDoubleClickZoom: true,
      overviewMapControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    },

    initialize: function (opts) {
      this.currentUser = opts.user;

      this.listenTo(this.currentUser, 'targetstation:new', this.onNewTargetStation);
      this.listenTo(this.currentUser, 'change:coordinates', this.onUserLocationChange);
    },

    render: function () {
      var nearestStation = this.currentUser.getNearestStation(),
          templateData;

      templateData = nearestStation ? {
        targetStation: nearestStation && nearestStation.toJSON(),
        targetBearing: this.currentUser.bearingBetween(nearestStation)
      } : {};

      this.$el.html(this.template(templateData));
      this.$mapHolder = this.$('.map-holder');

      this.renderMap(this.$mapHolder);

      this.attachMapEvents();

      return this;
    },

    remove: function () {
      this.detachMapEvents();
      Backbone.Model.prototype.remove.apply(this, arguments);
    },

    renderMap: function ($mapEl) {
      google.maps.visualRefresh = true;
      this.map = new google.maps.Map($mapEl[0], this.mapDefaultOptions);
    },

    renderMarker: function (type) {
      return this.markerTemplate({ type: type || 'self' });
    },

    renderNearbyStations: function (targetStation) {
      var nearbyMarkers = targetStation.get('nearbyStations').map(function (station) {
        var currentStation = this.currentUser.targetStations.get(station.id);
        return currentStation ? this.createMarker({
          coords: currentStation.getCoordinates(),
          animation: false,
          type: 'custom',
          subType: 'station'
        }) : null;
      }, this);

      this.nearbyMarkers = _.compact(nearbyMarkers);
    },

    removeNearybyStations: function (targetStation) {
      if (this.nearbyMarkers) {
        this.nearbyMarkers.forEach(function (marker) {
          marker.setMap(null);
        }, this);
      }
    },

    attachMapEvents: function () {
      if (this.map) {
        $(window).on('resize', _.bind(this.onMapResize, this));
        google.maps.event.addListener(this.map, 'dragstart', _.bind(this.onMapDragStart, this));
        google.maps.event.addListener(this.map, 'dragend', _.bind(this.onMapDragEnd, this));
      }
    },

    detachMapEvents: function (eventName) {
      if (this.map) {
        if (name) {
          google.maps.event.clearListeners(this.map, eventName);
        } else {
          google.maps.event.clearInstanceListeners(this.map);
        }
        $(window).off('resize');
      }
    },

    normalizeMapCoords: function (coords) {
      var mapCoords = coords instanceof google.maps.LatLng ? coords :
        new google.maps.LatLng(coords.latitude, coords.longitude);
      return mapCoords;
    },

    createMarker: function (options) {
      options = (options || {});

      var MarkerType = this.markerTypes[options.type] || this.markerTypes.google;

      return new MarkerType(_.extend({}, {
        map: this.map,
        position: this.normalizeMapCoords(options.coords),
        draggable: false,
        content: this.renderMarker(options.subType || 'self'),
        animation: options.animation ? google.maps.Animation.DROP : null,
        zIndex: 1
      }, options));
    },

    setUserMarker: function (mapCoords) {
      mapCoords = this.normalizeMapCoords(mapCoords);

      if (this.userMarker) {
        this.moveMarker(this.userMarker, mapCoords);
      } else {
        this.userMarker = this.createMarker({
          coords: mapCoords,
          animation: false,
          type: 'custom',
          subType: 'self'
        });
      }
    },

    setTargetMarker: function (newStation, previousStation) {
      var mapCoords = this.normalizeMapCoords(newStation.getCoordinates());
      if (this.targetMarker) {
        this.moveMarker(this.targetMarker, mapCoords);
      } else {
        this.targetMarker = this.createMarker({
          coords: mapCoords,
          animation: true,
          type: 'google'
        });
      }
    },

    moveMarker: function (marker, mapCoords) {
      marker.setPosition(this.normalizeMapCoords(mapCoords));
    },

    getFittedBounds: function (points) {
      var bounds = new google.maps.LatLngBounds(),
          midX, lowY;

      // Make this hack less... hacky?
      midX = (points[0].latitude + points[1].latitude) / 2;
      lowY = Math.min(points[0].longitude, points[1].longitude) - 0.0005;
      points.push({ latitude: midX, longitude: lowY });

      points.forEach(function (p) {
        bounds.extend(new google.maps.LatLng(p.latitude, p.longitude));
      });

      return bounds;
    },

    fitUserAndTargetStation: function (options) {
      if (this.currentUser && this.currentUser.hasCoordinates() && this.nearestStation && this.nearestStation.hasCoordinates()) {
        var fittedBounds = this.getFittedBounds([
          this.currentUser.getCoordinates(),
          this.nearestStation.getCoordinates()
        ]);

        console.log(fittedBounds);
        if (options && options.panTo) {
          this.map.panTo(fittedBounds.getCenter());
        } else {
          this.map.fitBounds(fittedBounds);
        }
      }
    },

    onMapResize: _.debounce(function () {
      this.fitUserAndTargetStation();
    }, 100),

    onMapDragEnd: function () {
      console.log('start timer');
      this.dragTimer = setTimeout(_.bind(function () {
        this.fitUserAndTargetStation({ panTo: true });
      }, this), GuideView.DRAG_TIMEOUT);
    },

    onMapDragStart: function () {
      console.log('clearing timer');
      clearTimeout(this.dragTimer);
    },

    onNewTargetStation: function (stations) {
      var oldNearestStation = this.nearestStation;

      this.nearestStation = this.currentUser.getNearestStation();
      this.setTargetMarker(this.nearestStation, oldNearestStation);

      this.removeNearybyStations();
      if (this.currentUser.distanceBetween(this.nearestStation) < 1000) {
        this.renderNearbyStations(this.nearestStation);
      }

      // Update dem bounds!
      this.fitUserAndTargetStation();
    },

    onUserLocationChange: function (user, coords) {
      var currentMapCoords = this.normalizeMapCoords(coords);
      this.setUserMarker(currentMapCoords);
    }
  }, {
    DRAG_TIMEOUT: 1500
  });

  return GuideView;
});