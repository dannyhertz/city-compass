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

      this.listenTo(this.currentUser, 'targetstation:new targetstation:update', this.updateCurrentStation);
      this.listenTo(this.currentUser, 'change:searchMode', this.updateCurrentStation);
    },

    render: function () {
      var nearestStation = this.currentUser.getNearestStation(),
          templateData;

      templateData = nearestStation ? this.getDashData(this.currentUser, nearestStation) : {};
      this.$el.html(this.template(templateData));

      this.$targetAddress = this.$('.target-address:first');

      this.$targetQuantity = this.$('.target-quantity:first');
      this.$targetType = this.$('.target-type:first');

      this.$targetRange = this.$('.target-range:first');
      this.$targetUnit = this.$('.target-unit:first');

      return this;
    },

    updateDashStation: function (user, station) {
      var dashData = this.getDashData(user, station);

      this.$targetAddress.text(dashData.name);

      //this.$targetQuantity.text(dashData.quantity);
      this.animateNumberElem(this.$targetQuantity, dashData.quantity);
      this.$targetType.text(dashData.mode + 's');

      this.$targetRange.text(dashData.distance);
      this.$targetUnit.text(dashData.units);
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