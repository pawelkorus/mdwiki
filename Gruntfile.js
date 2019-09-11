/*global module:false*/
module.exports = function(grunt) {
    'use strict';
    // Project configuration.

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
    // Metadata.
        pkg: {
            name: 'MDwiki',
            version: '0.7.0'
        },
        index: {
            release: {
                template: 'index.tmpl',
                dest: 'dist/mdwiki.html'
            },
            debug: {
                template: 'index.tmpl',
                dest: 'dist/mdwiki-debug.html'
            }
        },
        lib_test: {
            src: ['lib/**/*.js', 'test/**/*.js']
        },
        copy: {
            release: {
                expand: false,
                flatten: true,
                src: [ 'dist/mdwiki.html' ],
                dest: 'release/mdwiki-<%= grunt.config("pkg").version %>/mdwiki.html'
            },
            release_debug: {
                expand: false,
                flatten: true,
                src: [ 'dist/mdwiki-debug.html' ],
                dest: 'release/mdwiki-<%= grunt.config("pkg").version %>/mdwiki-debug.html'
            },
            release_templates: {
                expand: true,
                flatten: true,
                src: [ 'release_templates/*' ],
                dest: 'release/mdwiki-<%= grunt.config("pkg").version %>/'
            },
            unittests: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: 'tmp/MDwiki.js',
                    dest: 'unittests/lib/'
                },
                {
                    expand: true,
                    flatten: true,
                    src: 'bower_components/jquery/jquery.min.js',
                    dest: 'unittests/lib/'
                }]
            }, 
            index: {
                expand: true,
                flatten: true,
                src: [ 'js/index.html' ],
                dest: 'dist/'
            }
        },
        shell: {
            zip_release: {
                options: {
                    stdout: true
                },
                command: 'cd release && zip -r mdwiki-<%= grunt.config("pkg").version %>.zip mdwiki-<%= grunt.config("pkg").version %>'
            }
        },
        'http-server': {
            'dev': {
                root:'./dist',
                port: 8080,
                host: "0.0.0.0",
                cache: 1,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",
                runInBackground: false
            }
        }
    });

    /*** NAMED TASKS ***/
    grunt.registerTask('release', [ 'copy:index' ]);
    grunt.registerTask('debug', [ 'copy:index' ]);
    grunt.registerTask('devel', [ 'debug', 'server' ]);
    grunt.registerTask('unittests', [ 'copy:unittests' ]);

    grunt.registerTask('server', [ 'http-server:dev' ]);

    grunt.registerTask('distrelease',[
        'release', 'debug',
        'copy:release', 'copy:release_debug', 'copy:release_templates',
        'shell:zip_release'
    ]);
    // Default task
    grunt.registerTask('default', [ 'release', 'debug', 'unittests' ] );
};
