var createIndex = function (grunt, taskname) {
    'use strict';
    var conf = grunt.config('index')[taskname],
        tmpl = grunt.file.read(conf.template);

    grunt.config.set('templatesString', '');

    // register the task name in global scope so we can access it in the .tmpl file
    grunt.config.set('currentTask', {name: taskname});

    grunt.file.write(conf.dest, grunt.template.process(tmpl));
    grunt.log.writeln('Generated \'' + conf.dest + '\' from \'' + conf.template + '\'');
};

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

        // REMEMBER:
        // * ORDER OF FILES IS IMPORTANT
        // * ALWAYS ADD EACH FILE TO BOTH minified/unminified SECTIONS!
        cssFiles: [
            'tmp/main.min.css',
        ],
        // for debug builds use unminified versions:
        unminifiedCssFiles: [
            'tmp/main.css'
        ],

        less: {
            min: {
                options: {
                    compress: true,
                },
                files: {
                    'tmp/main.min.css': 'styles/main.less',
                },
            },
            dev: {
                options: {
                    compress: false,
                },
                files: {
                    'tmp/main.css': 'styles/main.less',
                },
            },
        },

        uglify: {
            options: {
                // banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dev.dest %>',
                dest: 'tmp/<%= pkg.name %>.min.js'
            }
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
        watch: {
            files: [
                'Gruntfile.js',
                'js/*.js',
                'js/**/*.js',
                'js/ts/**/*.ts',
                'js/**/*.tsx',
                'unittests/**/*.js',
                'unittests/**/*.html',
                'templates/**/*.html',
                'index.tmpl'
            ],
            tasks: ['debug','reload' ]
        },
        'http-server': {
            'dev': {
                root:'./',
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

    /*** CUSTOM CODED TASKS ***/
    grunt.registerTask('index', 'Generate mdwiki.html, inline all scripts', function() {
        createIndex(grunt, 'release');
    });

    /* Debug is basically the releaes version but without any minifing */
    grunt.registerTask('index_debug', 'Generate mdwiki-debug.html, inline all scripts unminified', function() {
        createIndex(grunt, 'debug');
    });

    /*** NAMED TASKS ***/
    grunt.registerTask('release', [ 'index' ]);
    grunt.registerTask('debug', [ 'index_debug' ]);
    grunt.registerTask('devel', [ 'debug', 'server', 'unittests', 'watch' ]);
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
