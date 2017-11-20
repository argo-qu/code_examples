var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var babel = require('gulp-babel');

var paths = {
    sass: ['./assets/sass/**/*.css', './assets/sass/**/*.scss', './assets/scss/**/*.css', './assets/scss/**/*.scss'],
    es6: ['./assets/**/*.module.js', './assets/**/*.js']
};

var prefix = __dirname.split('\\').pop() + '__';

gulp.task('default', [prefix + 'sass', prefix + 'es6']);

gulp.task(prefix + 'sass', function(done) {
    gulp.src(paths.sass)
        .pipe(concat('style.scss'))
        .pipe(gulp.dest('./dist/scss'))
        .on('end', done);
});

gulp.task(prefix + 'es6', function (done) {
    gulp.src(paths.es6)
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./dist/js/'))
        .on('end', done);
});