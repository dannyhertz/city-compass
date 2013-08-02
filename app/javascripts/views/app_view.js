define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/user',
  'views/header_view',
  'views/dash_view',
  'text!../templates/main_view.hbs',
], function($, _, Backbone, HandleBars, User, HeaderView, DashView, mainViewTemplate) {

  var AppView = Backbone.View.extend({
    template: Handlebars.compile(mainViewTemplate),

    initialize: function () {
      this.currentUser = new User();
      this.currentUser.startLocationPolling();

      this.headerView = new HeaderView({ user: this.currentUser });
      this.dashView = new DashView({ user: this.currentUser });

      this.listenTo(this.currentUser, 'change:coordinates', this.onUserLocationChange);
    },

    render: function () {
      this.$el.html(this.template());

      this.$('.header-view').html(this.headerView.render().$el);
      this.$('.dash-view').html(this.dashView.render().$el);

      return this;
    },

    onUserLocationChange: function (user, coordinates) {
      console.log('new user location:', coordinates);
    }
  });

  return AppView;
});