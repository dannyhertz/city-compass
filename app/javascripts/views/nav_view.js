/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../templates/nav_view.hbs'
], function($, _, Backbone, Handlebars, navViewTemplate) {

  var NavView = Backbone.View.extend({
    template: Handlebars.compile(navViewTemplate),

    events: {
      'click .mode-link': 'onModeClick'
    },

    initialize: function (opts) {
      this.currentUser = opts.user;
      this.listenTo(this.currentUser, 'change:searchMode', this.render);
    },

    render: function () {
      var templateData = { searchMode: this.currentUser.get('searchMode') };
      this.$el.html(this.template(templateData));

      this.$modeBtn = this.$('.mode-link');

      return this;
    },

    onModeClick: function (e) {
      e.preventDefault();
      this.currentUser.toggleSearchMode();
    }
  });

  return NavView;
});