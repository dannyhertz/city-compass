/*global define*/
'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'hbs!../templates/nav_view'
], function($, _, Backbone, navViewTemplate) {

  var NavView = Backbone.View.extend({
    template: navViewTemplate,

    events: {
      'click .mode-btn': 'onModeClick',
      'touchend .mode-btn': 'onModeClick',

      'click .skip-btn': 'onSkipClick',
      'touchend .skip-btn': 'onSkipClick'
    },

    initialize: function (opts) {
      this.currentUser = opts.user;
      this.listenTo(this.currentUser, 'change:searchMode', this.updateModeToggle);
    },

    render: function () {
      var templateData = { searchMode: this.currentUser.get('searchMode') };
      this.$el.html(this.template(templateData));

      this.$modeToggle = this.$('.mode-toggle');

      return this;
    },

    onModeClick: function (e) {
      e.preventDefault();

      var targetMode = $(e.currentTarget).data('type');

      this.updateModeToggle(null, targetMode);
      this.currentUser.setSearchMode(targetMode);
    },

    onSkipClick: function (e) {
      e.preventDefault();
      this.currentUser.skipCurrentStation();
    },

    updateModeToggle: function (user, mode) {
      this.$modeToggle.removeClass('bike-mode dock-mode');
      this.$modeToggle.addClass(mode + '-mode');
    }
  });

  return NavView;
});