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
    compassjs: {
      exports: 'Compass'
    }
  },
  paths: {
    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone-amd/backbone',
    underscore: '../bower_components/underscore-amd/underscore',
    text: '../bower_components/requirejs-text/text',
    handlebars: '../bower_components/handlebars/handlebars',
    compassjs: '../bower_components/compass-js/index'
  }
});

require([
  'jquery',
  'backbone',
  'views/app_view'
], function ($, Backbone, AppView) {

  var $mainContainer, appView;

  $mainContainer = $('#main-view');
  appView = new AppView({ el: $mainContainer }).render();

});
