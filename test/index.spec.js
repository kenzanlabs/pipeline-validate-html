'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var isStream = require('isstream');
var htmlhint = require('gulp-htmlhint');
var fs = require('fs');
var path = require('path');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var expect = chai.expect;

var validateHTMLPipeline = require('../src/index');

chai.use(sinonChai);
chai.use(dirtyChai);

describe('pipeline-validate-html', function () {

  describe('validateHTML Method', function () {

    it('should expose a validateHTML method', function () {
      expect(validateHTMLPipeline.validateHTML).to.exist();
      expect(validateHTMLPipeline.validateHTML).to.be.a('function');
    });

    it('should return a stream object', function () {
      expect(validateHTMLPipeline.validateHTML()).to.be.an('object');
      expect(isStream(validateHTMLPipeline.validateHTML())).to.be.true();
    });

    it('should ensure that the output reporter is used', function () {
      var spy = sinon.spy(htmlhint, 'reporter');

      validateHTMLPipeline.validateHTML();

      expect(spy).to.have.been.called();

      htmlhint.reporter.restore();
    });

    it('should ensure that the fail reporter is used', function () {
      var spy = sinon.spy(htmlhint, 'failReporter');

      validateHTMLPipeline.validateHTML();

      expect(spy).to.have.been.called();

      htmlhint.failReporter.restore();
    });

    describe('validateHTML implementation', function () {

      it('should output an error when an invalid HTML file is found', function (done) {

        fs.createReadStream(path.join(process.cwd(), '/test/fixtures/invalid-html.html'))
          .pipe(source('invalid-html.html'))
          .pipe(buffer())
          .pipe(validateHTMLPipeline.validateHTML())
          .on('error', function (err) {
            expect(err.message).to.contain('errors found');

            done();
          });

      });

    });

  });

});