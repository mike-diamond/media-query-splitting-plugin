import css from 'css'
import CleanCSS from 'clean-css'

import matchMedia from './matchMedia'


const splitByMediaQuery = ({ cssFile, mediaOptions, minify, units }) => {
  const output       = {}
  const inputRules   = css.parse(cssFile).stylesheet.rules
  const outputRules  = {
    common: [],
    desktop: [],
    mobile: [],
    tabletPortrait: [],
    tabletLandscape: [],
    tablet: [],
  }

  inputRules.forEach(({ type, media }, index) => {
    const {
      isDesktop,
      isTablet,
      isTabletLandscape,
      isTabletPortrait,
      isMobile,
    } = matchMedia({ mediaQuery: media, mediaOptions, units })

    const rule       = inputRules[index]
    const isNoMatch  = !isDesktop && !isTablet && !isMobile

    if (type === 'media') {
      if (isDesktop) {
        outputRules.desktop.push(rule)
      }
      if (isTabletLandscape) {
        outputRules.tablet.push(rule)
        outputRules.tabletLandscape.push(rule)
      }
      if (isTabletPortrait) {
        outputRules.tablet.push(rule)
        outputRules.tabletPortrait.push(rule)
      }
      if (isMobile) {
        outputRules.mobile.push(rule)
      }
      if (isNoMatch) {
        outputRules.common.push(rule)
      }
    }
    else {
      outputRules.common.push(rule)
    }
  })

  Object.keys(outputRules).forEach((key) => {
    output[key]      = []
    const rules      = outputRules[key]

    // Merge duplicates media conditions
    rules.forEach((rule) => {
      const { media, rules } = rule

      const mediaIndex = output[key].map(({ media }) => media).indexOf(media)

      if (!media || mediaIndex < 0) {
        output[key].push(rule)
      }
      else {
        output[key][mediaIndex].rules = output[key][mediaIndex].rules.concat(rules)
      }
    })

    // Stringify styles
    const style = css.stringify({
      type: 'stylesheet',
      stylesheet: { rules: output[key] }
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


export default splitByMediaQuery
