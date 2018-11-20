const splitByMediaQuery  = require('./splitByMediaQuery')


module.exports = class MediaQuerySplittingPlugin {

  constructor(options) {
    const { media = {}, splitTablet } = options || {}

    this.options = {
      media: {
        mobileEnd: media.mobileEnd || 568,
        tabletPortraitStart: media.mobileEnd ? media.mobileEnd + 1 : 569,
        tabletPortraitEnd: media.tabletPortraitEnd || 768,
        tabletLandscapeStart: media.tabletPortraitEnd ? media.tabletPortraitEnd + 1 : 769,
        tabletLandscapeEnd: media.tabletLandscapeEnd || 1024,
        desktopStart: media.tabletLandscapeEnd ? media.tabletLandscapeEnd + 1 : 1025,
      },
      splitTablet: splitTablet !== false,
    }
  }

  apply(compiler) {
    const { media: mediaOptions, splitTablet } = this.options

    const pluginName = 'media-query-splitting-plugin'

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.mainTemplate.hooks.requireEnsure.tap(pluginName, (source, chunk, hash) => {
        const hasChunkLodaing = /mini-css-extract-plugin CSS loading/.test(source)

        if (hasChunkLodaing) {
          // let chunks                     = source.replace(/(.|\n)*var href = "" \+ chunkId \+ "\." \+ /, '').replace(/\[chunkId\](.|\n)*/, '')
          //
          // try {
          //   chunks                       = JSON.parse(chunks)
          //   chunks                       = Object.values(chunks)
          // }
          // catch (err) {
          //   throw new Error('Parse chunks error. Try use mini-css-extract-plugin v0.4.3')
          // }

          const matchMediaPolyfill       = `
            // matchMedia polyfill
            window.matchMedia||(window.matchMedia=function(){"use strict";var e=window.styleMedia||window.media;if(!e){var t,d=document.createElement("style"),i=document.getElementsByTagName("script")[0];d.type="text/css",d.id="matchmediajs-test",i?i.parentNode.insertBefore(d,i):document.head.appendChild(d),t="getComputedStyle"in window&&window.getComputedStyle(d,null)||d.currentStyle,e={matchMedium:function(e){var i="@media "+e+"{ #matchmediajs-test { width: 1px; } }";return d.styleSheet?d.styleSheet.cssText=i:d.textContent=i,"1px"===t.width}}}return function(t){return{matches:e.matchMedium(t||"all"),media:t||"all"}}}());
            
            // Define current mediaType
            var getMediaType = function() {
              return {
                isMobile: window.matchMedia('(max-width: ${mediaOptions.mobileEnd}px)').matches,
                isTabletPortrait: window.matchMedia('(min-width: ${mediaOptions.tabletPortraitStart}px) and (max-width: ${mediaOptions.tabletPortraitEnd}px)').matches,
                isTabletLandscape: window.matchMedia('(min-width: ${mediaOptions.tabletLandscapeStart}px) and (max-width: ${mediaOptions.tabletLandscapeEnd}px)').matches,
                isDesktop: window.matchMedia('(min-width: ${mediaOptions.desktopStart}px)').matches,
              }
            };

            var mediaType                = getMediaType();
            var currentMediaType         = 'desktop';

            if (mediaType.isMobile) {
              currentMediaType           = 'mobile'
            }
            ${splitTablet
            ? `
                else if (mediaType.isTabletPortrait) {
                  currentMediaType       = 'tabletPortrait'
                }
                else if (mediaType.isTabletLandscape) {
                  currentMediaType       = 'tabletLandscape'
                }`
            : `
                else if (mediaType.isTabletPortrait || mediaType.isTabletLandscape) {
                  currentMediaType       = 'tablet'
                }
              `
            }

            var tryAppendNewMedia = function() {
              var linkElements           = document.getElementsByTagName('link');
              var chunkIds               = {};
              
              for (var i = 0; i < linkElements.length; i++) {
                var chunkHref            = linkElements[i].href.replace(/.*\\//, '');
                
                if (/(mobile|tablet|desktop).*\\.css$/.test(chunkHref)) {
                  var chunkId            = chunkHref.replace(/\\..*/, '');
                  var chunkMediaType     = chunkHref.replace(chunkId + '.', '').replace(/\\..*/, '');
                  var chunkHash          = chunkHref.replace(/\\.css$/, '').replace('' + chunkId + '.' + chunkMediaType + '.', '');
                  var chunkHrefPrefix    = linkElements[i].href.replace('' + chunkId + '.' + chunkMediaType + '.' + chunkHash + '.css', '');
  
                  if (!chunkIds[chunkId]) {
                    chunkIds[chunkId]    = {
                      mediaTypes: [ chunkMediaType ],
                      hash: chunkHash,
                      prefix: chunkHrefPrefix,
                    }
                  }
                  else {
                    chunkIds[chunkId].mediaTypes.push(chunkMediaType);
                  }
                }
              }

              for (var i in chunkIds) {
                if (chunkIds.hasOwnProperty(i)) {
                  var isTablet           = /tablet/.test(currentMediaType);
                  var hasTablet          = chunkIds[i].mediaTypes.indexOf('tablet') !== -1;
                  var _hasCurrentMedia   = chunkIds[i].mediaTypes.indexOf(currentMediaType) !== -1;
                  var hasCurrentMedia    = isTablet ? hasTablet || _hasCurrentMedia : _hasCurrentMedia;
                  
                  if (!hasCurrentMedia) {
                    var fullhref         = '' + chunkIds[i].prefix + '' + i + '.' + currentMediaType + '.' + chunkIds[i].hash + '.css';
                    var linkTag          = document.createElement('link');
                    var header           = document.getElementsByTagName('head')[0];

                    linkTag.rel          = 'stylesheet';
                    linkTag.type         = 'text/css';
                    linkTag.href         = fullhref;

                    header.appendChild(linkTag);
                  }
                }
              }
            };

            var resize = function() {
              var newMediaType
              var mediaType              = getMediaType();

              if (mediaType.isMobile) {
                newMediaType             = 'mobile'
              }
              ${splitTablet
            ? `
                  else if (mediaType.isTabletPortrait) {
                    newMediaType         = 'tabletPortrait'
                  }
                  else if (mediaType.isTabletLandscape) {
                    newMediaType         = 'tabletLandscape'
                  }`
            : `else if (mediaType.isTabletPortrait || mediaType.isTabletLandscape) {
                    newMediaType         = 'tablet'
                  }`
            }
              else {
                newMediaType             = 'desktop'
              }

              if (currentMediaType !== newMediaType) {
                currentMediaType         = newMediaType;
              }
              
              tryAppendNewMedia()
            };

            document.addEventListener('DOMContentLoaded', function() {
              window.addEventListener('resize', resize);
              resize();
            });
          `

          const promisesString           = 'promises.push(installedCssChunks[chunkId] = new Promise(function(resolve, reject) {'
          const newPromisesString        = `promises.push(installedCssChunks[chunkId] = Promise.all([ \'common\', currentMediaType ]
            .map((mediaType) => new Promise(function(resolve, reject) {
              
              // Don't load tabletPortrait or tabletLandscape if there is tablet style
              if (/tablet/.test(mediaType)) {
                var linkElements         = document.getElementsByTagName('link');
                var hasTabletStyle       = false;

                for (var i = 0; i < linkElements.length; i++) {
                  var chunkHref          = linkElements[i].href.replace(/.*\\//, '');
                  var currentChunkRegExp = new RegExp('^' + chunkId + '\\\\' + '.tablet' + '\\\\' + '.') 
                  
                  if (currentChunkRegExp.test(chunkHref)) {
                    mediaType            = 'tablet';
                    break;
                  }
                }
              }
          `

          const promisesBottomRegExp     = /head\.appendChild\(linkTag\);(.|\n)*}\)\.then/
          const newPromisesBottomString  = 'head.appendChild(linkTag);resize();\n})\n)).then'

          const hrefString               = 'var href = "" + chunkId + "." + '
          const mediaTypeString          = 'var href = "" + chunkId + (mediaType !== "common" ? "."  + mediaType : "") + "." +'

          return source
            .replace(promisesString, `${matchMediaPolyfill}${newPromisesString}`)
            .replace(hrefString, mediaTypeString)
            .replace(promisesBottomRegExp, newPromisesBottomString)
        }
        else {
          throw new Error('No chunk loading found! Use mini-css-extract-plugin v0.4.3 to handle this error')
        }
      })
    })

    compiler.plugin('emit', (compilation, callback) => {
      const cssChunks = Object.keys(compilation.assets).filter((asset) => /\.css$/.test(asset))

      // Split each css chunk
      cssChunks.forEach((chunkName) => {
        const asset                      = compilation.assets[chunkName]
        const child                      = asset.children && asset.children[0]
        const chunkValue                 = (child || asset)._value
        const splittedValue              = splitByMediaQuery({ cssFile: chunkValue, mediaOptions })
        const chunkHash                  = chunkName.replace(/\.css$/, '').replace(/.*\./, '')
        const chunkId                    = chunkName.replace(/\..*/, '')

        Object.keys(splittedValue).forEach((mediaType) => {
          const splittedMediaChunk       = splittedValue[mediaType]

          if (splitTablet || !/tablet(Portrait|Landscape)/.test(mediaType)) {
            const isCommon               = mediaType === 'common'
            const splittedMediaChunkName = isCommon ? chunkName : `${chunkId}.${mediaType}.${chunkHash}.css`

            // Add chunk to assets
            compilation.assets[splittedMediaChunkName] = {
              size: () => Buffer.byteLength(splittedMediaChunk, 'utf8'),
              source: () => new Buffer(splittedMediaChunk)
            }
          }
        })
      })

      callback()
    })
  }
}
