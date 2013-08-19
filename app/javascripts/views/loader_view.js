/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../templates/loader_view.hbs'
], function($, _, Backbone, Handlebars, loaderViewTemplate) {

  var LoaderView = Backbone.View.extend({
    template: Handlebars.compile(loaderViewTemplate),

    initialize: function (opts) {
      this.currentUser = opts.user;

      this.listenTo(this.currentUser, 'ready:user', this.handleReadyUpdate);
      this.listenTo(this.currentUser, 'ready:stations', this.handleReadyUpdate);
      this.listenTo(this.currentUser, 'ready:all', this.handleReadyUpdate);
    },

    render: function () {
      var templateData = {};
      this.$el.html(this.template(templateData));

      return this;
    },

    handleReadyUpdate: function (type) {
      if (type === 'all') {
        this.$el.addClass('hide');
      } else {
        this.$('.' + type + '-progress').addClass('ready');
      }
    }
  });

  return LoaderView;
});