var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var gutil = require('gulp-util');
var babel = require('rollup-plugin-babel');
// var rollup = require('gulp-rollup');
var rollup = require('rollup-stream');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var exclude = require('gulp-ignore').exclude;
// var connect = require('gulp-connect');


var devport = 8080;
var distroot = './dist';
var srcroot = './src/**';
var mainjs = './src/imask.js';

gulp.task('clean', function () {
  del([distroot]);
});


gulp.task('lint', function () {
  return gulp.src(srcroot)
    .pipe(eslint({configFile: '.eslintrc'}))
    .pipe(eslint.format());
});


gulp.task('js', function () {
  return rollup({
      entry: mainjs,
      format: 'umd',
      moduleName: 'imask',
      sourceMap: true,
      plugins: [babel({ exclude: 'node_modules/**' })]
    })
    .pipe(source('imask.js', './src'))
    .pipe(buffer())

    // save unminified
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(distroot))

    // save minified
    .pipe(exclude('**.map'))
    .pipe(uglify({ preserveComments: 'license' }))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(distroot))
    // .pipe(connect.reload());
});


// gulp.task('connect', function() {
//   return connect.server({
//     root: distroot,
//     port: devport,
//     livereload: true
//   });
// });


gulp.task('watch', function () {
  return gulp.watch(srcroot, ['js']);
});

gulp.task('build', gulpsync.sync(['clean', 'lint', 'js']));
gulp.task('default', gulpsync.sync(['build', 'watch']));
