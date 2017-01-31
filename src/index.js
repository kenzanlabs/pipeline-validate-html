'use strict';

var htmllint = require('gulp-htmllint');
var lazypipe = require('lazypipe');
var path = require('path');
var handyman = require('pipeline-handyman');
var fs = require('fs');

var DEFAULT_RULES_PATH = path.join(process.cwd(), 'node_modules/pipeline-validate-html/.htmllintrc');
var DEFAULT_CONFIG = {
  rules: {},
  config: DEFAULT_RULES_PATH,
  plugins: [],
  failOnError: false
};

module.exports = {

  validateHTML: function (options) {
    return pipelineFactory(options);
  }

};

function pipelineFactory (options) {
  var stream;
  var config = {};

  if (typeof options === 'object') {

    if (typeof options.rules === 'object' && !Array.isArray(options.rules)) {
      config.rules = handyman.mergeConfig(retrieveDefaultOptions(), options.rules);
      config.config = null;

      config = handyman.mergeConfig(DEFAULT_CONFIG, config);

    } else if (typeof options.config === 'string') {
      config = handyman.mergeConfig(DEFAULT_CONFIG, options);

    } else if (options.rules && options.config) {
      // validate that rules is not empty
      // validate that config is a string

      // retrieve default options to start
      // retrieve custom config options and merge in
      // merge in custom rules config
      // custom rules take precedent

      // pass to stream
    }

  } else {
    config = DEFAULT_CONFIG;

  }

  stream = lazypipe()
    .pipe(htmllint, config);

  return stream();
}

function retrieveDefaultOptions () {
  var defaultOptions = {};

  try {
    defaultOptions = JSON.parse(fs.readFileSync(DEFAULT_RULES_PATH, 'utf-8'));

  } catch (ex) {
    handyman.log('Could not retrieve default options from included config file at ' + DEFAULT_RULES_PATH);

  }

  return defaultOptions;
}