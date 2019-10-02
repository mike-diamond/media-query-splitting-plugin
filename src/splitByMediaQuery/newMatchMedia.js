"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cssMediaquery = require("css-mediaquery");

var matchMedia = function matchMedia(_ref) {
  var mediaQuery = _ref.mediaQuery,
      mediaOptions = _ref.mediaOptions;
  var mediaResults = {};
  Object.keys(mediaOptions).forEach(function (mediaKey) {
    var mediaOption = mediaOptions[mediaKey];
    mediaResults[mediaKey] = (0, _cssMediaquery.match)(mediaQuery, (0, _cssMediaquery.parse)(mediaOption));
  });
  return mediaResults;
};

var _default = matchMedia;
exports.default = _default;