'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var dirtyChai = require('dirty-chai');
var isStream = require('isstream');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var handyman = require('pipeline-handyman');

var gutil = require('gulp-util');

var expect = chai.expect;

var validateHTMLPipeline = require('../src/index');

chai.use(sinonChai);
chai.use(dirtyChai);

describe('pipeline-validate-html', function () {

  var nodePath;

  beforeEach(function (done) {
    /*
     To mimic an environment in which this pipeline will be used,
     it's necessary to have a "node_modules/pipeline-validate-html/" directory with a .htmllintrc file.
     To ensure this file exists, a simple stream is used to generate the file in
     the appropriate location.
     */

    var localPath = path.join(process.cwd());

    nodePath = path.join(process.cwd(), 'node_modules/pipeline-validate-html/');

    if (!fs.existsSync(nodePath)) {
      fs.mkdirSync(nodePath);

      fs.createReadStream(localPath + '/.htmllintrc')
        .pipe(fs.createWriteStream(nodePath + '/.htmllintrc'))
        .on('finish', done);

    } else {
      done();

    }

  });

  after(function () {
    /*
     Delete temporary pipeline-validate-css directory after testing is complete.
     */
    if (fs.existsSync(nodePath)) {
      rimraf.sync(nodePath);
    }
  });

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
        var fileName = 'invalid-html.html';

        fs.createReadStream(path.join(process.cwd(), '/test/fixtures/', fileName))
          .pipe(source(fileName))
          .pipe(buffer())
          .pipe(validateHTMLPipeline.validateHTML())
          .on('finish', function () {
            expect(spy).to.have.been.called();
            expect(spy.getCall(0).args[0]).to.match(/(line \d)\s(col \d)/);

            gutil.log.restore();

            done();
          });

      });

      it('should NOT output an error via gulp-util when a valid HTML file is found', function (done) {

        /*
         gulp-htmllint uses gulp-util internally to output the error messages.
         We stub the log method to A) verify it has been called; B) return an empty array to reduce output during testing
         */
        var spy = sinon.stub(gutil, 'log').returns([]);
        var fileName = 'valid-html.html';

        fs.createReadStream(path.join(process.cwd(), '/test/fixtures/', fileName))
          .pipe(source(fileName))
          .pipe(buffer())
          .pipe(validateHTMLPipeline.validateHTML())
          .on('finish', function () {
            expect(spy).to.have.not.been.called();

            done();
          });

      });

      describe('validateHTML provided a custom options object', function () {

        var customConfig;

        beforeEach(function () {
          customConfig = {
            'attr-name-style': 'dash'
          };

        });

        it('should output a message when the default config file does not exist', function () {
          var spy = sinon.stub(handyman, 'log');

          // remove the generated mock to simulate non-existence
          rimraf.sync(nodePath);

          validateHTMLPipeline.validateHTML(customConfig);

          expect(spy).to.have.been.calledWithMatch('Could not retrieve default options from included config file at');
        });

        it('should format the provided options to the default options structure', function () {
          var spy = sinon.spy(handyman, 'mergeConfig');

          validateHTMLPipeline.validateHTML(customConfig);

          expect(spy).to.have.been.calledTwice();

          expect(spy.getCall(0).args[0]['attr-name-style']).to.equal('lowercase');
          expect(spy.getCall(0).args[1]).to.eql(customConfig);

          expect(spy.getCall(1).args[1].rules['attr-name-style']).to.equal(customConfig['attr-name-style']);

          handyman.mergeConfig.restore();
        });

      });

    });

  });

});