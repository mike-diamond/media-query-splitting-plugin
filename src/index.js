const getOptions = require('./getOptions')
const handleApply = require('./handleApply')


module.exports = class MediaQuerySplittingPlugin {

  constructor(options) {
    this.options = getOptions(options)
  }

  apply(compiler) {
    const { media: mediaOptions, minify, chunkFileName, exclude } = this.options

    handleApply({
      compiler,
      options: {
        chunkFileName,
        mediaOptions,
        minify,
        exclude,
      },
    })
  }
}
