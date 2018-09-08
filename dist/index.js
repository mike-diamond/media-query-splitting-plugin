"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var splitByMediaQuery = require('./splitByMediaQuery');

module.exports =
/*#__PURE__*/
function () {
  function MediaQuerySplittingPlugin(options) {
    _classCallCheck(this, MediaQuerySplittingPlugin);

    var _ref = options || {},
        _ref$media = _ref.media,
        media = _ref$media === void 0 ? {} : _ref$media,
        splitTablet = _ref.splitTablet;

    this.options = {
      media: {
        mobileEnd: media.mobileEnd || 568,
        tabletPortraitStart: media.mobileEnd ? media.mobileEnd + 1 : 569,
        tabletPortraitEnd: media.tabletPortraitEnd || 768,
        tabletLandscapeStart: media.tabletPortraitEnd ? media.tabletPortraitEnd + 1 : 769,
        tabletLandscapeEnd: media.tabletLandscapeEnd || 1024,
        desktopStart: media.tabletLandscapeEnd ? media.tabletLandscapeEnd + 1 : 1025
      },
      splitTablet: splitTablet !== false
    };
  }

  _createClass(MediaQuerySplittingPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this$options = this.options,
          mediaOptions = _this$options.media,
          splitTablet = _this$options.splitTablet;
      var pluginName = 'media-query-splitting-plugin';
      compiler.hooks.thisCompilation.tap(pluginName, function (compilation) {
        compilation.mainTemplate.hooks.requireEnsure.tap(pluginName, function (source, chunk, hash) {
          var hasChunkLodaing = /mini-css-extract-plugin CSS loading/.test(source);

          if (hasChunkLodaing) {
            var matchMediaPolyfill = "\n            // matchMedia polyfill\n            window.matchMedia||(window.matchMedia=function(){\"use strict\";var e=window.styleMedia||window.media;if(!e){var t,d=document.createElement(\"style\"),i=document.getElementsByTagName(\"script\")[0];d.type=\"text/css\",d.id=\"matchmediajs-test\",i?i.parentNode.insertBefore(d,i):document.head.appendChild(d),t=\"getComputedStyle\"in window&&window.getComputedStyle(d,null)||d.currentStyle,e={matchMedium:function(e){var i=\"@media \"+e+\"{ #matchmediajs-test { width: 1px; } }\";return d.styleSheet?d.styleSheet.cssText=i:d.textContent=i,\"1px\"===t.width}}}return function(t){return{matches:e.matchMedium(t||\"all\"),media:t||\"all\"}}}());\n            \n            // Define current mediaType\n            var getMediaType = function() {\n              return {\n                isMobile: window.matchMedia('(max-width: ".concat(mediaOptions.mobileEnd, "px)').matches,\n                isTabletPortrait: window.matchMedia('(min-width: ").concat(mediaOptions.tabletPortraitStart, "px) and (max-width: ").concat(mediaOptions.tabletPortraitEnd, "px)').matches,\n                isTabletLandscape: window.matchMedia('(min-width: ").concat(mediaOptions.tabletLandscapeStart, "px) and (max-width: ").concat(mediaOptions.tabletLandscapeEnd, "px)').matches,\n                isDesktop: window.matchMedia('(min-width: ").concat(mediaOptions.desktopStart, "px)').matches,\n              }\n            };\n\n            var mediaType = getMediaType();\n            var currentMediaType    = 'desktop';\n\n            if (mediaType.isMobile) {\n              currentMediaType      = 'mobile'\n            }\n            ").concat(splitTablet ? "\n                else if (mediaType.isTabletPortrait) {\n                  currentMediaType      = 'tabletPortrait'\n                }\n                else if (mediaType.isTabletLandscape) {\n                  currentMediaType      = 'tabletLandscape'\n                }" : "\n                else if (mediaType.isTabletPortrait || mediaType.isTabletLandscape) {\n                  currentMediaType      = 'tablet'\n                }\n              ", "\n            var tryAppendNewMedia = function() {\n              var linkElements      = document.getElementsByTagName('link');\n              var chunkIds = {};\n              \n              for (var i = 0; i < linkElements.length; i++) {\n                var chunkHref       = linkElements[i].href.replace(/.*\\//, '');\n                var chunkId         = chunkHref.replace(/\\..*/, '');\n                var chunkMediaType  = chunkHref.replace(chunkId + '.', '').replace(/\\..*/, '');\n                var chunkHash       = chunkHref.replace(/\\.css$/, '').replace('' + chunkId + '.' + chunkMediaType + '.', '');\n                var chunkHrefPrefix = linkElements[i].href.replace('' + chunkId + '.' + chunkMediaType + '.' + chunkHash + '.css', '');\n\n                if (!chunkIds[chunkId]) {\n                  chunkIds[chunkId] = {\n                    mediaTypes: [ chunkMediaType ],\n                    hash: chunkHash,\n                    prefix: chunkHrefPrefix,\n                  }\n                }\n                else {\n                  chunkIds[chunkId].mediaTypes.push(chunkMediaType);\n                }\n              }\n\n              for (var i in chunkIds) {\n                if (chunkIds.hasOwnProperty(i)) {\n                  var isTablet          = /tablet/.test(currentMediaType);\n                  var hasTablet         = chunkIds[i].mediaTypes.indexOf('tablet') !== -1;\n                  var _hasCurrentMedia  = chunkIds[i].mediaTypes.indexOf(currentMediaType) !== -1;\n                  var hasCurrentMedia   = isTablet ? hasTablet || _hasCurrentMedia : _hasCurrentMedia;\n                  \n                  if (!hasCurrentMedia) {\n                    var fullhref        = '' + chunkIds[i].prefix + '' + i + '.' + currentMediaType + '.' + chunkIds[i].hash + '.css';\n                    var linkTag         = document.createElement('link');\n                    var header          = document.getElementsByTagName('head')[0];\n\n                    linkTag.rel         = 'stylesheet';\n                    linkTag.type        = 'text/css';\n                    linkTag.href        = fullhref;\n\n                    header.appendChild(linkTag);\n                  }\n                }\n              }\n            };\n\n            var resize = function() {\n              var newMediaType\n              var mediaType = getMediaType();\n\n              if (mediaType.isMobile) {\n                newMediaType = 'mobile'\n              }\n              ").concat(splitTablet ? "\n                  else if (mediaType.isTabletPortrait) {\n                    newMediaType = 'tabletPortrait'\n                  }\n                  else if (mediaType.isTabletLandscape) {\n                    newMediaType = 'tabletLandscape'\n                  }\n                " : "\n                  else if (mediaType.isTabletPortrait || mediaType.isTabletLandscape) {\n                    newMediaType = 'tablet'\n                  }\n                ", "\n              else {\n                newMediaType = 'desktop'\n              }\n\n              if (currentMediaType !== newMediaType) {\n                currentMediaType = newMediaType;\n              }\n              \n              tryAppendNewMedia()\n            };\n\n            document.addEventListener('DOMContentLoaded', function() {\n              window.addEventListener('resize', resize);\n              resize();\n            });\n          ");
            var promisesString = 'promises.push(installedCssChunks[chunkId] = new Promise(function(resolve, reject) {';
            var newPromisesString = "promises.push(installedCssChunks[chunkId] = Promise.all([ 'common', currentMediaType ]\n            .map((mediaType) => new Promise(function(resolve, reject) {\n              \n              // Don't load tabletPortrait or tabletLandscape if there is tablet style\n              if (/tablet/.test(mediaType)) {\n                var linkElements = document.getElementsByTagName('link');\n                var hasTabletStyle = false;\n\n                for (var i = 0; i < linkElements.length; i++) {\n                  var chunkHref = linkElements[i].href.replace(/.*\\//, '');\n                  var currentChunkRegExp = new RegExp('^' + chunkId + '\\\\' + '.tablet' + '\\\\' + '.') \n                  \n                  if (currentChunkRegExp.test(chunkHref)) {\n                    mediaType = 'tablet';\n                    break;\n                  }\n                }\n              }\n          ";
            var promisesBottomRegExp = /head\.appendChild\(linkTag\);(.|\n)*}\)\.then/;
            var newPromisesBottomString = 'head.appendChild(linkTag);resize();\n})\n)).then';
            var hrefString = 'var href = "" + chunkId + "." + ';
            var mediaTypeString = 'var href = "" + chunkId + "." + mediaType + "." +';
            return source.replace(promisesString, "".concat(matchMediaPolyfill).concat(newPromisesString)).replace(hrefString, mediaTypeString).replace(promisesBottomRegExp, newPromisesBottomString);
          } else {
            throw new Error('No chunk loading found! Use mini-css-extract-plugin to handle this error');
          }
        });
      });
      compiler.plugin('emit', function (compilation, callback) {
        var cssChunks = Object.keys(compilation.assets).filter(function (asset) {
          return /\.css$/.test(asset);
        }); // Split each css chunk

        cssChunks.forEach(function (chunkName) {
          var chunkValue = compilation.assets[chunkName].children[0]._value;
          var splittedValue = splitByMediaQuery({
            cssFile: chunkValue,
            mediaOptions: mediaOptions
          });
          var chunkHash = chunkName.replace(/\.css$/, '').replace(/.*\./, '');
          var chunkId = chunkName.replace(/\..*/, '');
          Object.keys(splittedValue).forEach(function (mediaType) {
            var splittedMediaChunk = splittedValue[mediaType];

            if (splittedMediaChunk && (splitTablet || !/tablet(Portrait|Landscape)/.test(mediaType))) {
              var splittedMediaChunkName = "".concat(chunkId, ".").concat(mediaType, ".").concat(chunkHash, ".css"); // Add chunk to assets

              compilation.assets[splittedMediaChunkName] = {
                size: function size() {
                  return Buffer.byteLength(splittedMediaChunk, 'utf8');
                },
                source: function source() {
                  return new Buffer(splittedMediaChunk);
                }
              };
            }
          });
        });
        callback();
      });
    }
  }]);

  return MediaQuerySplittingPlugin;
}();