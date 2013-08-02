'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    express: {
      options: {
        port: 1337
      },
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
    connect: {
      test: {
        options: {
          port: 1337,
          base: 'test'
        }
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: true
      },
      express: {
        files: [
          'server.js',
          'app/javascripts/{,*/}*.js'
        ],
        tasks: ['express:dev'],
        options: {
          nospawn: true
        }
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/javascripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}'
        ]
      },
      handlebars: {
        files: ['<%= yeoman.app %>/javascripts/templates/*.hbs'],
        tasks: ['handlebars']
      }
    },
    clean: {
      dist: ['.tmp', '<%= yeoman.dist %>/*'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/javascripts/{,*/}*.js',
        '!<%= yeoman.app %>/javascripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },
    jasmine: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },
    requirejs: {
      dist: {
        options: {
          baseUrl: '<%= yeoman.app %>/javascripts',
          optimize: 'none',
          paths: {
            'templates': 'templates'
          },
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true
        }
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/main.css': [
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.app %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {},
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '*.html',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'images/{,*/}*.{webp,gif}'
          ]
        }]
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
          '.tmp/javascripts/templates.js': ['<%= yeoman.app %>/javascripts/templates/*.hbs']
        }
      }
    }
  });

  grunt.registerTask('createDefaultTemplate', function () {
    grunt.file.write('.tmp/javascripts/templates.js', 'this.JST = this.JST || {};');
  });

  grunt.registerTask('build', [
    'clean:dist',
    'createDefaultTemplate',
    'handlebars',
    'requirejs',
    'imagemin',
    'htmlmin',
    'concat',
    'cssmin',
    'uglify',
    'copy',
  ]);

  grunt.registerTask('server', [
    'createDefaultTemplate',
    'handlebars',
    'express:dev',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'createDefaultTemplate',
    'handlebars',
    'connect:test',
    'jasmine'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
