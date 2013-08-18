/*global define, SEEDS */
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
      this.currentUser = new User({}, { seedStations: SEEDS.stations });

      this.listenToOnce(this.currentUser, 'ready', function () {
        $('body').removeClass('loading');
      });

      this.listenTo(this.currentUser, 'all', this.updateDebugInfo);

      this.currentUser.startGeoListening();
    },

    render: function () {
      this.$el.html(this.template());

      this.navView = new NavView({ user: this.currentUser, el: this.$('.nav-view') }).render();
      this.guideView = new GuideView({ user: this.currentUser, el: this.$('.guide-view') }).render();
      this.dashView = new DashView({ user: this.currentUser, el: this.$('.dash-view') }).render();

      return this;
    },

    updateDebugInfo: function (text) {
      $('.debug-holder').text(Math.round(+new Date()/1000) + ' - ' + text);
    }
  });

  return AppView;
});