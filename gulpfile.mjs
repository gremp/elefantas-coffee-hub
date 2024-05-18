import gulp from "gulp";
import fileinclude from "gulp-file-include";
import htmlmin from "gulp-htmlmin";
import gulpSass from "gulp-sass";
import sass from "sass";
import autoprefixer from "gulp-autoprefixer";
import cssmin from "gulp-clean-css";
import rename from "gulp-rename";
import concat from "gulp-concat";
import uglify from "gulp-uglify";
import imagemin from "gulp-imagemin";
import gutil from "gulp-util";
import plumber from "gulp-plumber";
import size from "gulp-size";
import watch from "gulp-watch";
import browserSync from "browser-sync";

const reload = browserSync.reload;
const sassCompiler = gulpSass(sass);

// Notify on error with a beep
const onError = function (error) {
  console.log(gutil.colors.red(error.message));
  this.emit("end");
  gutil.beep();
};

// HTML task
function html() {
  return gulp
    .src("src/html/*.html")
    .pipe(plumber(onError))
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "src/html",
      }),
    )
    .pipe(
      htmlmin({
        removeCommentsFromCDATA: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        caseSensitive: true,
        minifyCSS: true,
      }),
    )
    .pipe(gulp.dest("dist"));
}

// CSS task
function css() {
  return gulp
    .src("src/scss/main.scss")
    .pipe(plumber(onError))
    .pipe(sassCompiler({ style: "compressed", noCache: true }))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions"],
      }),
    )
    .pipe(cssmin())
    .pipe(rename("production.css"))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest("dist/css"));
}

// JS task
function js() {
  return gulp
    .src("src/js/**/*")
    .pipe(plumber(onError))
    .pipe(concat("production.js"))
    .pipe(gulp.dest("dist/js"));
}

// Image task
function images() {
  return gulp
    .src("src/img/**/*.+(png|jpeg|jpg|gif|svg)")
    .pipe(plumber(onError))
    .pipe(imagemin())
    .pipe(gulp.dest("dist/img"));
}

// Start server
function browserSyncTask() {
  browserSync({
    server: {
      baseDir: "dist",
    },
  });
}

// Watch files
function watchFiles() {
  watch("src/html/**/*", gulp.series(html, reload));
  watch("src/scss/**/*", gulp.series(css, reload));
  watch("src/js/**/*", gulp.series(js, reload));
  watch("src/img/**/*.+(png|jpeg|jpg|gif|svg)", gulp.series(images, reload));
}

// Define complex tasks
const build = gulp.series(gulp.parallel(html, css, js, images));
const watchTask = gulp.parallel(watchFiles, browserSyncTask);

// Export tasks
export { html, css, js, images, build, watchTask };
export default watchTask;
