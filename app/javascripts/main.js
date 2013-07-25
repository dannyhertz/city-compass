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
      exports: "Handlebars"
    }
  },
  paths: {
    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone-amd/backbone',
    underscore: '../bower_components/underscore-amd/underscore',
    handlebars: '../bower_components/handlebars/handlebars'
  }
});

require([
  'jquery',
  'backbone',
  'views/app',
  'collections/stations'
], function ($, Backbone, AppView, Stations) {

  var stations = new Stations();
  window.stations = stations;

});
