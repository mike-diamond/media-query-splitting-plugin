import getOptions from './getOptions'

import handleApplyOld from './handleApplyOld'
import handleApplyNew from './handleApplyNew'


export default class MediaQuerySplittingPlugin {

  constructor(options) {
    this.options = getOptions(options)
  }

  apply(compiler) {
    const { media: mediaOptions, splitTablet, minify, units, isOldConfig } = this.options

    if (isOldConfig) {
      handleApplyOld({
        compiler,
        options: {
          mediaOptions,
          splitTablet,
          minify,
          units,
        }
      })
    }
    else {
      handleApplyNew({
        compiler,
        options: {
          mediaOptions,
          minify,
        },
      })
    }
  }
}
