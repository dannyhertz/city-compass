/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/user',
  'views/nav_view',
  'views/guide_view',
  'views/dash_view',
  'text!../templates/main_view.hbs'
], function($, _, Backbone, Handlebars, User, NavView, GuideView, DashView, mainViewTemplate) {

  var AppView = Backbone.View.extend({
    template: Handlebars.compile(mainViewTemplate),

    initialize: function () {
      this.currentUser = new User();
      this.currentUser.startGeoListening();

      this.listenTo(this.currentUser, 'change:coordinates', this.onUserLocationChange);
    },

    render: function () {
      this.$el.html(this.template());

      this.navView = new NavView({ user: this.currentUser, el: this.$('.nav-view') }).render();
      this.guideView = new GuideView({ user: this.currentUser, el: this.$('.guide-view') }).render();
      this.dashView = new DashView({ user: this.currentUser, el: this.$('.dash-view') }).render();

      return this;
    },

    onUserLocationChange: function (user, coordinates) {
      // console.log('new user location:', coordinates);
    }
  });

  return AppView;
});