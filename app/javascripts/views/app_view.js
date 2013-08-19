/*global define, SEEDS */
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/user',
  'views/loader_view',
  'views/nav_view',
  'views/guide_view',
  'views/dash_view',
  'text!../templates/app_view.hbs'
], function($, _, Backbone, Handlebars, User, LoaderView, NavView, GuideView, DashView, appViewTemplate) {

  var AppView = Backbone.View.extend({
    template: Handlebars.compile(appViewTemplate),

    initialize: function () {
      this.currentUser = new User({}, { seedStations: SEEDS.stations });

      this.currentUser.startGeoListening();
    },

    render: function () {
      this.$el.html(this.template());

      this.navView = new NavView({ user: this.currentUser, el: this.$('.nav-view') }).render();
      this.guideView = new GuideView({ user: this.currentUser, el: this.$('.guide-view') }).render();
      this.dashView = new DashView({ user: this.currentUser, el: this.$('.dash-view') }).render();
      this.loaderView = new LoaderView({ user: this.currentUser, el: this.$('.loader-view') }).render();

      return this;
    }
  });

  return AppView;
});