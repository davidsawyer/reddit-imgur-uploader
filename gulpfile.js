var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    util = require('gulp-util'),
    del = require('del'),
    sass = require('gulp-sass'),
    notify = require("gulp-notify"),
    autoprefixer = require('gulp-autoprefixer');


var paths = {
    styles: [
        './sass/*.scss'
    ],
    scripts: [
        'node_modules/jquery/dist/jquery.js',
        'js/index.js'
    ],
    destination: 'dist'
};

gulp.task('clean', function(cb) {
    del(['dist/*.map'], cb);
});

gulp.task('sass', function() {
    gulp.src(paths.styles)
        .pipe(sass().on('error', notify.onError(function(error) {
            return "Error: " + error.message;
        })))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.destination));
});

gulp.task('scripts', function() {
    gulp.src(paths.scripts)
        .pipe(concat('index.js'))
        .pipe(gulp.dest(paths.destination));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.styles, ['sass']);
});

gulp.task('default', ['scripts', 'sass', 'watch']);
gulp.task('prod', ['scripts', 'sass']);
