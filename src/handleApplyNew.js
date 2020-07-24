const { util: { createHash } } = require('webpack')
const SortableSet = require('webpack/lib/util/SortableSet')
const { ConcatSource, SourceMapSource, OriginalSource } = require('webpack-sources')
const splitByMediaQuery = require('./splitByMediaQueryNew')


const globalStorage = {}

const chunkReason = 'splitted by media query: '

const getHash = (str) => {
  const hash = createHash('md4')
  hash.update(str)
  return hash.digest('hex').substr(0, 4)
}

const getChunkFileName = ({ chunkId, mediaType, chunkHash, chunkName, chunkFileName }) => {
  const resultFileName = chunkFileName
    .replace(/.+\//, '')
    .replace('[id]', chunkId)
    .replace('[name]', chunkName)
    .replace('[contenthash]', chunkHash)

  return mediaType === 'common' ? resultFileName : resultFileName.replace('.css', `.${mediaType}.css`)
}

const getCssChunkObject = (mainChunk) => {
  const obj = {}

  for (const chunk of mainChunk.getAllAsyncChunks()) {
    for (const module of chunk.modulesIterable) {
      if (module.type === 'css/mini-extract') {
        obj[chunk.id] = 1

        break
      }
    }
  }

  return obj
}

const getMediaChunksIds = (chunks) => {
  const mediaChunksIds = {}

  chunks.forEach((chunk, chunkIndex) => {
    if (new RegExp(chunkReason).test(chunk.chunkReason)) {
      const indexString  = chunk.chunkReason.replace(chunkReason, '')
      const index        = parseInt(indexString, 10)
      const type         = indexString.replace(`${index}.`, '')

      if (!mediaChunksIds[index]) {
        mediaChunksIds[index] = {}
      }

      mediaChunksIds[index][type] = {
        id: chunk.id,
        chunkIndex,
      }
    }
  })

  return mediaChunksIds
}

const handleApplyNew = ({ compiler, options }) => {
  const { mediaOptions, minify, chunkFileName } = options

  const pluginName = 'media-query-splitting-plugin'
  const MODULE_TYPE = 'css/mini-extract'

  const REGEXP_CHUNKHASH = /\[chunkhash(?::(\d+))?\]/i
  const REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/i
  const REGEXP_NAME = /\[name\]/i

  const matchMediaPolyfill = 'window.matchMedia||(window.matchMedia=function(){"use strict"var e=window.styleMedia||window.mediaif(!e){var t,d=document.createElement("style"),i=document.getElementsByTagName("script")[0]d.type="text/css",d.id="matchmediajs-test",i?i.parentNode.insertBefore(d,i):document.head.appendChild(d),t="getComputedStyle"in window&&window.getComputedStyle(d,null)||d.currentStyle,e={matchMedium:function(e){var i="@media "+e+"{ #matchmediajs-test { width: 1px } }"return d.styleSheet?d.styleSheet.cssText=i:d.textContent=i,"1px"===t.width}}}return function(t){return{matches:e.matchMedium(t||"all"),media:t||"all"}}}())'

  // const renderContentAsset = (compilation, chunk, modules, requestShortener) => {
  //   const cssChunks = Object.keys(compilation.assets).filter((asset) => /\.css$/.test(asset))
  //   console.log('Emit')
  //
  //   // Split each css chunk
  //   cssChunks.forEach((chunkName) => {
  //     const asset                      = compilation.assets[chunkName]
  //     const child                      = asset.children && asset.children[0]
  //     const chunkValue                 = typeof asset.source === 'function' ? asset.source() : (child || asset)._value
  //     const splittedValue              = splitByMediaQuery({ cssFile: chunkValue, mediaOptions, minify })
  //     const chunkId                    = chunkName.replace(/\..*/, '')
  //
  //     delete compilation.assets[chunkName]
  //
  //     if (compilation.assets[`${chunkName}.map`]) {
  //       delete compilation.assets[`${chunkName}.map`]
  //     }
  //
  //     Object.keys(splittedValue).forEach((mediaType) => {
  //       const splittedMediaChunk       = splittedValue[mediaType]
  //
  //       // Add chunk to assets
  //       if (splittedMediaChunk) {
  //         const chunkHash              = '[empty]' // splittedMediaChunk ? createHash(splittedMediaChunk) : '[empty]'
  //         const splittedMediaChunkName = getChunkFileName({ chunkId, mediaType, chunkHash, chunkName, chunkFileName })
  //
  //         compilation.assets[splittedMediaChunkName] = {
  //           size: () => Buffer.byteLength(splittedMediaChunk, 'utf8'),
  //           source: () => new Buffer(splittedMediaChunk)
  //         }
  //       }
  //     })
  //   })
  // }
  
  const renderContentAsset = (compilation, chunk, modules, requestShortener) => {
    let usedModules

    const [chunkGroup] = chunk.groupsIterable

    if (typeof chunkGroup.getModuleIndex2 === 'function') {
      // Store dependencies for modules
      const moduleDependencies = new Map(modules.map((m) => [m, new Set()]))
      const moduleDependenciesReasons = new Map(
        modules.map((m) => [m, new Map()])
      )

      // Get ordered list of modules per chunk group
      // This loop also gathers dependencies from the ordered lists
      // Lists are in reverse order to allow to use Array.pop()
      const modulesByChunkGroup = Array.from(chunk.groupsIterable, (cg) => {
        const sortedModules = modules
          .map((m) => {
            return {
              module: m,
              index: cg.getModuleIndex2(m),
            }
          })
          // eslint-disable-next-line no-undefined
          .filter((item) => item.index !== undefined)
          .sort((a, b) => b.index - a.index)
          .map((item) => item.module)

        for (let i = 0; i < sortedModules.length; i++) {
          const set = moduleDependencies.get(sortedModules[i])
          const reasons = moduleDependenciesReasons.get(sortedModules[i])

          for (let j = i + 1; j < sortedModules.length; j++) {
            const module = sortedModules[j]
            set.add(module)
            const reason = reasons.get(module) || new Set()
            reason.add(cg)
            reasons.set(module, reason)
          }
        }

        return sortedModules
      })

      // set with already included modules in correct order
      usedModules = new Set()

      const unusedModulesFilter = (m) => !usedModules.has(m)

      while (usedModules.size < modules.length) {
        let success = false
        let bestMatch
        let bestMatchDeps

        // get first module where dependencies are fulfilled
        for (const list of modulesByChunkGroup) {
          // skip and remove already added modules
          while (list.length > 0 && usedModules.has(list[list.length - 1])) {
            list.pop()
          }

          // skip empty lists
          if (list.length !== 0) {
            const module = list[list.length - 1]
            const deps = moduleDependencies.get(module)
            // determine dependencies that are not yet included
            const failedDeps = Array.from(deps).filter(unusedModulesFilter)

            // store best match for fallback behavior
            if (!bestMatchDeps || bestMatchDeps.length > failedDeps.length) {
              bestMatch = list
              bestMatchDeps = failedDeps
            }

            if (failedDeps.length === 0) {
              // use this module and remove it from list
              usedModules.add(list.pop())
              success = true
              break
            }
          }
        }

      }
    }
    else {
      // fallback for older webpack versions
      // (to avoid a breaking change)
      // TODO remove this in next major version
      // and increase minimum webpack version to 4.12.0
      modules.sort((a, b) => a.index2 - b.index2)
      usedModules = modules
    }

    const source = new ConcatSource()
    const externalsSource = new ConcatSource()

    for (const m of usedModules) {
      externalsSource.add(m.content + '//asd asd')
      source.add(m.content)
      // if (/^@import url/.test(m.content)) {
      //   // HACK for IE
      //   // http://stackoverflow.com/a/14676665/1458162
      //   let { content } = m
      //
      //   if (m.media) {
      //     // insert media into the @import
      //     // this is rar
      //     // TODO improve this and parse the CSS to support multiple medias
      //     content = content.replace(/|\s*$/, m.media)
      //   }
      //
      //   externalsSource.add(content)
      //   externalsSource.add('\n')
      // } else {
      //   if (m.media) {
      //     source.add(`@media ${m.media} {\n`)
      //   }
      //
      //   if (m.sourceMap) {
      //     source.add(
      //       new SourceMapSource(
      //         m.content,
      //         m.readableIdentifier(requestShortener),
      //         m.sourceMap
      //       )
      //     )
      //   } else {
      //     source.add(
      //       new OriginalSource(
      //         m.content,
      //         m.readableIdentifier(requestShortener)
      //       )
      //     )
      //   }
      //   source.add('\n')
      //
      //   if (m.media) {
      //     source.add('}\n')
      //   }
      // }
    }

    return new ConcatSource(externalsSource, source)
  }

  compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
    /*
    compilation.mainTemplate.hooks.renderManifest.tap(pluginName, (result, { chunk }) => {
      console.log('mainTemplate.hooks.renderManifest')

      const renderedModules = Array.from(chunk.modulesIterable).filter(
        (module) => module.type === MODULE_TYPE
      )

      const data = {
        renderedModulesLength: renderedModules.length,
        result: result.map(({ render, ...rest }) => {
          const _render = render()
          return {
            ...rest,
            render: _render.map((concatSource) => JSON.stringify(concatSource.source())),
          }
        }),
        // result: Object.keys(result),
        // chunk: Object.keys(chunk),
        // chunkData: {
        //   id: chunk.id,
        //   ids: chunk.ids,
        //   name: chunk.name,
        //   hash: chunk.hash,
        //   rendered: chunk.rendered,
        //   contentHash: chunk.contentHash[MODULE_TYPE],
        //   renderedHash: chunk.renderedHash,
        // },
        // renderedModules: [],
      }

      console.log(
        // compilation,
        data,
        data.result.length && data.result[0].render,
        'mainTemplate.hooks.renderManifest'
      )

      if (renderedModules.length > 0) {
        // renderContentAsset(
        //   compilation,
        //   chunk,
        //   renderedModules,
        //   compilation.runtimeTemplate.requestShortener
        // )

        // result.push({
        //   render: () => new ConcatSource(data.result[0].render.sourcesContent.join('')),
        //   filenameTemplate: ({ chunk: chunkData }) => '[name].css',
        //   pathOptions: {
        //     chunk,
        //     contentHashType: MODULE_TYPE,
        //   },
        //   identifier: `${pluginName}.${chunk.id}`,
        //   hash: chunk.contentHash[MODULE_TYPE],
        // })
        // result.push({
        //   render: () => new ConcatSource(data.result[0].render.sourcesContent[0]),
        //   filenameTemplate: ({ chunk: chunkData }) => '[name].css',
        //   pathOptions: {
        //     chunk,
        //     contentHashType: MODULE_TYPE,
        //   },
        //   identifier: `${pluginName}.${chunk.id}.asd`,
        //   hash: chunk.contentHash[MODULE_TYPE],
        // })
      }
    })
    */

    /*
    compilation.chunkTemplate.hooks.renderManifest.tap(pluginName, (result, { chunk }) => {
      const renderedModules = Array.from(chunk.modulesIterable).filter((module) => module.type === MODULE_TYPE)

      const data = {
        renderedModulesLength: renderedModules.length,
        result: result.map(({ render, ...rest }) => {
          const _render = render()
          return {
            ...rest,
            render: _render.map((concatSource) => JSON.stringify(concatSource.source())),
          }
        }),
        // result: Object.keys(result),
        // chunk: Object.keys(chunk),
        // chunkData: {
        //   id: chunk.id,
        //   ids: chunk.ids,
        //   name: chunk.name,
        //   hash: chunk.hash,
        //   rendered: chunk.rendered,
        //   contentHash: chunk.contentHash[MODULE_TYPE],
        //   renderedHash: chunk.renderedHash,
        // },
        // renderedModules: [],
      }

      console.log('chunkTemplate.hooks.renderManifest')

      console.log(
        ' -',
        // compilation,
        { ...data },
        data.result.length && { ...data.result[0].render },
      )

      if (renderedModules.length > 0) {
        // result.push({
        //   render: () => new ConcatSource(data.result[0].render.sourcesContent.join('')),
        //   filenameTemplate: chunkFileName,
        //   pathOptions: {
        //     chunk: { ...chunk, id: chunk.id + '.common' },
        //     contentHashType: MODULE_TYPE,
        //   },
        //   identifier: `${pluginName}.${chunk.id}`.replace(/\.css$/, '.common.css'),
        //   hash: getHash(data.result[0].render.sourcesContent.join('')),
        // })
      }
    })*/

    /*
    compilation.hooks.afterOptimizeChunkIds.tap(pluginName, (chunks) => {
      console.log('hooks.afterOptimizeChunkIds')

      const mediaChunksIds = getMediaChunksIds(chunks)

      Object.keys(mediaChunksIds).forEach((index) => {
        const mediaChunks = mediaChunksIds[index]

        Object.keys(mediaChunks).forEach((type) => {
          if (type !== 'common') {
            const { id } = mediaChunks.common
            const { chunkIndex } = mediaChunks[type]

            chunks[chunkIndex].id = `${id}.${type}`
          }
        })
      })

      chunks = chunks.sort((a, b) => a.id > b.id ? 1 : -1)

      console.log({ chunksLength: chunks.length })
      console.log(chunks.map(({ id, name, chunkReason }) => ({ id, name, chunkReason })))
      console.log('====================================================================================')
      console.log('====================================================================================')
      console.log('====================================================================================')
      console.log('====================================================================================')
      console.log('====================================================================================')
      console.log('====================================================================================')
      console.log('====================================================================================')
    })
   */

    /*
    compilation.hooks.contentHash.tap(pluginName, (chunk) => {
      console.log('hooks.contentHash')

      //   const { outputOptions } = compilation
    //   const { hashFunction, hashDigest, hashDigestLength } = outputOptions
    //   const hash = createHash(hashFunction)
    //
    //   let isStyleChunk = false
    //
    //   for (const m of chunk.modulesIterable) {
    //     if (m.type === MODULE_TYPE) {
    //       isStyleChunk = true
    //       m.updateHash(hash)
    //     }
    //   }
    //
    //   const { contentHash } = chunk
    //
    //   contentHash[MODULE_TYPE] = hash
    //     .digest(hashDigest)
    //     .substring(0, hashDigestLength)
    })
    */

    // compilation.hooks.optimizeChunksAdvanced.tap(pluginName, (chunks) => {
    //   console.log('hooks.optimizeChunksAdvanced')
    //   const checkIsStyleChunk = (chunk) => Array.from(chunk.modulesIterable).some(({ type }) => type === MODULE_TYPE)
    //
    //   let index = 0
    //
    //   for (const chunk of chunks) {
    //     const isStyleChunk    = checkIsStyleChunk(chunk)
    //     const isCreatedChunk  = new RegExp(chunkReason).test(chunk.chunkReason)
    //
    //     if (isStyleChunk && !isCreatedChunk) {
    //       const newChunk = compilation.addChunk()
    //
    //       newChunk.chunkReason = `${chunkReason}${index}.mqs`
    //
    //       Array.from(chunk.modulesIterable).forEach((module, index) => {
    //         if (!index) {
    //           console.log(Object.keys(module))
    //         }
    //         module.type = 'media-query-splitting'
    //         newChunk.addModule(module)
    //       })
    //
    //       // chunk.split(newChunk)
    //       // if (index === 2) {
    //       //   console.log({ module: modules[0], modulesKeys: Object.keys(modules[0]) })
    //       // }
    //
    //       chunk.chunkReason = `${chunkReason}${index}.common`
    //       index++
    //     }
    //   }
    //
    //   // return chunks
    // })
    //
    // compilation.mainTemplate.hooks.requireEnsure.tap(pluginName, (source, chunk) => {
    //   if (source) {
    //     const cssChunks = chunk.getChunkMaps()
    //
    //     console.log('mainTemplate.hooks.requireEnsure (RESULT)')
    //     console.log(' -', JSON.stringify(cssChunks.contentHash), cssChunks.contentHash[MODULE_TYPE])
    //     // console.log(cssChunks)
    //     const firstCodeString       = `
    //         // matchMedia polyfill
    //         ${matchMediaPolyfill}
    //
    //         var chunk = ${JSON.stringify(cssChunks)}
    //
    //         var mediaOptions = ["${Object.keys(mediaOptions).join('","')}"]
    //
    //         // Define current mediaType
    //         var checkMedia = function(mediaQuery) {
    //           return window.matchMedia(mediaQuery).matches
    //         }
    //
    //         var getMediaType = function() {
    //           var matchedMedia = {${
    //             Object.keys(mediaOptions).map((mediaKey) => (
    //               `${mediaKey}: checkMedia('${mediaOptions[mediaKey].query}')`
    //             )).join(',')
    //           }}
    //
    //           var currentMediaType = ''
    //
    //           mediaOptions.forEach(function(mediaKey) {
    //             if (mediaOptions[mediaKey]) {
    //               currentMediaType = mediaKey
    //             }
    //           })
    //
    //           return currentMediaType
    //         }
    //
    //         // get preload mediaType
    //         var getPreloadMediaTypes = function(currentMediaType) {
    //           var matchedMedia = {${
    //             Object.keys(mediaOptions).map((mediaKey) => (
    //               `${mediaKey}: ${mediaOptions[mediaKey].prefetch}`
    //             )).join(',')
    //           }}
    //
    //           return matchedMedia[currentMediaType]
    //         }
    //
    //         var mediaType                = getMediaType()
    //         var preloadMediaTypes        = getPreloadMediaTypes(mediaType)
    //
    //         var tryAppendNewMedia = function() {
    //           var linkElements           = document.getElementsByTagName('link')
    //           var chunkIds               = {}
    //
    //           for (var i = 0 i < linkElements.length i++) {
    //             var chunkHref            = linkElements[i].href.replace(/.*\\//, '')
    //
    //             if (/(mobile|tablet|desktop).*\\.css$/.test(chunkHref)) {
    //               var chunkId            = chunkHref.replace(/\\..*/, '')
    //               var chunkMediaType     = chunkHref.replace(chunkId + '.', '').replace(/\\..*/, '')
    //               var chunkHash          = chunkHref.replace(/\\.css$/, '').replace('' + chunkId + '.' + chunkMediaType + '.', '')
    //               var chunkHrefPrefix    = linkElements[i].href.replace('' + chunkId + '.' + chunkMediaType + '.' + chunkHash + '.css', '')
    //
    //               if (!chunkIds[chunkId]) {
    //                 chunkIds[chunkId]    = {
    //                   mediaTypes: [ chunkMediaType ],
    //                   hash: chunkHash,
    //                   prefix: chunkHrefPrefix,
    //                 }
    //               }
    //               else {
    //                 chunkIds[chunkId].mediaTypes.push(chunkMediaType)
    //               }
    //             }
    //           }
    //
    //           for (var i in chunkIds) {
    //             if (chunkIds.hasOwnProperty(i)) {
    //               var isTablet           = /tablet/.test(currentMediaType)
    //               var hasTablet          = chunkIds[i].mediaTypes.indexOf('tablet') !== -1
    //               var _hasCurrentMedia   = chunkIds[i].mediaTypes.indexOf(currentMediaType) !== -1
    //               var hasCurrentMedia    = isTablet ? hasTablet || _hasCurrentMedia : _hasCurrentMedia
    //
    //               if (!hasCurrentMedia) {
    //                 var fullhref         = '' + chunkIds[i].prefix + '' + i + '.' + currentMediaType + '.' + chunkIds[i].hash + '.css'
    //                 var linkTag          = document.createElement('link')
    //                 var header           = document.getElementsByTagName('head')[0]
    //
    //                 linkTag.rel          = 'stylesheet'
    //                 linkTag.type         = 'text/css'
    //                 linkTag.href         = fullhref
    //
    //                 header.appendChild(linkTag)
    //               }
    //             }
    //           }
    //         }
    //
    //         var resize = function() {
    //           var mediaType = getMediaType()
    //
    //           if (currentMediaType !== newMediaType) {
    //             tryAppendNewMedia()
    //           }
    //         }
    //
    //         var afterDOMLoaded = function() {
    //           if (!window.isListenerAdded) {
    //             window.addEventListener('resize', resize)
    //             window.isListenerAdded = true
    //             resize()
    //           }
    //         }
    //
    //         if (document.readyState === 'loading') {
    //           document.addEventListener('DOMContentLoaded', afterDOMLoaded)
    //         }
    //         else {
    //           afterDOMLoaded()
    //         }
    //       `
    //
    //     const promisesString           = 'promises.push(installedCssChunks[chunkId] = new Promise(function(resolve, reject) {'
    //     const newPromisesString        = `promises.push(installedCssChunks[chunkId] = Promise.all([ \'common\', currentMediaType ]
    //         .map(function (mediaType) {
    //           return new Promise(function(resolve, reject) {
    //       `
    //
    //     const promisesBottomRegExp     = /head\.appendChild\(linkTag\)(.|\n)*}\)\.then/
    //     const newPromisesBottomString  = 'head.appendChild(linkTag)resize()\n})\n})).then'
    //
    //     const hrefString               = source.replace(/(.|\n)*var href = \"/, '').replace(/\"(.|\n)*/, '')
    //     const mediaTypeString          = hrefString.replace(/ chunkId /, ' chunkId + (mediaType !== "common" ? "."  + mediaType : "") ')
    //
    //     return source
    //     //   .replace(promisesString, `${firstCodeString}${newPromisesString}`)
    //     //   .replace(hrefString, mediaTypeString)
    //     //   .replace(promisesBottomRegExp, newPromisesBottomString)
    //   }
    // })

    compilation.mainTemplate.hooks.renderManifest.tap(pluginName, (result, { chunk }) => {
      console.log('main renderManifest')
      const renderedModules = Array.from(chunk.modulesIterable)
        .filter((module) => module.type === MODULE_TYPE)

      globalStorage.data = {
        renderedModulesLength: renderedModules.length,
        result: result.map(({ render, ...rest }) => {
          const _render = render()
          return {
            ...rest,
            render: _render.map((concatSource) => JSON.stringify(concatSource.source())),
          }
        }),
        // result: Object.keys(result),
        // chunk: Object.keys(chunk),
        // chunkData: {
        //   id: chunk.id,
        //   ids: chunk.ids,
        //   name: chunk.name,
        //   hash: chunk.hash,
        //   rendered: chunk.rendered,
        //   contentHash: chunk.contentHash[MODULE_TYPE],
        //   renderedHash: chunk.renderedHash,
        // },
        // renderedModules: [],
      }

      console.log(
        // compilation,
        globalStorage.data,
        globalStorage.data.result.length && globalStorage.data.result[0].render,
        'mainTemplate.hooks.renderManifest'
      )

      if (renderedModules.length > 0) {
        // renderContentAsset(
        //   compilation,
        //   chunk,
        //   renderedModules,
        //   compilation.runtimeTemplate.requestShortener
        // )

        // result.push({
        //   render: () => new ConcatSource(data.result[0].render.sourcesContent.join('')),
        //   filenameTemplate: ({ chunk: chunkData }) => '[name].css',
        //   pathOptions: {
        //     chunk,
        //     contentHashType: MODULE_TYPE,
        //   },
        //   identifier: `${pluginName}.${chunk.id}`,
        //   hash: chunk.contentHash[MODULE_TYPE],
        // })
        // result.push({
        //   render: () => new ConcatSource(data.result[0].render.sourcesContent[0]),
        //   filenameTemplate: ({ chunk: chunkData }) => '[name].css',
        //   pathOptions: {
        //     chunk,
        //     contentHashType: MODULE_TYPE,
        //   },
        //   identifier: `${pluginName}.${chunk.id}.asd`,
        //   hash: chunk.contentHash[MODULE_TYPE],
        // })
      }
    })
    compilation.chunkTemplate.hooks.renderManifest.tap(pluginName, (result, { chunk }) => {
      console.log('chunk renderManifest')
    })

    compilation.mainTemplate.hooks.hashForChunk.tap(pluginName, (hash, chunk) => {
      console.log('main hashForChunk')
    })

    compilation.hooks.contentHash.tap(pluginName, (chunk) => {
      console.log('contentHash')
    })

    compilation.mainTemplate.hooks.localVars.tap(pluginName, (source, chunk) => {
      console.log('main localVars')
    })

    compilation.mainTemplate.hooks.requireEnsure.tap(pluginName, (source, chunk, hash) => {
      console.log('main requireEnsure')
      if (source) {
            const cssChunks = chunk.getChunkMaps()

            console.log('mainTemplate.hooks.requireEnsure (RESULT)')
            console.log(' -', JSON.stringify(cssChunks.contentHash), cssChunks.contentHash[MODULE_TYPE])
      }
    })
  })
}


module.exports = handleApplyNew
