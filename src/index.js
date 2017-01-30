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
  var customRules;

  if (typeof options === 'object') {

    if (typeof options.rules === 'object' && typeof options.config === 'string') {

      try {
        customRules = JSON.parse(fs.readFileSync(options.config, 'utf8'));
        config = handyman.mergeConfig(retrieveDefaultRules(), handyman.mergeConfig(customRules, options.rules));

      } catch (ex) {
        handyman.log('Could not retrieve custom options from included config file at ' + options.config);

      }

    } else {

      if (typeof options.rules === 'object' && !Array.isArray(options.rules)) {
        config.rules = handyman.mergeConfig(retrieveDefaultRules(), options.rules);
        config.config = null;

        config = handyman.mergeConfig(DEFAULT_CONFIG, config);

      } else if (typeof options.config === 'string') {
        config = handyman.mergeConfig(DEFAULT_CONFIG, options);

      } else {
        config = DEFAULT_CONFIG;

      }

    }

  } else {
    config = DEFAULT_CONFIG;

  }

  var rules;

  if (typeof options === 'object') {

    rules = handyman.mergeConfig(retrieveDefaultOptions(), options.rules);

    options = handyman.mergeConfig(DEFAULT_CONFIG, {
      rules: rules,
      config: null
    });

  } else if (typeof options === 'string') {
    // NOOP

  } else {
    options = DEFAULT_CONFIG;

  }

  stream = lazypipe()
    .pipe(htmllint, config);

  return stream();
}

function retrieveDefaultRules () {
  var defaultOptions = {};

  try {
    defaultOptions = JSON.parse(fs.readFileSync(DEFAULT_RULES_PATH, 'utf8'));

  } catch (ex) {
    handyman.log('Could not retrieve default options from included config file at ' + DEFAULT_RULES_PATH);

  }

  return defaultOptions;
}