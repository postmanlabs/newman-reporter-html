#!/usr/bin/env node
/* global test, mkdir, rm, exit */
require('shelljs/global');
require('colors');

var fs = require('fs'),
    path = require('path'),
    Mocha = require('mocha'),
    expect = require('chai').expect,
    newman = require('../node_modules/newman'),
    recursive = require('recursive-readdir'),

    NYC = require('nyc'),

    COV_REPORT_PATH = '.coverage',

    /**
     * The directory containing integration test specs.
     *
     * @type {String}
     */
    SPEC_SOURCE_DIR = './test/integration';

module.exports = function (exit) {
    // banner line
    console.info('Running Integration tests using mocha and shelljs...'.yellow.bold);

    test('-d', COV_REPORT_PATH) && rm('-rf', COV_REPORT_PATH);
    mkdir('-p', COV_REPORT_PATH);

    var mocha = new Mocha({ timeout: 60000 }),
        nyc = new NYC({
            reporter: ['text', 'text-summary', 'lcov'],
            reportDir: COV_REPORT_PATH,
            tempDirectory: COV_REPORT_PATH
        }),
        parentDir = path.join(__dirname, '..'),
        symlinkDir = parentDir + '/node_modules/newman-reporter-html';

    nyc.wrap();

    recursive(SPEC_SOURCE_DIR, function (err, files) {
        if (err) {
            console.error(err);

            return exit(1);
        }

        files.filter(function (file) {
            return (file.substr(-8) === '.test.js');
        }).forEach(function (file) {
            mocha.addFile(file);
        });

        // start the mocha run
        global.expect = expect; // for easy reference
        global.newman = newman;

        // create symlink so that Newman can locate the reporter
        fs.existsSync(symlinkDir) && fs.unlinkSync(symlinkDir);
        fs.symlinkSync(parentDir, symlinkDir);

        mocha.run(function (err) {
            // remove reporter symlink
            fs.unlinkSync(symlinkDir);

            // clear references and overrides
            delete global.expect;
            delete global.newman;

            nyc.reset();
            nyc.writeCoverageFile();
            nyc.report();
            exit(err);
        });
        mocha = null; // cleanup
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
