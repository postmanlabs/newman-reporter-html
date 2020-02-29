const fs = require('fs');
const _ = require('lodash');

var htmlErrorTable = '<thead><tr><th>Name</th><th>Pass count</th><th>Fail count</';

describe('Newman CLI', function () {
    const outFile = 'out/newman-report.html',
        newman = 'node ./.temp/node_modules/newman/bin/newman.js';

    beforeEach(function (done) {
        fs.stat('out', function (err) {
            if (err) {
                return fs.mkdir('out', done);
            }

            done();
        });
    });

    afterEach(function (done) {
        fs.stat(outFile, function (err) {
            if (err) {
                return done();
            }

            fs.unlink(outFile, done);
        });
    });

    it('should correctly generate the html report for a successful run', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/single-get-request.json -r html --reporter-html-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 0').to.equal(0);
                fs.stat(outFile, done);
            });
    });

    it('should correctly generate the html report for a failed run', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/single-request-failing.json -r html --reporter-html-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 1').to.equal(1);
                fs.stat(outFile, done);
            });
    });

    it('should correctly produce the html report for a run with TypeError', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/newman-report-test.json -r html --reporter-html-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 1').to.equal(1);
                fs.stat(outFile, done);
            });
    });

    it('should correctly produce the html report for a run with one or more failed requests', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/failed-request.json -r html --reporter-html-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 1').to.equal(1);
                fs.stat(outFile, done);
            });
    });

    // eslint-disable-next-line max-len
    it('should correctly produce the html report when successful assertions are to be suppressed (failing assertion)', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/single-request-failing.json -r html --reporter-html-no-success-assertions --reporter-html-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 1').to.equal(1);
                fs.readFile(outFile, 'utf8', function (err, contents) {
                    expect(err).to.be.null;
                    expect(_.includes(contents, htmlErrorTable), 'assertion table should be present').to.be.true;
                    done();
                });
            });
    });

    // eslint-disable-next-line max-len
    it('should correctly produce the html report when successful assertions are to be suppressed (passing assertion)', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/single-get-request.json -r html --reporter-html-no-success-assertions --reporter-html-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 0').to.be.equal(0);

                fs.readFile(outFile, 'utf8', function (err, contents) {
                    expect(err).to.be.null;
                    expect(_.includes(contents, htmlErrorTable), 'assertion table should not be present').to.be.false;
                    done();
                });
            });
    });
});
