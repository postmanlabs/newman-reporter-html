var fs = require('fs'),
    _ = require('lodash'),

    htmlErrorTable = '<thead><tr><th>Name</th><th>Pass count</th><th>Fail count</';

describe('Newman Library', function () {
    var outFile = 'out/newman-report.html';

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
        newman.run({
            collection: 'test/fixtures/single-get-request.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err) {
            if (err) { return done(err); }

            fs.stat(outFile, done);
        });
    });

    it('should correctly generate the html report for a failed run', function (done) {
        newman.run({
            collection: 'test/fixtures/single-request-failing.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 1 failure').to.have.lengthOf(1);
            fs.stat(outFile, done);
        });
    });

    it('should correctly produce the html report for a run with AssertionError/TypeError', function (done) {
        newman.run({
            collection: 'test/fixtures/newman-report-test.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 2 failures').to.have.lengthOf(2);
            fs.stat(outFile, done);
        });
    });

    it('should correctly produce the html report for a run with one or more failed requests', function (done) {
        newman.run({
            collection: 'test/fixtures/failed-request.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 1 failure').to.have.lengthOf(1);
            fs.stat(outFile, done);
        });
    });

    // eslint-disable-next-line max-len
    it('should correctly produce the html report when successful assertions are to be suppressed (failing assertion)', function (done) {
        newman.run({
            collection: 'test/fixtures/single-request-failing.json',
            reporters: ['html'],
            reporter: { html: { export: outFile, noSuccessAssertions: true } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 1 failure').to.have.lengthOf(1);
            fs.readFile(outFile, 'utf8', function (err, contents) {
                expect(err).to.be.null;
                expect(_.includes(contents, htmlErrorTable), 'assertion table should be present').to.be.true;
                done();
            });
        });
    });

    // eslint-disable-next-line max-len
    it('should correctly produce the html report when successful assertions are to be suppressed (passing assertion)', function (done) {
        newman.run({
            collection: 'test/fixtures/single-get-request.json',
            reporters: ['html'],
            reporter: { html: { export: outFile, noSuccessAssertions: true } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 0 failure').to.have.lengthOf(0);
            fs.readFile(outFile, 'utf8', function (err, contents) {
                expect(err).to.be.null;
                expect(_.includes(contents, htmlErrorTable), 'assertion table should not be present').to.be.false;
                done();
            });
        });
    });
});
