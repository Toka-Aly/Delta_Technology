const { src, dest, series, watch, task, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const prefix = require("gulp-autoprefixer");
const gutil = require("gulp-util");
const gulpif = require("gulp-if");
const minify = require("gulp-minify");
const concat = require("gulp-concat");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const cssnano = require("gulp-cssnano");
const rename = require("gulp-rename");
const runSequence = require("run-sequence");
const rtlcss = require("gulp-rtlcss");
const critical = require("critical").stream;
const del = require("del");

var env,
  jsSources,
  htmlSources,
  outputDir,
  innerHeader = false;

env = process.env.NODE_ENV || "development";
if (env === "development") {
  outputDir = "builds/development/";
  jsSources = [
    "components/scripts/jquery.js",
    "components/scripts/jquery-ui.js",
    "components/scripts/jquery.magnific-popup.js",
    "components/scripts/datatables.min.js",
  ];
} else {
  outputDir = "builds/production/";
  jsSources = [
    "components/scripts/jquery.js",
    "components/scripts/jquery-ui.js",
    "components/scripts/datatables.min.js",
    "components/scripts/jquery.magnific-popup.js",
  ];
}
htmlSources = [outputDir + "*.html"];

//BrowserSync Function
function server(cb) {
  browsersync.init({
    notify: false,
    server: {
      baseDir: gulpif(
        env === "production",
        "./builds/production/",
        "./builds/development/"
      ),
    },
  });

  cb();
}

// Swallow Error Function to prevent error from breaking the task running
function swallowError(error) {
  // If you want details of the error in the console
  console.log(error.toString());
  this.emit("end");
}

// CSS function
function css(cb) {
  return src(["components/sass/app.scss"])
    .pipe(
      sass({
        includePaths: ["components/sass/**/*"],
      }).on("error", sass.logError)
    )
    .pipe(
      prefix(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true,
      })
    )
    .pipe(dest("builds/development/content/css"))
    .pipe(browsersync.reload({ stream: true }));

  cb();
}

// Minify CSS using "CSSNano" package
function minifyCSS(cb) {
  src(["builds/development/content/css/app.css"])
    .pipe(
      cssnano({
        zindex: false,
        reduceIdents: false,
      })
    )
    .pipe(rename({ suffix: "-min" }))
    .pipe(dest("builds/production/content/css"));

  cb();
}

// Generate RTL CSS using "rtlcss" plugin
function convertRTL(cb) {
  return src(["builds/development/content/css/app.css"])
    .pipe(rtlcss())
    .pipe(rename({ suffix: "-rtl" }))
    .pipe(dest("builds/development/content/css"))
    .pipe(browsersync.reload({ stream: true }));

  cb();
}

function minifyCSSRTL(cb) {
  src(["builds/development/content/css/app-rtl.css"])
    .pipe(cssnano())
    .pipe(rename({ suffix: "-min" }))
    .pipe(dest("builds/production/content/css"));

  cb();
}

// js function
function js(cb) {
  return src(jsSources)
    .pipe(concat("script.js"))
    .on("error", gutil.log)
    .pipe(
      gulpif(
        env === "production",
        minify({
          ext: {
            min: ".js",
          },
          noSource: true,
        })
      )
    )
    .pipe(dest(outputDir + "content/js"))
    .pipe(browsersync.reload({ stream: true }));

  cb();
}

// Seperate the customScript file
function customScript(cb) {
  return src("components/scripts/custom-script.js")
    .on("error", gutil.log)
    .pipe(
      gulpif(
        env === "production",
        minify({
          ext: {
            min: ".js",
          },
          noSource: true,
        })
      )
    )
    .pipe(dest(outputDir + "content/js"))
    .pipe(browsersync.reload({ stream: true }));

  cb();
}

// html function
function html(cb) {
  return src(["html_pages/*.html"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
        indent: true,
        context: {
          env: env,
          innerHeader: innerHeader,
        },
      })
    )
    .on("error", swallowError)
    .pipe(gulpif(env === "production", dest(outputDir)))
    .pipe(dest(outputDir));

  cb();
}

// Copy images to production
function move(cb) {
  src("builds/development/content/images/**/*.*").pipe(
    gulpif(env === "production", dest(outputDir + "content/images"))
  );
  cb();
}

// Copy videos to production
function moveVideos(cb) {
  src("builds/development/content/videos/**/*.*").pipe(
    gulpif(env === "production", dest(outputDir + "content/videos"))
  );
  cb();
}

// Copy fonts to production
function moveFonts(cb) {
  src("builds/development/content/fonts/**/*.*").pipe(
    gulpif(env === "production", dest(outputDir + "content/fonts"))
  );
  cb();
}

// Generate & Inline Critical-path CSS
function generateCritical(cb) {
  src("builds/development/*.html")
    .pipe(
      critical({
        base: "builds/development/",
        inline: false,
        css: ["builds/development/content/css/app.css"],
      })
    )
    .on("error", function (err) {
      log.error(err.message);
    })
    .pipe(cssnano())
    .pipe(dest("builds/critical/LTR"));

  src("builds/development/*-rtl.html")
    .pipe(
      critical({
        base: "builds/development/",
        inline: false,
        css: ["builds/development/content/css/app-rtl.css"],
      })
    )
    .on("error", function (err) {
      log.error(err.message);
    })
    .pipe(cssnano())
    .pipe(dest("builds/critical/RTL"));
  cb();
}

//Watcher function
function watcher(cb) {
  watch("components/sass/**/*.scss").on(
    "change",
    series(css, convertRTL, minifyCSS, minifyCSSRTL, browsersync.reload)
  );
  watch("html_pages/**/*.html").on("change", series(html, browsersync.reload));
  watch("components/scripts/**/*.js").on(
    "change",
    series(js, customScript, browsersync.reload)
  );
  cb();
}

exports.generateCritical = generateCritical;

function prodSet(done) {
  env = "production";
  outputDir = "builds/production/";
  done();
}

function devClean() {
  return del(["builds/development/*.html"]);
}
function prodClean() {
  return del(["builds/production/*.html"]);
}

exports.default = series(
  server,
  watcher,
  devClean,
  html,
  css,
  convertRTL,
  js,
  customScript,
  minifyCSS,
  minifyCSSRTL,
  move,
  moveVideos,
  moveFonts
);

exports.prod = series(prodSet, prodClean, this.default);
