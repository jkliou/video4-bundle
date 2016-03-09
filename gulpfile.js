var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var browserSync = require('browser-sync').create();
var path = require('path');
var collapse = require('bundle-collapser/plugin');
// minify
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var rename    = require("gulp-rename");

//process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

gulp.task('js:videojs', function () {
    return browserify()
        .require(path.dirname(require.resolve('video.js')) + "/video.novtt.dev.js", {expose: 'video.js', fullPaths: false})
        .plugin(collapse)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('videojs.js'))
        .pipe(gulp.dest('./dist/js'));
});
gulp.task('js:videojs-hls-standalone', function () {
    return browserify('./src/videojs.hls/index.js', { fullPaths: false })
        .exclude('video.js')
        .plugin(collapse)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('videojs.hls.js'))
        .pipe(gulp.dest('./dist/js'));
});
gulp.task('js:videojs-ga-standalone', function() {
    return browserify('./src/videojs.ga/index.js', { fullPaths: false })
        .exclude('video.js')
        .plugin(collapse)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('videojs.ga.js'))
        .pipe(gulp.dest('./dist/js'));
});
// bundle
gulp.task('js:videojs-bundle', function () {
    return browserify('./src/videojs.bundle/index.js', { fullPaths: false })
        .plugin(collapse)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('video.bundle.js'))
        .pipe(gulp.dest('./dist/js'));
});
gulp.task('js:build', function() {
  return gulp.src('./dist/js/*.js')
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename += ".min";
      path.extname = ".js";
    }))
    .pipe(gulp.dest('./build/js'));
});
gulp.task('js:copy-videojs-vtt.js', function () {
    return gulp.src(path.dirname(require.resolve('video.js')) + '/../../node_modules/vtt.js/dist/vtt.min.js')
        .pipe(gulp.dest('dist/js'));
});
gulp.task('js', [
    'js:videojs-bundle',
    'js:build'
]);
gulp.task('jsdev', [
    'js:videojs',
    'js:videojs-hls-standalone',
    'js:videojs-ga-standalone',
    'js:videojs-bundle',
    'js:copy-videojs-vtt.js'
]);

gulp.task('css:copy-videojs.min.css', function () {
    gulp.src(path.dirname(require.resolve('video.js')) + '/video-js.min.css')
        .pipe(gulp.dest('dist/css'));
});
gulp.task('css:concat', function() {
  return gulp.src('./dist/css/*.css')
    .pipe(concat('video.bundle.min.css'))
    .pipe(gulp.dest('./build/css'));
});
gulp.task('css:build', function () {
    gulp.src('./dist/css/video.bundle.css')
    .pipe(minifyCSS({
       keepBreaks: true,
    }))
    .pipe(rename(function(path) {
      path.basename += ".min";
      path.extname = ".css";
    }))
    .pipe(gulp.dest('./build/css/'));
});
gulp.task('css', [
    'css:copy-videojs.min.css',
    'css:concat'
]);

gulp.task('font:copy-videojs-font', function () {
    gulp.src(path.dirname(require.resolve('video.js')) + '/font/**')
        .pipe(gulp.dest('dist/css/font'));
});
gulp.task('font:concat', function() {
    gulp.src('./dist/css/font/**')
        .pipe(gulp.dest('build/css/font'));
});
gulp.task('fonts', [
    'font:copy-videojs-font',
    'font:concat'
]);

gulp.task('swf:copy-videojs-swf', function () {
    gulp.src('node_modules/videojs-swf/dist/*.swf')
        .pipe(gulp.dest('dist/swf'));
    gulp.src('dist/swf/*.swf')
        .pipe(gulp.dest('build/swf'));
});
gulp.task('swf', ['swf:copy-videojs-swf']);

gulp.task('dev:bs', ['default'], function() {
    browserSync.init({
        server: {baseDir: './'},
        directory: true
    });

    gulp.watch(['src/**/*.js', 'examples/*.html'], ['dev:watch']);
});
gulp.task('dev:watch', ['default'], browserSync.reload);
gulp.task('dev', ['dev:bs']);


gulp.task('default', ['js', 'fonts', 'css', 'swf']);