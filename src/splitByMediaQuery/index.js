const css = require('css')
const CleanCSS = require('clean-css')

const matchMedia = require('./matchMedia')


const splitByMediaQuery = ({ cssFile, mediaOptions, minify }) => {
  const output       = {}
  const inputRules   = css.parse(cssFile).stylesheet.rules
  const outputRules  = {
    common: [],
  }

  Object.keys(mediaOptions).forEach((mediaKey) => {
    outputRules[mediaKey] = []
  })

  inputRules.forEach(({ type, media }, index) => {
    const matchedMediaKeys = matchMedia({ mediaQuery: media, mediaOptions })

    const rule       = inputRules[index]
    const isNoMatch  = Object.values(matchedMediaKeys).every((isMatched) => !isMatched)

    if (type === 'media' && !isNoMatch) {
      Object.keys(matchedMediaKeys).forEach((mediaKey) => {
        const isMatched = matchedMediaKeys[mediaKey]

        if (isMatched) {
          outputRules[mediaKey].push(rule)
        }
      })
    }
    else {
      outputRules.common.push(rule)
    }
  })

  Object.keys(outputRules).forEach((key) => {
    output[key] = outputRules[key]
    // TODO Merge duplicates media conditions
    // output[key] = []
    // const rules = outputRules[key]
    //
    // rules.forEach((rule) => {
    //   const { media, rules } = rule
    //
    //   const mediaIndex = output[key].map(({ media }) => media).indexOf(media)
    //
    //   if (!media || mediaIndex < 0) {
    //     output[key].push(rule)
    //   }
    //   else {
    //     output[key][mediaIndex].rules = output[key][mediaIndex].rules.concat(rules)
    //   }
    // })

    // Stringify styles
    const style = css.stringify({
      type: 'stylesheet',
      stylesheet: { rules: output[key] },
    })

    // Minify styles
    if (minify) {
      output[key] = (new CleanCSS().minify(style)).styles
    }
    else {
      output[key] = style
    }
  })

  return output
}


module.exports = splitByMediaQuery
