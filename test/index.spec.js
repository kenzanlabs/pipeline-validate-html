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
var handyman = require('pipeline-handyman');

var gutil = require('gulp-util');

var expect = chai.expect;

var validateHTMLPipeline = require('../src/index');
var readFileStub;

chai.use(sinonChai);
chai.use(dirtyChai);

describe('pipeline-validate-html', function () {

  beforeEach(function () {
    readFileStub = readFileStub || sinon.stub(fs, 'readFileSync').returns('{"attr-name-style": "lowercase"}');
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
            rules: {
              'attr-name-style': 'dash'
            }
          };

        });

        it('should NOT format the options when an invalid rules value is provided', function () {
          var spy = sinon.spy(handyman, 'mergeConfig');
          var invalidConfig = {
            rules: []
          };

          validateHTMLPipeline.validateHTML(invalidConfig);

          expect(spy).to.have.not.been.called();

          handyman.mergeConfig.restore();
        });

        it('should output a message when the default config file does not exist', function () {
          var spy = sinon.stub(handyman, 'log');

          readFileStub.throwsException(); // eslint-disable-line

          validateHTMLPipeline.validateHTML(customConfig);

          expect(spy).to.have.been.calledWithMatch('Could not retrieve default options from included config file at');

          handyman.log.restore();
        });

        it('should format the provided options to the default options structure', function () {
          var spy = sinon.spy(handyman, 'mergeConfig');

          readFileStub.returns('{"attr-name-style": "lowercase"}');

          validateHTMLPipeline.validateHTML(customConfig);

          expect(spy).to.have.been.calledTwice();

          expect(spy.getCall(0).args[0]['attr-name-style']).to.equal('lowercase');
          expect(spy.getCall(0).args[1]).to.eql(customConfig.rules);

          expect(spy.getCall(1).args[1].rules['attr-name-style']).to.equal(customConfig.rules['attr-name-style']);

          handyman.mergeConfig.restore();
        });

        it('should set the options.config property to null when a rules object is passed', function () {
          var spy = sinon.spy(handyman, 'mergeConfig');

          validateHTMLPipeline.validateHTML(customConfig);

          expect(spy).to.have.been.calledTwice();

          expect(spy.getCall(1).args[1].config).to.be.null();

          handyman.mergeConfig.restore();
        });

      });

      describe('validateHTML provided a custom file path', function () {

        it('should NOT merge the options when the provided options.config value is not a string', function () {
          var spy = sinon.spy(handyman, 'mergeConfig');
          var invalidConfig = { config: {} };

          validateHTMLPipeline.validateHTML(invalidConfig);

          expect(spy).to.have.not.been.called();

          handyman.mergeConfig.restore();

        });

        it('should replace the default path with the provide file path', function () {
          var spy = sinon.spy(handyman, 'mergeConfig');
          var customPathConfig = { config: 'custom/path/to/.htmllintrc' };

          validateHTMLPipeline.validateHTML(customPathConfig);

          expect(spy).to.have.been.calledOnce();
          expect(spy.getCall(0).args[0].config).to.match(/node_modules\/pipeline-validate-html\/.htmllintrc/);
          expect(spy.getCall(0).args[1].config).to.equal(customPathConfig.config);

          handyman.mergeConfig.restore();
        });

      });

      describe('validateHTML provided custom rules AND a custom file path', function () {
        var customFilePath = 'custom/path/to/config/.htmllintrc';
        var customFileRules = '{"attr-name-style": "dash"}';
        var customProvidedRules = { 'attr-name-style': 'underscore' };

        beforeEach(function () {
          readFileStub
            .withArgs(customFilePath, 'utf8')
            .returns(customFileRules);
        });

        it('should output a message when the custom config file does not exist', function () {
          var spy = sinon.stub(handyman, 'log').returns(undefined);

          readFileStub
            .withArgs(customFilePath, 'utf8')
            .throwsException();

          validateHTMLPipeline.validateHTML({
            config: customFilePath,
            rules: {}
          });

          expect(spy).to.have.been.calledWithMatch('Could not retrieve custom options from included config file at ');

          handyman.log.restore();
        });

        it('should retrieve the custom file rules', function () {

          validateHTMLPipeline.validateHTML({
            config: customFilePath,
            rules: {}
          });

          expect(readFileStub).to.have.been.calledWith(customFilePath, 'utf8');

        });

        it('should overwrite the custom file rule by a provided rule', function () {
          var spy = sinon.spy(handyman, 'mergeConfig');

          validateHTMLPipeline.validateHTML({
            config: customFilePath,
            rules: customProvidedRules
          });

          expect(spy).to.have.been.calledWith(JSON.parse(customFileRules), customProvidedRules);

          handyman.mergeConfig.restore();
        });

      });
    });

  });

});