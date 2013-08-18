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
    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: '<%= yeoman.app %>/javascripts',
          mainConfigFile: '<%= yeoman.app %>/javascripts/main.js',
          out: '<%= yeoman.build %>/javascripts/app.min.js',
          optimize: 'uglify',
          findNestedDependencies: true,
          wrap: true,
          paths: {
            'templates': 'templates'
          },
          preserveLicenseComments: false,
          useStrict: true
        }
      }
    },
    bower: {
      all: {
        rjsConfig: '<%= yeoman.app %>/javascripts/main.js'
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: 'JST',
          amd: true
        },
        files: {
          '<%= yeoman.build %>/javascripts/templates.js': ['<%= yeoman.app %>/javascripts/templates/*.hbs']
        }
      }
    }
  });

  grunt.registerTask('createDefaultTemplate', function () {
    grunt.file.write('.tmp/javascripts/templates.js', 'this.JST = this.JST || {};');
  });

  grunt.registerTask('build', [
    'jshint',
    'handlebars',
    'requirejs'
  ]);

  grunt.registerTask('server', [
    'handlebars',
    'express:dev',
    'watch'
  ]);

  grunt.registerTask('default', [
    'jshint'
  ]);
};
