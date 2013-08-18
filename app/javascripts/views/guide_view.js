/*global define, google*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'richmarker',
  'text!../templates/guide_view.hbs',
  'text!../templates/map_marker.hbs'
], function($, _, Backbone, Handlebars, RichMarker, guideViewTemplate, markerTemplate) {

  var GuideView = Backbone.View.extend({
    template: Handlebars.compile(guideViewTemplate),
    markerTemplate: Handlebars.compile(markerTemplate),

    markerTypes: {
      google: google.maps.Marker,
      custom: RichMarker
    },

    mapDefaultOptions: {
      center: new google.maps.LatLng(-34.397, 150.644),
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
      this.renderAllStations();

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

    renderAllStations: function () {
      var allStations = this.currentUser.targetStations,
          targetStation = this.currentUser.getNearestStation();

      allStations.forEach(function (station) {
        if (station !== targetStation) {
          this.createMarker({
            coords: station.getCoordinates(),
            animation: false,
            type: 'custom',
            subType: 'station'
          });
        }
      }, this);
    },

    attachMapEvents: function () {
      if (this.map) {
        $(window).on('resize', _.bind(this.onMapResize, this));
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

      var markerType = this.markerTypes[options.type] || this.markerTypes['google'];

      return new markerType(_.extend({}, {
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

    setTargetMarker: function (mapCoords) {
      mapCoords = this.normalizeMapCoords(mapCoords);

      if (this.targetMarker) {
        this.moveMarker(this.targetMarker, mapCoords);
      } else {
        this.targetMarker = this.createMarker({
          coords: mapCoords,
          animation: true,
          type: 'custom',
          subType: 'target-station station'
        });
      }
    },

    moveMarker: function (marker, mapCoords) {
      marker.setPosition(this.normalizeMapCoords(mapCoords));
    },

    getFittedBounds: function (points) {
      var bounds = new google.maps.LatLngBounds();

      points.forEach(function (p) {
        bounds.extend(new google.maps.LatLng(p.latitude, p.longitude));
      });

      return bounds;
    },

    fitUserAndTargetStation: function () {
      if (this.currentUser && this.currentUser.hasCoordinates() && this.nearestStation && this.nearestStation.hasCoordinates()) {
        var fittedBounds = this.getFittedBounds([
          this.currentUser.getCoordinates(),
          this.nearestStation.getCoordinates()
        ]);

        this.map.fitBounds(fittedBounds);

        // For now zoom out a bit so avoid overlapping
        this.map.setZoom(this.map.getZoom() - 1);
      }
    },

    onMapResize: _.debounce(function () {
      this.fitUserAndTargetStation();
    }, 250),

    onNewTargetStation: function (stations) {
      this.nearestStation = this.currentUser.getNearestStation();
      this.setTargetMarker(this.nearestStation.getCoordinates());

      // Update dem bounds!
      this.fitUserAndTargetStation();
    },

    onUserLocationChange: function (user, coords) {
      var currentMapCoords;

      // Convert coords to google coords
      if (coords instanceof google.maps.LatLng) {
        currentMapCoords = coords;
      } else {
        currentMapCoords = new google.maps.LatLng(coords.latitude, coords.longitude);
      }

      // Move the users current location
      this.setUserMarker(coords);

      // Update dem bounds!
      this.fitUserAndTargetStation();
    }
  });

  return GuideView;
});