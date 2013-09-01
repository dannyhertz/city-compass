'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    build: 'app/build'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      express: {
        files: ['server.js'],
        tasks: ['express:dev'],
        options: {
          nospawn: true
        }
      }
    },
    express: {
      options: {
        script: 'server.js'
      },
      dev: {
        options: {
          port: 3000
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/javascripts/{,*/}*.js',
        '!<%= yeoman.app %>/javascripts/vendor/*'
      ]
    },
    cssmin: {
      minify: {
        src: '<%= yeoman.app %>/styles/main.css',
        dest: '<%= yeoman.build %>/styles/app.min.css'
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.build %>/javascripts/modernizr.min.js': '<%= yeoman.app %>/javascripts/bower_components/modernizr/modernizr.js'
        }
      }
    },
    cachebreaker : {
      options: {
        remove: ''
      },
      js: {
        asset_url: 'build/javascripts/app.min.js',
        file: 'views/index.html.ejs'
      },
      css: {
        asset_url: 'build/styles/app.min.css',
        file: 'views/index.html.ejs'
      }
    },
    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: '<%= yeoman.app %>/javascripts',
          mainConfigFile: '<%= yeoman.app %>/javascripts/main.js',
          out: '<%= yeoman.build %>/javascripts/app.min.js',
          optimize: 'uglify',
          findNestedDependencies: true,
          preserveLicenseComments: false,
          useStrict: true,
          paths: {
            requireLib: 'bower_components/requirejs/require'
          },
          include: ['requireLib']
        }
      }
    },
    bower: {
      all: {
        rjsConfig: '<%= yeoman.app %>/javascripts/main.js'
      }
    }
  });

  grunt.registerTask('default', [
    'jshint'
  ]);

  grunt.registerTask('server', [
    'express:dev',
    'watch'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'cssmin',
    'uglify',
    'requirejs',
    'cachebreaker:css',
    'cachebreaker:js'
  ]);
};
