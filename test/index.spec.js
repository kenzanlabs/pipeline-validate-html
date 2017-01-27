'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var isStream = require('isstream');
var fs = require('fs');
var path = require('path');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gutil = require('gulp-util');

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

    describe('validateHTML implementation', function () {

      it('should output an error via gulp-util when an invalid HTML file is found', function (done) {

        /*
        gulp-htmllint uses gulp-util internally to output the error messages.
        We stub the log method to A) verify it has been called; B) return an empty array to reduce output during testing
         */
        var spy = sinon.stub(gutil, 'log').returns([]);

        fs.createReadStream(path.join(process.cwd(), '/test/fixtures/invalid-html.html'))
          .pipe(source('invalid-html.html'))
          .pipe(buffer())
          .pipe(validateHTMLPipeline.validateHTML())
          .on('finish', function () {
            expect(spy).to.have.been.called();
            expect(spy.getCall(0).args[0]).to.match(/(line \d)\s(col \d)/);

            done();
          });

      });

    });

  });

});