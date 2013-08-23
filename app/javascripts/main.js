/*global require*/
'use strict';

require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    richmarker: {
      exports: 'RichMarker'
    }
  },
  paths: {
    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone-amd/backbone',
    underscore: '../bower_components/underscore-amd/underscore',
    text: '../bower_components/requirejs-text/text',
    handlebars: '../bower_components/handlebars/handlebars',
    richmarker: '../bower_components/richmarker/richmarker',
    hbs: '../bower_components/require-handlebars-plugin/hbs',
    i18nprecompile: '../bower_components/require-handlebars-plugin/hbs/i18nprecompile',
    json2: '../bower_components/require-handlebars-plugin/hbs/json2'
  },
  hbs: {
    disableI18n: true,
    disableHelpers: true
  }
});

require([
  'jquery',
  'backbone',
  'views/app_view'
], function ($, Backbone, AppView) {

  var $mainContainer, appView;

  $(function () {
    $mainContainer = $('#main-view');
    appView = new AppView({ el: $mainContainer }).render();
  });

});
