define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../templates/header_view.hbs',
], function($, _, Backbone, HandleBars, headerViewTemplate) {

  var HeaderView = Backbone.View.extend({
    template: Handlebars.compile(headerViewTemplate),

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

  return HeaderView;
});