'use strict';



//https://github.com/mikeal/request/issues/418
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

//Proxy requests middleware
var proxyRequest = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    //Tasks that gets not setup autmatically by load-grunt-tasks
    grunt.loadNpmTasks('grunt-angular-gettext');
    grunt.loadNpmTasks('grunt-connect-proxy');

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,

        nggettext_extract: {
            extract: {
                files: {
                    'po/extracted.pot': ['<%= yeoman.app %>/views/*.html', '<%= yeoman.app %>/views/partials/*.html']
                }
            }
        },
        nggettext_compile: {
            all: {
                files: {
                    '<%= yeoman.app %>/scripts/lang.js': ['po/*.po']
                }
            }
        },

        fakes: {
            options: {
                dest: 'fakes/generated/api/0.1.0/'
            },
            fifo: {
                cloud: {},
                vms: {
                    type: 'list',
                    n: 80,
                },
                datasets: {
                    type: 'list',
                    n: 10
                },
                hypervisors: {
                    type: 'list',
                    n: 5
                },
                packages: {
                    type: 'list',
                    n: 10
                },
                networks: {
                    type: 'list',
                    n: 4
                },
                ipranges: {
                    type: 'list',
                    n: 10
                },
                orgs: {
                    type: 'list',
                    n: 5
                },
                users: {
                    type: 'list',
                    n: 20
                },
                groups: {
                    type: 'list',
                    n: 5
                },
                dtrace: {
                    type: 'list',
                    n: 4
                }
            } 
        },

        watch: {
            recess: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
                tasks: ['recess', 'autoprefixer']
            },
            //compass: {
            //    files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
            //    tasks: ['compass:server', 'autoprefixer']
            //},
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '<%= yeoman.app %>/views/*.html',
                    '<%= yeoman.app %>/views/partials/*.html',
                    '.tmp/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                hostname: '0.0.0.0'
            },

            //Proxy options
            proxies: [
                {
                    context: '/api',
                    host: grunt.option('proxy'), //i.e. grunt server --proxy=YOUR_WIGGLE   
                    // port: 443,
                    // https: true,
                    // ws: true
                },
                {
                    context: '/howl',
                    host: grunt.option('proxy'),
                    ws: true
                }
            ],

            livereload: {
                options: {
                    middleware: function (connect) {

                        var middlewares = [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ]

                        //Proxy requests to a wiggle backend.
                        if (grunt.option('proxy')) {
                            middlewares.push(proxyRequest)
                        }
                        //If not, mock it up.
                        else {

                            // Catch PUT, DELETE, and POSTS and respond a 200.. :P
                            middlewares.push(function (req, res, next) {
                                var m = req.method;
                                if (m=='POST' || m=='PUT' || m=='DELETE')
                                    return res.end()
                                next()
                            })

                            // Request /api/0.1.0/cloud/connection.
                            middlewares.push(function(req, res, next) {

                                if (req.url !== '/api/0.1.0/cloud/connection')
                                    return next();

                                res.writeHead(200)
                                res.write(JSON.stringify({sniffle: 1, howl: 1, snarl: 1}))
                                res.end()
                            })

                            /* If not found, then check if have a .json file (mock) :) */
                            middlewares.push(function(req, res, next) {
                                var wait = Math.floor(Math.random() * 5 * 1000);
                                wait = 0 * 1000;
                                grunt.log.writeln('Will serve from json: ', req.url, 'after', wait, '[ms]');
                                //Add .json to the url, so the static loader loads the json file.. :P
                                req.url += '.json'
                                setTimeout(next, wait)
                                // next();
                            })
                            middlewares.push(connect.static('fakes/generated'))
                        }

                        return middlewares;
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },
        recess: {
            dist: {
                options: {
                    compile: true
                },
                files: {
                    '<%= yeoman.app %>/styles/main.css': ['<%= yeoman.app %>/styles/styles.less']
                }
            }
        },
        /*compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= yeoman.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },*/
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
            dist: {}
        },*/
        'bower-install': {
            app: {
                html: '<%= yeoman.app %>/index.html',
                ignorePath: '<%= yeoman.app %>/'
            }
        },
        // not enabled since usemin task does concat and uglify
        // check index.html to edit your build targets
        // enable this task if you prefer defining your build targets here
        /*uglify: {
            dist: {}
        },*/
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        // '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/{,*/}*.*'
                    ]
                }
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: '<%= yeoman.app %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
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
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            // This task is pre-configured if you do not wish to use Usemin
            // blocks for your CSS. By default, the Usemin block from your
            // `index.html` will take care of minification, e.g.
            //
            //     <!-- build:css({.tmp,app}) styles/main.css -->
            //
            // dist: {
            //     files: {
            //         '<%= yeoman.dist %>/styles/main.css': [
            //             '.tmp/styles/{,*/}*.css',
            //             '<%= yeoman.app %>/styles/{,*/}*.css'
            //         ]
            //     }
            // }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: ['*.html', 'views/*.html', 'views/partials/*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.{webp,gif}',
                        'styles/*.png', //bloody famfam, includes the png in the same dir as the style. :P
                        'fonts/{,*/}*.*'
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: ['{,*/}*.css', 'fonts/*']
            }
        },
        concurrent: {
            server: [
                'recess',
                //'compass',
                // 'coffee:dist',
                'copy:styles'
            ],
            test: [
                'recess',
                // 'coffee',
                'copy:styles'
            ],
            dist: [
                // 'coffee',
                //'compass',
                'recess',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        ngmin: {
          dist: {
            files: [{
              expand: true,
              cwd: '<%= yeoman.dist %>/scripts',
              src: '*.js',
              dest: '<%= yeoman.dist %>/scripts'
            }]
          }
    },
    });

    //Mockups for fifo backend
    grunt.loadTasks('grunt-fakes-task');

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        var runTasks = [
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'configureProxies',
            'connect:livereload',
            'open',
            'watch'
        ]

        //If no --proxy option is defined, then generate the fakes
        if (!grunt.option('proxy')) {
            runTasks.splice(0,0,'faker')
            runTasks.splice(0,0,'fakes')
        }

        grunt.task.run(runTasks);

    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'ngmin',
        'cssmin',
        'uglify',
        'copy:dist',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        //'jshint',
        //'test',
        'build'
    ]);
};

//Copy config.js if it does not exists
var fs = require('fs'),
    config = './app/scripts/config.js';

if (fs.existsSync(config)) return;

console.log('--> Coping config file...')
fs.createReadStream(config+'.example')
    .pipe(fs.createWriteStream(config))
