/*global define, google*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../templates/guide_view.hbs'
], function($, _, Backbone, Handlebars, guideViewTemplate) {

  var GuideView = Backbone.View.extend({
    template: Handlebars.compile(guideViewTemplate),

    mapOptions: {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 16,
      disableDefaultUI: true,
      panControl: false,
      zoomControl: false,
      scaleControl: false,
      streetViewControl: false,
      disableDoubleClickZoom: true,
      overviewMapControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    },

    initialize: function (opts) {
      this.currentUser = opts.user;

      this.listenTo(this.currentUser, 'targetstations:update', this.onStationSort);
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
      this.map = new google.maps.Map($mapEl[0], this.mapOptions);
    },

    attachMapEvents: function () {
      if (this.map) {
        google.maps.event.addListener(this.map, 'dragend', _.bind(this.onMapDrag, this));
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

    panToStationAndMark: function (station, replaceMark) {
      var stationCoords = station.getCoordinates(),
          stationMapCoords = new google.maps.LatLng(stationCoords.latitude, stationCoords.longitude);

      if (this.latestMarker && stationMapCoords.equals(this.latestMarker.getPosition())) {
        return;
      }

      if (replaceMark && this.latestMarker) {
        this.latestMarker.setMap(null);
      }

      this.map.panTo(stationMapCoords);
      this.latestMarker = new google.maps.Marker({
        map: this.map,
        position: stationMapCoords,
        animation: google.maps.Animation.DROP
      });
    },

    panToLatestMarker: function () {
      if (this.map && this.latestMarker) {
        this.map.panTo(this.latestMarker.getPosition());
      }
    },

    onMapResize: _.debounce(function () {
      this.panToLatestMarker();
    }, 250),

    onMapDrag: function () {
      setTimeout(_.bind(this.panToLatestMarker, this), 200);
    },

    onStationSort: function (stations) {
      var nearestStation = this.currentUser.getNearestStation();
      this.panToStationAndMark(nearestStation, true);
    }
  });

  return GuideView;
});