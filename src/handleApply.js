const fs = require('fs')
const splitByMediaQuery = require('./splitByMediaQuery')
const { sha1 } = require('crypto-hash')


const handleApply = ({ compiler, options }) => {
  const { mediaOptions, minify, exclude } = options

  const pluginName = 'media-query-splitting-plugin'

  compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
    compilation.mainTemplate.hooks.requireEnsure.tap(pluginName, (source) => {
      if (source) {
        const matchMediaPolyfill = `
          // matchMedia polyfill
          window.matchMedia||(window.matchMedia=function(){"use strict";var e=window.styleMedia||window.media;if(!e){var t,d=document.createElement("style"),i=document.getElementsByTagName("script")[0];d.type="text/css",d.id="matchmediajs-test",i?i.parentNode.insertBefore(d,i):document.head.appendChild(d),t="getComputedStyle"in window&&window.getComputedStyle(d,null)||d.currentStyle,e={matchMedium:function(e){var i="@media "+e+"{ #matchmediajs-test { width: 1px; } }";return d.styleSheet?d.styleSheet.cssText=i:d.textContent=i,"1px"===t.width}}}return function(t){return{matches:e.matchMedium(t||"all"),media:t||"all"}}}());

          var mediaKeys = ${JSON.stringify(Object.keys(mediaOptions))};
          var mediaValues = ${JSON.stringify(Object.values(mediaOptions).map((value) => value.query))};
          var cssChunksMedia = mediaKeys.concat('common');
          var cssChunksByMedia = {CSS_CHUNKS_BY_MEDIA:1};
          var appendLink = function(rel, href, type, as, media) {
            var linkTag = document.createElement('link');
            var header = document.getElementsByTagName('head')[0];

            linkTag.rel = rel;
            linkTag.type = type;
            linkTag.as = as;
            linkTag.href = href;
            linkTag.media = media;

            header.appendChild(linkTag);
          }

          // Define current mediaType
          var getMediaType = function() {
            return mediaKeys.find(function(mediaKey, index) {
              return window.matchMedia(mediaValues[index]).matches
            }) || mediaKeys[0];
          };

          var currentMediaType = getMediaType();

          var getChunkOptions = function(chunkId, mediaType) {
            var chunkOptions = cssChunksByMedia[chunkId] && cssChunksByMedia[chunkId][cssChunksMedia.indexOf(mediaType)]

            if (chunkOptions) {
              chunkOptions.prefetch = chunkOptions.prefetch && chunkOptions.prefetch.map(function(mediaTypeId) {
                return cssChunksMedia[mediaTypeId]
              })

              return chunkOptions
            }

            return false
          };

          var tryAppendNewMedia = function() {
            var linkElements = document.getElementsByTagName('link');
            var chunkIds = {};

            for (var i = 0; i < linkElements.length; i++) {
              var chunkHref = linkElements[i].href.replace(/.*\\//, '');
              var currentChunkId = chunkHref.replace(/\\..+/, '');

              if (/(${Object.keys(mediaOptions).map((key) => key).join('|')}).*\\.css$/.test(chunkHref)) {
                var chunkMediaType = chunkHref.replace(currentChunkId + '.', '').replace(/\\..*/, '');
                var pervChunkHash = cssChunksByMedia[currentChunkId] && cssChunksByMedia[currentChunkId] && cssChunksByMedia[currentChunkId][cssChunksMedia.indexOf(chunkMediaType)] && cssChunksByMedia[currentChunkId][cssChunksMedia.indexOf(chunkMediaType)].hash;
                var chunkHash = cssChunksByMedia[currentChunkId] && cssChunksByMedia[currentChunkId] && cssChunksByMedia[currentChunkId][cssChunksMedia.indexOf(currentMediaType)] && cssChunksByMedia[currentChunkId][cssChunksMedia.indexOf(currentMediaType)].hash;
                var chunkHrefPrefix = linkElements[i].href.replace(new RegExp(currentChunkId + '\\\\..+'), '');
                if (getChunkOptions(currentChunkId, chunkMediaType)) {
                  if (!chunkIds[currentChunkId]) {
                    chunkIds[currentChunkId] = {
                      mediaTypes: [ chunkMediaType ],
                      hash: chunkHash,
                      prefix: chunkHrefPrefix,
                    }
                  }
                  else {
                    chunkIds[currentChunkId].mediaTypes.push(chunkMediaType);
                  }
                }
              }
            }

            for (var i in chunkIds) {
              if (chunkIds.hasOwnProperty(i)) {
                var hasCurrentMedia = chunkIds[i].mediaTypes.indexOf(currentMediaType) !== -1;

                if (!hasCurrentMedia && getChunkOptions(i, currentMediaType)) {
                  var fullhref = '' + chunkIds[i].prefix + '' + i + '.' + currentMediaType + '.' + chunkIds[i].hash + '.css';
                  appendLink('stylesheet', fullhref, 'text/css', undefined, mediaValues[mediaKeys.indexOf(currentMediaType)]);
                }
              }
            }
          };

          var resize = function() {
            currentMediaType = getMediaType();
            tryAppendNewMedia();
          };

          var afterDOMLoaded = function() {
            if (!window.isListenerAdded) {
              window.addEventListener('resize', resize);
              window.isListenerAdded = true;
              resize();
            }
          };

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded',afterDOMLoaded);
          }
          else {
            afterDOMLoaded();
          }
        `

        const promisesString = 'promises.push(installedCssChunks[chunkId] = new Promise(function(resolve, reject) {'
        const newPromisesString = `promises.push(installedCssChunks[chunkId] = Promise.all([ \'common\', currentMediaType ]
          .map(function (mediaType) {
            if (!getChunkOptions(chunkId, mediaType)) {
              return Promise.resolve();
            }

            var chunkOptions = getChunkOptions(chunkId, currentMediaType);

            if (mediaType === 'common') {
              if (chunkOptions && chunkOptions.common) {
                return Promise.resolve();
              }
            }
            else {
              if (chunkOptions.prefetch) {
                for (var i = 0; i < chunkOptions.prefetch.length; i++) {
                  // TODO generate fullhref to prefetch
                  // appendLink('prefetch', fullhref, undefined, 'style')
                }
              }
            }

            return new Promise(function(resolve, reject) {
        `

        const promisesBottomRegExp = /head\.appendChild\(linkTag\);(.|\n)*}\)\.then/
        const newPromisesBottomString = 'head.appendChild(linkTag);resize();\n})\n})).then'

        const hrefString = source.replace(/(.|\n)*var href = \"/, '').replace(/\";(.|\n)*/, '')
        const isPlainChunkId = / chunkId /.test(hrefString)
        const mediaTypeString = (
          isPlainChunkId
            ? hrefString.replace(/ chunkId /, ' chunkId + (mediaType !== "common" ? "."  + mediaType : "") ')
            : hrefString.replace(' + "." + ', ' + (mediaType !== "common" ? "."  + mediaType + "." : ".") + ')
        )
          .replace(/ \+ \{/, ' + (mediaType !== \'common\' ? getChunkOptions(chunkId, mediaType).hash : {')
          .replace(' + ".css', ') + ".css')

        return source
          .replace(promisesString, `${matchMediaPolyfill}${newPromisesString}`)
          .replace(hrefString, mediaTypeString)
          .replace(promisesBottomRegExp, newPromisesBottomString)
      }
    })
  })

  compiler.plugin('emit', (compilation, callback) => {
    const outputPath = compilation.options.output.path
    const excludes = Object.values(exclude || {})
    const cssChunks = Object.keys(compilation.assets)
      .filter((asset) => /\.css$/.test(asset) && !excludes.some((exclude) => exclude.test(asset)))

    const needMergeCommonStyles = Object.values(mediaOptions).some(({ withCommonStyles }) => withCommonStyles)
    const needRemoveCommonChunk = Object.values(mediaOptions).every(({ withCommonStyles }) => withCommonStyles)
    const cssChunksMedia = Object.keys(mediaOptions).concat('common')
    const cssChunksByMedia = {}

    const promises = []

    // Split each css chunk
    cssChunks.forEach((chunkName) => {
      const asset = compilation.assets[chunkName]
      const child = asset.children && asset.children[0]
      const chunkValue = typeof asset.source === 'function' ? asset.source() : (child || asset)._value
      let splittedValue = splitByMediaQuery({ cssFile: chunkValue, mediaOptions, minify })
      const chunkId = chunkName.replace(/\..*/, '')

      // Filter empty chunks
      splittedValue = Object.keys(splittedValue).reduce((result, mediaType) => {
        if (splittedValue[mediaType]) {
          result[mediaType] = splittedValue[mediaType]
        }

        return result
      }, {})

      // Merge common styles if needed
      if (needMergeCommonStyles && splittedValue.common) {
        splittedValue = Object.keys(splittedValue).reduce((result, mediaType) => {
          if (mediaType === 'common') {
            result[mediaType] = splittedValue[mediaType]
          }
          else {
            const { withCommonStyles } = mediaOptions[mediaType]

            if (withCommonStyles) {
              result[mediaType] = `${splittedValue.common || ''}${splittedValue[mediaType] || ''}`
            }
            else {
              result[mediaType] = splittedValue[mediaType]
            }
          }

          return result
        }, {})
      }

      Object.keys(splittedValue).forEach((mediaType) => {
        const splittedMediaChunk = splittedValue[mediaType]
        const isCommon = mediaType === 'common'

        // TODO add exclusions (e.g. manual splitted chunks)?
        if (isCommon && (!splittedMediaChunk || needRemoveCommonChunk)) {
          // TODO use optimizeChunks.hook instead
          const path = `${outputPath}/${chunkName}`

          if (fs.existsSync(path)) {
            fs.unlinkSync(path)
            compilation.assets[chunkName] = undefined
          }

          if (fs.existsSync(`${path}.map`)) {
            fs.unlinkSync(`${path}.map`)
            compilation.assets[`${chunkName}.map`] = undefined
          }
        }
        else if (splittedMediaChunk) {
          // Add existed chunk for entry chunk code
          const mediaChunkId = chunkId.replace(/.+\//, '')
          cssChunksByMedia[mediaChunkId] = cssChunksByMedia[mediaChunkId] || {}

          promises.push(
            new Promise((resolve) => {
              sha1(splittedMediaChunk)
                .then((hash) => {
                  const splittedMediaChunkName = isCommon ? chunkName : `${chunkId}.${mediaType}.${hash}.css`

                  cssChunksByMedia[mediaChunkId][cssChunksMedia.indexOf(mediaType)] = {
                    hash,
                    common: !isCommon && mediaOptions[mediaType].withCommonStyles,
                    prefetch: (
                      !isCommon
                      && !!mediaOptions[mediaType].prefetch
                      && !!mediaOptions[mediaType].prefetch.filter((mediaType) => cssChunksMedia.indexOf(mediaType) !== -1).length
                      && mediaOptions[mediaType].prefetch.filter((mediaType) => cssChunksMedia.indexOf(mediaType) !== -1).map((mediaType) => cssChunksMedia.indexOf(mediaType))
                    ),
                  }

                  // Add chunk to assets
                  compilation.assets[splittedMediaChunkName] = {
                    size: () => Buffer.byteLength(splittedMediaChunk, 'utf8'),
                    source: () => Buffer.from(splittedMediaChunk),
                  }

                  resolve()
                })
            })
          )
        }
      })
    })

    Promise.all(promises)
      .then(() => {
        // TODO use mainTemplate hook instead
        const entryChunkId = Object.keys(compilation.options.entry)[0]
        const entryChunkName = Object.keys(compilation.assets).find((name) => (
          new RegExp(`${entryChunkId}.+js$`).test(name)
        ))

        if (compilation.assets[entryChunkName]) {
          const entryChunk = compilation.assets[entryChunkName].source()
          const updatedEntryChunk = entryChunk.replace(
            '{CSS_CHUNKS_BY_MEDIA:1}',
            `${JSON.stringify(cssChunksByMedia)}`
          )

          compilation.assets[entryChunkName] = {
            size: () => Buffer.byteLength(updatedEntryChunk, 'utf8'),
            source: () => Buffer.from(updatedEntryChunk),
          }
        }

        callback()
      })
  })
}


module.exports = handleApply
