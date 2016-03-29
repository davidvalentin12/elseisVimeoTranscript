(function() {
  'use strict';

  var argv = require('yargs').argv,
      angularFilesort = require('gulp-angular-filesort'),
      bower,
      bowerFiles,
      rimraf = require('gulp-rimraf'),
      chug = require('gulp-chug'),
      concat = require('gulp-concat'),
      connect = require('gulp-connect'),
      es = require('event-stream'),
      extend = require('extend'),
      gulp = require('gulp'),
      gutil = require('gulp-util'),
      git = require('gulp-git'),
      http = require('http'),
      inject = require('gulp-inject'),
      inquirer = require('inquirer'),
      jeditor = require('gulp-json-editor'),
      cssnano = require('gulp-cssnano'),
      htmlmin = require('gulp-htmlmin'),
      ngdocs = require('gulp-ngdocs'),
      ngAnnotate = require('gulp-ng-annotate'),
      ngHtml2Js = require('gulp-ng-html2js'),
      q = require('q'),
      removeUseStrict = require('gulp-remove-use-strict'),
      rename = require('gulp-rename'),
      runSequence = require('run-sequence'),
      sass = require('gulp-sass'),
      semver = require('semver'),
      tap = require('gulp-tap'),
      uglify = require('gulp-uglify'),
      url = require('url');

  gulp.task('default', function(cb) {
    runSequence(
        'clean',
        'build',
        ['inject', 'import-images'],
        'bower-install',
        cb
    );
  });

  var CONFIG = {
    BOWER_MIN_FILES: false,   // use bower min files


    DIST_PATH: './dist/',
    BUILD_PATH: './build/',
    SRC_PATH: './src/',
    DOC_PATH: './docs/',

    DEV_MODE: true,
    INJECT_SRC_GLOB: './index.html',
    INJECT_DST_PATH: './',

    SERVER_PORT: 9001,
    SERVER_LIVE_RELOAD: false,
    SERVER_LIVE_RELOAD_FILES: './src/**/*'


  }, COMPONENT = {
    name: 'example',
    ready: false
  };

  CONFIG.SRC_SCRIPT_PATH = CONFIG.SRC_PATH + 'scripts/';
  CONFIG.SRC_TEMPLATE_PATH = CONFIG.SRC_PATH + 'templates/';
  CONFIG.SRC_STYLE_PATH = CONFIG.SRC_PATH + 'styles/';
  CONFIG.SRC_IMAGE_PATH = CONFIG.SRC_PATH + '_images/';

  CONFIG.DST_STYLE = 'css/styles';

  CONFIG.GIT_REPO_URL = 'https://github.com/davidvalentin12/elseisVimeoTranscript.git';
  CONFIG.GIT_REPO_ORIGIN = 'origin';
  CONFIG.GIT_REPO_BRANCH = 'master';
  CONFIG.COMMIT_FILES = [
    CONFIG.SRC_PATH,
    CONFIG.DIST_PATH,
    './.bowerrc',
      '/.gitignore',
    './bower.json',
    './Gulpfile.js',
    './index.html',
    './karma.conf.js',
    './LICENSE',
    './package.json',
      './README.md'
  ];


  /* #########################
   * ### INIT LOCAL CONFIG ###
   * #########################
   */
  (function initBowerFile() {

    try {


      COMPONENT = require(process.cwd() + '/bower.json');

      bower = require('bower');

      bowerFiles = require('main-bower-files');
      console.log("bowerfilesadsdasd");
      console.log(bowerFiles);
      COMPONENT.ready = true;
    } catch (e) {
      COMPONENT.ready = false;
      // we don't care
    }
  }());
  function requireBower(task) {
    if (!COMPONENT.ready) {
      var tMessage;

      tMessage = (task ? ('Unable to process task [' + task + ']: ') : '') +
          ('Bower is not ready or bower.json missing.');

      gutil.log(tMessage);
    }

    return COMPONENT.ready;
  }

  /* #############
   * ### BOWER ###
   * #############
   */

  // helper functions
  function addBowerListener(task, opt_interactive) {
    var tPossibleAnswers = [];
    task.on('log', function(result) {
      var tLogMessage = 'bower: ';
      if (result && result.level) {
        if (result.level === 'conflict') {
          tLogMessage += result.level + ' -> ' + result.data.name + ': ';
          tPossibleAnswers = result.data.picks;
          for (var tIterator = 0; tIterator < result.data.picks.length; tIterator++) {
            tLogMessage += (tIterator !== 0 ? ', [' : '[') + (tIterator + 1) + ']->' +
                result.data.picks[tIterator].endpoint.target;
          }
        } else {
          tLogMessage +=
              '[' + result.id + '] ' +
              (result.data && result.data.endpoint && result.data.endpoint.name);
        }

        if (result.level === 'action') {
          if (result.message &&
              (result.id === 'export' || result.id === 'install')) {
            tLogMessage += ' -> ' + result.message;
          }
        }
      }
      gutil.log(tLogMessage);
    });
    task.on('error', function(error) {
      gutil.log('bower: [ERROR] ' + error);
    });
    task.on('prompt', function(prompts, callback) {
      if (!opt_interactive && CONFIG.BOWER_SILENT_INSTALL) {
        callback({prompt: '' + tPossibleAnswers.length});
        gutil.log('Silent resolve with: ', tPossibleAnswers.length);
      } else {
        inquirer.prompt(prompts, callback);
      }
    });
    return task;
  }

  /**
   * Helper method to generate the bower config. The given base config will be used and extended by
   * the `CONFIG.BOWER_CONFIG`, if the config property is set.
   *
   * @param {Object} config The config which should be used as base. If the property is not set, the
   *        method will create a new object.
   *
   * @return {Object} The resulting extended / combined configuration.
   */
  function generateBowerConfig(config) {
    var tConfig = config || {};

    if (CONFIG.BOWER_CONFIG) {
      extend(true, tConfig, CONFIG.BOWER_CONFIG);
    }

    if (argv.username) {
      tConfig.username = argv.username;
    }

    if (argv.password) {
      tConfig.password = argv.password;
    }

    return tConfig;
  }

  function addValuesToArray(array, value) {

    if (value) {
      if (typeof value === 'string') {
        array.push(value);
      } else {
        array = array.concat(value);
      }
    }

    return array;
  }

  gulp.task('bower-update', function(cb) {
    if (requireBower('bower-update')) {
      return addBowerListener(bower.commands.update(undefined, undefined,
          generateBowerConfig({interactive: true})));
    }
    return cb;
  });

  gulp.task('bower-install', function(cb) {
    if (requireBower('bower-install')) {
      return addBowerListener(bower.commands.install(undefined, undefined,
          generateBowerConfig({interactive: true})));
    }
    return cb;
  });

  gulp.task('bower-clean', function(cb) {
    if (requireBower('bower-clean')) {
      return addBowerListener(bower.cache.clean());
    }

    return cb;
  });

  function fileCallbackFunction(fileArray, basePath) {
    return function(file) {
      fileArray.push(basePath + file.relative);
      gutil.log('File ' + basePath + file.relative);
    };
  }

  gulp.task('bower-config', function(cb) {

    var tMainScriptFiles = [],
        tMainStyleFiles = [],
        tMainImageFiles = [];
    if (requireBower('bower-config')) {

      gulp.src([
            CONFIG.DIST_PATH + COMPONENT.name + (CONFIG.BOWER_MIN_FILES ? '.min' : '') + '.js',
            CONFIG.DIST_PATH + COMPONENT.name + '.templates' +
            (CONFIG.BOWER_MIN_FILES ? '.min' : '') + '.js'
          ],
          {read: false})
          .pipe(tap(fileCallbackFunction(tMainScriptFiles, CONFIG.DIST_PATH)));

      gulp.src(CONFIG.DIST_PATH + 'css/styles' + (CONFIG.BOWER_MIN_FILES ? '.min' : '') + '.css',
          {read: false})
          .pipe(tap(fileCallbackFunction(tMainStyleFiles, CONFIG.DIST_PATH + 'css/')));

      gulp.src(CONFIG.DIST_PATH + 'images/*.*', {read: false})
          .pipe(tap(fileCallbackFunction(tMainImageFiles, CONFIG.DIST_PATH + 'images/')));

      gutil.log("image files: " + tMainImageFiles);

      gulp.src('./bower.json')

          .pipe(jeditor(function(json) {

            var tMainProp = tMainScriptFiles.concat(tMainStyleFiles).concat(tMainImageFiles);

            tMainProp = addValuesToArray(tMainProp, json.incl_main);
            tMainProp = addValuesToArray(tMainProp, CONFIG.BOWER_CONFIG_INCL_MAIN_PROP);

            json.main = tMainProp;

            json.ignore =
                [
                  'lang',
                  'src/*',
                  'test',
                  '_data',
                  'Gulpfile.js',
                  'gulpConfig.json',
                  'index.html',
                  'node_modules',
                  'bower_components',
                  'karma.conf.js'
                ];

            if (CONFIG.SASS_INCLUDED_IN_BOWER_BUILD) {
              json.ignore.push('!src/styles/**/.scss');
              json.ignore.push('!src/styles/**/.sass');
            }

            gutil.log('bower: set main property to -> ', tMainProp);

            return json;
          }))
          .pipe(gulp.dest('./'));
    } else {
      return cb;
    }
  });

  gulp.task('bower-register', ['svn-path'], function(cb) {
    if (requireBower('bower-register')) {
      return addBowerListener(bower.commands.register(COMPONENT.name, 'svn+' + tSvnPath,
          generateBowerConfig({interactive: true})), true);
    }
    return cb;
  });

  gulp.task('bower-unregister', function() {
    var tDefer;

    tDefer = q.defer();

    if (requireBower('bower-unregister')) {
      var tRegistry,
          tPath,
          tMessage;

      tRegistry = url.parse(bower.config.registry.register);

      tPath = '/packages/' + COMPONENT.name;

      tMessage = 'Do you really want to unregister [' + COMPONENT.name + '] from the registry ' +
          tRegistry.hostname + ':' + tRegistry.port + '?';

      inquirer.prompt({
        type: 'confirm',
        name: 'unregister',
        message: tMessage
      }, function(answer) {
        if (answer && answer.unregister) {

          var tOptions;

          tOptions = {
            host: tRegistry.hostname,
            port: tRegistry.port,
            method: 'DELETE',
            path: tPath
          };

          http.request(tOptions, tDefer.resolve).on('error', tDefer.reject).end();
        } else {
          tDefer.reject();
        }
      });

    } else {
      tDefer.reject();
    }

    return tDefer.promise;
  });


  /* ##################
   * ### WEB-SERVER ###
   * ##################
   */
  gulp.task('start', function(cb) {
    connect.server({
      port: CONFIG.SERVER_PORT || 8080,
      livereload: CONFIG.SERVER_LIVE_RELOAD || false
    });

    if (CONFIG.SERVER_LIVE_RELOAD) {
      gulp.watch(CONFIG.SERVER_LIVE_RELOAD_FILES, ['server-reload']);
    }
  });

  gulp.task('server-reload', function(cb) {
    gulp.src('./**/*')
        .pipe(connect.reload());
  });

  /* #################
   * ### TEMPLATES ###
   * #################
   */
  gulp.task('build-templates', [], function() {

    return gulp.src(CONFIG.SRC_TEMPLATE_PATH + '**/*.html')
        .pipe(htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          removeAttributeQuotes: true,
          removeStyleLinkTypeAttributes: true,
          removeScriptTypeAttributes: true,
          useShortDoctype: true
        }))
        .pipe(ngHtml2Js({
          moduleName: 'dvm.templates',
          prefix: 'src/templates/'
        }))
        .pipe(concat(COMPONENT.name + '.templates.js'))
        .pipe(gulp.dest(CONFIG.DIST_PATH))
        .pipe(uglify())
        .pipe(concat(COMPONENT.name + '.templates.min.js'))
        .pipe(gulp.dest(CONFIG.DIST_PATH));

  });

  /* ###############
   * ### SCRIPTS ###
   * ###############
   */
  gulp.task('build-scripts', [], function() {

    var tScriptPaths = [];

    tScriptPaths.push(CONFIG.SRC_SCRIPT_PATH + '**/*.js');

    if (CONFIG.EXCLUDE_CONFIG_FILES) {
      tScriptPaths.push('!' + CONFIG.SRC_SCRIPT_PATH + '_configs/**/*.js');
    }

    // read all files from the scrip path
    return gulp.src(tScriptPaths)
        .pipe(ngAnnotate())
        .pipe(concat(COMPONENT.name + '.js'))
        .pipe(gulp.dest(CONFIG.DIST_PATH))
        .pipe(uglify())
        .pipe(removeUseStrict())
        .pipe(concat(COMPONENT.name + '.min.js'))
        .pipe(gulp.dest(CONFIG.DIST_PATH));

  });


  /* ##############
   * ### STYLES ###
   * ##############
   */

  function _generateSassGlob() {
    var tSassGlob = [CONFIG.SRC_STYLE_PATH + 'sass/**/*.scss'];

    if (CONFIG.SASS_GLOB) {
      for (var tGlob in CONFIG.SASS_GLOB) {
        if (CONFIG.SASS_GLOB.hasOwnProperty(tGlob)) {
          tSassGlob.push(CONFIG.SASS_GLOB[tGlob]);
        }
      }
    }

    return tSassGlob;
  }

  gulp.task('sass-watch', ['sass-compile'], function() {
    gulp.watch(_generateSassGlob(), ['sass-compile']);
  });

  gulp.task('sass-compile', [], function() {
    return gulp.src(CONFIG.SRC_STYLE_PATH + 'sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(CONFIG.SRC_STYLE_PATH));
  });

  gulp.task('build-styles', ['sass-compile'], function() {

    // read all files from the style path
    return gulp.src(CONFIG.SRC_STYLE_PATH + '**/*.css')
        .pipe(concat(CONFIG.DST_STYLE + '.css'))
        .pipe(gulp.dest(CONFIG.DIST_PATH))
        .pipe(cssnano())
        .pipe(concat(CONFIG.DST_STYLE + '.min.css'))
        .pipe(gulp.dest(CONFIG.DIST_PATH));

  });

  /* ##############
   * ### IMAGES ###
   * ##############
   */
  gulp.task('build-images', function() {
    return gulp.src(CONFIG.SRC_IMAGE_PATH + '**/*')
        .pipe(gulp.dest(CONFIG.DIST_PATH + 'images'));
  });

  gulp.task('clean-images', function() {
    gulp.src('./src/images', {read: false})
        .pipe(rimraf());
  });

  gulp.task('import-images', function() {
    gulp.src([
          '!./bower_components/**/src',
          './bower_components/**/images/**/*',
          './bower_components/**/assets/**/*',
          CONFIG.SRC_IMAGE_PATH + '*'
        ])
        .pipe(rename(function(path) {
          gutil.log('image: import [' + path.dirname + '\\' + path.basename + path.extname +
              ']');
          path.dirname = '';
        }))
        .pipe(gulp.dest('./src/images'));
  });

  /* ##############
   * ### INJECT ###
   * ##############
   */

  gulp.task('inject', function() {

    var tBowerFiles,
        tScriptFiles,
        tCssFiles,
        tDefer = q.defer();

    if (requireBower('inject')) {
      // read all css files
      tCssFiles = gulp.src(CONFIG.SRC_STYLE_PATH + '**/*.css');

      // read all script files and sort by angular dependency
      tScriptFiles = gulp.src([CONFIG.SRC_SCRIPT_PATH + '**/*.js', '!' + CONFIG.SRC_SCRIPT_PATH + '**/*.spec.js']).pipe(angularFilesort());


      // read all bower files - include also all dev files (CONFIG.DEV_MODE)
      tBowerFiles = gulp.src(bowerFiles({
        includeDev: CONFIG.DEV_MODE
      }));


      gulp.src(CONFIG.INJECT_SRC_GLOB)
          .pipe(inject(
              tBowerFiles, {
                name: 'bower',
                addRootSlash: false
              }))

          .pipe(inject(
              es.merge(tCssFiles, tScriptFiles), {
                addRootSlash: false
              }))

          .pipe(gulp.dest(CONFIG.INJECT_DST_PATH))
          .on('end', tDefer.resolve);
    } else {
      tDefer.reject();
    }

    return tDefer;
  });

  /* #############
   * ### BUILD ###
   * #############
   */

  gulp.task('build', function() {
    runSequence(
        ['build-images', 'build-styles', 'build-scripts', 'build-templates'],
        'bower-config', 'bower-install'
    );
  });

  /* #############
   * ### CLEAN ###
   * #############
   */
  gulp.task('clean-build', function() {
    return gulp.src(CONFIG.BUILD_PATH, {read: false})
        .pipe(rimraf());
  });

  gulp.task('clean-dist', function() {
    return gulp.src(CONFIG.DIST_PATH, {read: false})
        .pipe(rimraf());
  });

  gulp.task('clean', ['clean-dist', 'clean-build']);


  /* #############
   * ###  GIT  ###
   * #############
   */

  gulp.task('git-init', function() {
    return git.init(function(err) {
      gutil.log('[init] Init git repo');
    });

  });

  gulp.task('git-removeremote', function() {
    return git.removeRemote(CONFIG.GIT_REPO_ORIGIN, function(err) {
      gutil.log('[removeremote] Removing remote url');
    });
  });

  gulp.task('git-addremote', function() {
    return git.addRemote(CONFIG.GIT_REPO_ORIGIN, CONFIG.GIT_REPO_URL, function(err) {
      gutil.log('[addremote] Add remote url');
    });

  });

  gulp.task('git-pull', function() {
    var tDefer = q.defer(), tBranch, tOrigin;

    inquirer.prompt([
      {
        type: 'input',
        name: 'origin',
        message: 'Do you want to pull from a specific ORIGIN?(leave blank for configured default): '
      },{
      type: 'input',
      name: 'branch',
      message: 'Do you want to pull from a specific BRANCH?(leave blank for configured default): '
    }], function(answer) {
      tBranch = answer.branch;
      tOrigin = answer.origin;

      if (tBranch) {
        CONFIG.GIT_REPO_BRANCH = tBranch;
      }
      if (tOrigin) {
        CONFIG.GIT_REPO_ORIGIN = tOrigin;
      }
      git.pull(CONFIG.GIT_REPO_ORIGIN, CONFIG.GIT_REPO_BRANCH, function(err) {

      }).on('end',function(){
        gutil.log('[SUCCESS]Successfully pulled from BRANCH : ' + CONFIG.GIT_REPO_BRANCH+ ', ORIGIN: '+CONFIG.GIT_REPO_ORIGIN);
        tDefer.resolve();
      });

    });


    return tDefer.promise;


  });

  gulp.task('init', function(cb) {
    runSequence(
        'git-init',
        'git-removeremote',
        'git-addremote',
        cb
    );
  });

  gulp.task('git-commit', function() {
    var tMessage = 'automatic commit', tDefer;
    tDefer = q.defer();


      inquirer.prompt({
        type: 'input',
        name: 'commitmessage',
        message: 'Please enter a message for your commit: '
      }, function(answer) {
        if(answer.commitmessage){
          tMessage = answer.commitmessage;
          gulp.src('').pipe(git.commit(tMessage)).on('end', function(){
            gutil.log('[SUCCESS] Committed successfully with message: ' + tMessage);
            tDefer.resolve();
          });
        }else{
            gutil.log('[ERROR] Commit was canceled. Commit message was needed.');
            tDefer.reject();
        }
      });


    return tDefer.promise;

  });

  gulp.task('git-add', function() {
    gutil.log('[SUCCESS] Successfully added default files to commit');
    return gulp.src(CONFIG.COMMIT_FILES)
        .pipe(git.add());
  });

  gulp.task('commit', function(cb) {
    runSequence(
        'git-add',
        'git-commit',
        cb
    );
  });

  gulp.task('git-push', function() {
    var tDefer = q.defer(), tBranch, tOrigin;

    inquirer.prompt([
      {
        type: 'input',
        name: 'origin',
        message: 'Do you want to pull from a specific ORIGIN?(leave blank for configured default): '
      }, {
        type: 'input',
        name: 'branch',
        message: 'Do you want to pull from a specific BRANCH?(leave blank for configured default): '
      }], function(answer) {
      tBranch = answer.branch;
      tOrigin = answer.origin;

      if (tBranch) {
        CONFIG.GIT_REPO_BRANCH = tBranch;
      }
      if (tOrigin) {
        CONFIG.GIT_REPO_ORIGIN = tOrigin;
      }

       git.push(CONFIG.GIT_REPO_ORIGIN, CONFIG.GIT_REPO_BRANCH, function(err) {
        if (err){

          gutil.log('[ERROR] Push to origin: '+CONFIG.GIT_REPO_ORIGIN+', branch: '+CONFIG.GIT_REPO_BRANCH+' failed');
          tDefer.reject();
        }
      }).on('end', function(){
         gutil.log('[SUCCESS] Push to origin: '+CONFIG.GIT_REPO_ORIGIN+', branch: '+CONFIG.GIT_REPO_BRANCH+' successfully completed');
         tDefer.resolve();
       });


    });
    return tDefer.promise;
  });

}());
