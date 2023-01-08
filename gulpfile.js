const { src, dest, task, series, watch, parallel } = require("gulp");
const clean = require("gulp-clean");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
const px2rem = require("gulp-smile-px2rem");
const gcmq = require("gulp-group-css-media-queries");
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const svgo = require("gulp-svgo");
const svgSprite = require("gulp-svg-sprite");
const gulpif = require("gulp-if");

const env = process.env.NODE_ENV;

const { SRC_PATH, DIST_PATH } = require("./gulp.config");

task("clean", () => {
  console.log(env);
  return src(DIST_PATH + "/**/*", { read: false }).pipe(clean());
});

task("copy:html", () => {
  return src(SRC_PATH + "/*.html")
    .pipe(dest(DIST_PATH))
    .pipe(reload({ stream: true }));
});

task("copy:img", () => {
  return src(SRC_PATH + "/img/**/*")
    .pipe(dest(DIST_PATH + "/img"))
    .pipe(reload({ stream: true }));
});

task("styles", () => {
  return (
    src(["src/css/style.scss"])
      .pipe(gulpif(env === "dev", sourcemaps.init()))
      .pipe(concat("style.scss"))
      .pipe(sassGlob())
      .pipe(sass().on("error", sass.logError))
      //.pipe(px2rem())
      .pipe(
        gulpif(
          env === "production",
          autoprefixer({
            cascade: true,
            overrideBrowserslist: "last 2 version",
          })
        )
      )
      .pipe(gulpif(env === "production", gcmq()))
      .pipe(gulpif(env === "production", cleanCSS()))
      .pipe(gulpif(env === "dev", sourcemaps.write()))
      .pipe(dest(DIST_PATH))
      .pipe(reload({ stream: true }))
  );
});

task("server", () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
    open: true,
  });
});

task("watch", () => {
  watch("./src/css/**/*.scss", series("styles"));
  watch("./src/*.html", series("copy:html"));
  watch("./src/img/**/*", series("copy:img"));
});

task(
  "default",
  series(
    "clean",
    parallel("copy:html", "copy:img", "styles"),
    parallel("watch", "server")
  )
);

task("build", series("clean", parallel("copy:html", "copy:img", "styles")));
