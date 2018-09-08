"use strict";

var css = require('css');

var CleanCSS = require('clean-css');

var matchMedia = require('./matchMedia');

module.exports = function (_ref) {
  var cssFile = _ref.cssFile,
      mediaOptions = _ref.mediaOptions;
  var output = {};
  var inputRules = css.parse(cssFile).stylesheet.rules;
  var outputRules = {
    common: [],
    desktop: [],
    mobile: [],
    tabletPortrait: [],
    tabletLandscape: [],
    tablet: []
  };
  inputRules.forEach(function (_ref2, index) {
    var type = _ref2.type,
        media = _ref2.media;

    var _matchMedia = matchMedia({
      mediaQuery: media,
      mediaOptions: mediaOptions
    }),
        isDesktop = _matchMedia.isDesktop,
        isTablet = _matchMedia.isTablet,
        isTabletLandscape = _matchMedia.isTabletLandscape,
        isTabletPortrait = _matchMedia.isTabletPortrait,
        isMobile = _matchMedia.isMobile;

    var rule = inputRules[index];
    var isNoMatch = !isDesktop && !isTablet && !isMobile;

    if (type === 'media') {
      if (isDesktop) {
        outputRules.desktop.push(rule);
      }

      if (isTabletLandscape) {
        outputRules.tablet.push(rule);
        outputRules.tabletLandscape.push(rule);
      }

      if (isTabletPortrait) {
        outputRules.tablet.push(rule);
        outputRules.tabletPortrait.push(rule);
      }

      if (isMobile) {
        outputRules.mobile.push(rule);
      }

      if (isNoMatch) {
        outputRules.common.push(rule);
      }
    } else {
      outputRules.common.push(rule);
    }
  });
  Object.keys(outputRules).forEach(function (key) {
    output[key] = [];
    var rules = outputRules[key]; // Merge duplicates media conditions

    rules.forEach(function (rule, index) {
      var media = rule.media,
          rules = rule.rules,
          position = rule.position;
      var mediaIndex = output[key].map(function (_ref3) {
        var media = _ref3.media;
        return media;
      }).indexOf(media);

      if (!media || mediaIndex < 0) {
        output[key].push(rule);
      } else {
        output[key][mediaIndex].rules = output[key][mediaIndex].rules.concat(rules);
      }
    }); // Stringify styles

    var style = css.stringify({
      type: 'stylesheet',
      stylesheet: {
        rules: output[key]
      }
    }); // Minify styles

    output[key] = new CleanCSS().minify(style).styles;
  });
  return output;
};