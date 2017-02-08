var autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    del = require('del'),
    gulp = require('gulp'),
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    zip = require('gulp-zip')

var temp = 'temp-wrapper-folder'

var paths = {
    styles: [
        './sass/*.scss'
    ],
    scripts: [
        'node_modules/jquery/dist/jquery.js',
        'js/index.js'
    ],
    destination: 'dist'
}

gulp.task('sass', () =>
    gulp.src(paths.styles)
        .pipe(sass().on('error', notify.onError(function(error) {
            return `Error: ${error.message}`
        })))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.destination))
)

gulp.task('scripts', () =>
    gulp.src(paths.scripts)
        .pipe(concat('index.js'))
        .pipe(gulp.dest(paths.destination))
)

gulp.task('wrap', () =>
    gulp.src(['dist/**'])
        .pipe(gulp.dest(`${temp}/dist`))
)

gulp.task('zip', () =>
    gulp.src([`${temp}/**/*`, 'manifest.json'])
        .pipe(zip('upload-me-to-the-chrome-web-store.zip'))
        .pipe(gulp.dest('.'))
)

gulp.task('clean', () =>
    del([`${temp}/**`])
)

gulp.task('watch', () => {
    gulp.watch(paths.scripts, ['scripts'])
    gulp.watch(paths.styles, ['sass'])
})

gulp.task('default', ['scripts', 'sass', 'watch'])
gulp.task('prod', (callback) => runSequence(['scripts', 'sass'], 'wrap', 'zip', 'clean', callback))
