/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'mixins/with_view_text_utils',
  'text!../templates/dash_view.hbs'
], function($, _, Backbone, Handlebars, WithViewTextUtils, dashViewTemplate) {

  var DashView = Backbone.View.extend({
    template: Handlebars.compile(dashViewTemplate),

    initialize: function (opts) {
      this.currentUser = opts.user;
      window.user = this.currentUser;

      this.listenTo(this.currentUser, 'targetstations:update', this.updateCurrentStation);
    },

    render: function () {
      var nearestStation = this.currentUser.getNearestStation(),
          templateData;

      templateData = nearestStation ? this.getDashData(this.currentUser, nearestStation) : {};
      this.$el.html(this.template(templateData));

      this.$stationName = this.$('.station-name:first');

      this.$targetCount = this.$('.quantity-stat strong:first');
      this.$targetMode = this.$('.quantity-stat small:first');

      this.$targetDistance = this.$('.distance-stat strong:first');
      this.$targetUnits = this.$('.distance-stat small:first');

      return this;
    },

    updateDashStation: function (user, station) {
      var dashData = this.getDashData(user, station);

      console.log('updating the station bitch', dashData);

      this.$stationName.text(dashData.name);

      //this.$targetCount.text(dashData.quantity);
      //console.log('animating', this.$targetCount, ' to ', dashData.quantity);
      this.animateNumberElem(this.$targetCount, dashData.quantity);
      this.$targetMode.text(dashData.mode + 's');

      this.$targetDistance.text(dashData.distance);
      this.$targetUnits.text(dashData.units);
    },

    updateCurrentStation: function () {
      this.updateDashStation(this.currentUser, this.currentUser.getNearestStation());
    },

    getDashData: function (user, station) {
      var targetDistance = user.formatedDistanceBetween(station),
          searchMode = user.getSearchMode();

      return {
        name: station.getStationName(),
        distance: targetDistance.distance,
        units: targetDistance.unit,
        quantity: station.getSearchQuantity(searchMode),
        mode: searchMode
      };
    }
  });
  _.extend(DashView.prototype, WithViewTextUtils);

  return DashView;
});