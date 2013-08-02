define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../templates/dash_view.hbs',
], function($, _, Backbone, HandleBars, dashViewTemplate) {

  var DashView = Backbone.View.extend({
    template: Handlebars.compile(dashViewTemplate),

    initialize: function (opts) {
      this.currentUser = opts.user;

      this.listenTo(this.currentUser, 'change:coordinates', this.render);
      this.listenTo(this.currentUser, 'targetstations:sort', this.render);
    },

    render: function () {
      var nearestStation = this.currentUser.getNearestStation(),
          templateData;


      templateData = nearestStation ? {
        targetStation: nearestStation && nearestStation.toJSON(),
        targetDistance: this.currentUser.distanceBetween(nearestStation, 'ft'),
        isBikeMode: this.currentUser.getSearchMode() === 'bike'
      } : {};

      console.log('rendering with: ', templateData);
      this.$el.html(this.template(templateData));

      return this;
    }
  });

  return DashView;
});