const getOptions = require('./getOptions')

const handleApplyOld = require('./handleApplyOld')
const handleApplyNew = require('./handleApplyNew')


module.exports = class MediaQuerySplittingPlugin {

  constructor(options) {
    this.options = getOptions(options)
  }

  apply(compiler) {
    const { media: mediaOptions, splitTablet, minify, units, isOldConfig, chunkFileName } = this.options

    // if (isOldConfig) {
      handleApplyOld({
        compiler,
        options: {
          mediaOptions,
          splitTablet,
          minify,
          units,
        },
      })
    // }
    // else {
    //   handleApplyNew({
    //     compiler,
    //     options: {
    //       chunkFileName,
    //       mediaOptions,
    //       minify,
    //     },
    //   })
    // }
  }
}
