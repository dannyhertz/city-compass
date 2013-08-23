/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'hbs!../templates/loader_view'
], function($, _, Backbone, loaderViewTemplate) {

  var LoaderView = Backbone.View.extend({
    template: loaderViewTemplate,

    initialize: function (opts) {
      this.currentUser = opts.user;

      this.listenTo(this.currentUser, 'ready:user', this.handleReadyUpdate);
      this.listenTo(this.currentUser, 'ready:stations', this.handleReadyUpdate);
      this.listenTo(this.currentUser, 'ready:all', this.handleReadyUpdate);
    },

    render: function () {
      this.$el.html(this.template({}));
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