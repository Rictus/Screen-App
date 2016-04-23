'use strict';
var gulp = require('gulp');

var gulpServer = require('./gulpfile_server.js')(gulp);
var gulpCss = require('./gulpfile_css.js')(gulp, gulpServer.getBrowserSyncInstance);
var gulpHtml = require('./gulp_html.js')(gulp, gulpServer.getBrowserSyncInstance);
var gulpJs = require('./gulpfile_js.js')(gulp, gulpServer.getBrowserSyncInstance);
var gulpImg = require('./gulpfile_img.js')(gulp);
var tasksToCompleteBeforeBrowser = [];
var tasksThatReloadBrowser = [];
var startupTasks = [];
var tksNames;
var megaConf = {
    css: {
        active: true,
        module: gulpCss,
        dev: {
            active: true,
            streamCss: false,
            watchPath: "../public/CSS/**/*.less",
            destPath: "../public/CSS/",
            concat: true,
            renameTo: "diaporama.css",
            autoprefix: true,
            autoprefixString: '> 1%',
            less: true,
            minify: true
        }
    },
    js: {
        active: false,
        module: gulpJs,
        dev: {
            active: false,
            streamJs: false,
            watchPath: "../public/JS/**/*.js",
            destPath: "../public/JS/",
            concat: true,
            renameTo: 'global.min.js',
            uglify: true
        }
    },
    img: {
        active: false,
        module: gulpImg,
        dev: {
            active: false,
            watchPath: "../dev/img/**/*.{png,jpg,jpeg,gif,svg}",
            destPath: "../dev-public/img/"
        }
    },
    html: {
        active: false,
        module: gulpHtml,
        dev: {
            active: false,
            streamHTML: false,
            watchPath: "../dev/*.html",
            destPath: "../dev-public/",
            minify: false
        }
    }
};

var browerSync = {
    active: false,
    baseDir: "../prod/",
    indexUrl: "index_color.html",
    serverPort: 3001,
    browsers: ["google chrome"],
    reloadOnTasks: []
};


///loop through confs

for (var key in megaConf) {
    if (megaConf.hasOwnProperty(key) && megaConf[key].active) {
        var responsibleModule = megaConf[key].module;
        responsibleModule.init(megaConf[key]);
        tksNames = responsibleModule.getTasksNames();
        tasksToCompleteBeforeBrowser = tasksToCompleteBeforeBrowser.concat(tksNames);
        tasksThatReloadBrowser = tasksThatReloadBrowser.concat(tksNames);
        startupTasks = startupTasks.concat(tksNames);
    }
}

if (browerSync.active) {
    gulpServer.init(browerSync, tasksToCompleteBeforeBrowser, tasksThatReloadBrowser);
    startupTasks.push(gulpServer.getTasksNames());
}

gulp.task('default', startupTasks, function () {
    console.log(startupTasks);
});
