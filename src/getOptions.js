const getPrefetchOption = ({ prefetch, mediaKeys, mediaKey }) => {
  const prefetchArray             = Array.isArray(prefetch) ? prefetch : [ prefetch ]
  const notAllowedPrefetchValues  = prefetchArray.filter((prefetchKey) => !mediaKeys.includes(prefetchKey))

  if (notAllowedPrefetchValues.length) {
    console.error(`
      Wrong prefetch values passed to "prefetch" parameter: ${notAllowedPrefetchValues.join(', ')} at media "${mediaKey}".
      Allowed values: ${mediaKeys.join(', ')}
    `)

    return []
  }

  return prefetchArray
}

const getMediaOptions = (media) => {
  const mediaOptions  = {}
  const mediaKeys     = Object.keys(media)

  mediaKeys.forEach((mediaKey) => {
    const mediaValue = media[mediaKey]

    if (mediaKey === 'common') {
      console.error(`
        Wrong media key "common", this key is used for styles without media query or with unmatched query
      `)
    }
    else if (typeof mediaValue === 'string') {
      mediaOptions[mediaKey] = {
        query: mediaValue,
        exact: false,
        withCommonStyles: true,
      }
    }
    else if (typeof mediaValue === 'object' && mediaValue.query && typeof mediaValue.query === 'string') {
      const { query, prefetch, exact = false, withCommonStyles = true } = mediaValue

      mediaOptions[mediaKey] = {
        query,
        exact: Boolean(exact),
        prefetch: getPrefetchOption({ prefetch, mediaKeys, mediaKey }),
        withCommonStyles,
      }
    }
    else {
      console.error(`
        Wrong mediaQuery value "${JSON.stringify(mediaValue)}" passed to config for media "${mediaKey}",
        allowed types: String or Object with params: query, exact, prefetch
      `)
    }
  })

  return mediaOptions
}

const getOptions = (options = {}) => {
  const { units = 'px', minify = true, splitTablet, chunkFileName = '[id].[contenthash].css', media = {} } = options

  const hasOptions              = Object.keys(options).length
  const isMediaWithBreakpoints  = Object.values(media).every((value) => Number(value) >= 0)

  const isOldConfig = !hasOptions || isMediaWithBreakpoints

  if (isOldConfig) {
    const media = options.media || {}

    return {
      isOldConfig,
      units,
      minify,
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

  const defaultMediaOptions = {
    mobile: '(max-width: 568px)',
    tabletPortrait: {
      query: '(min-width: 569px) and (max-width: 768px)',
      prefetch: 'tabletLandscape',
    },
    tabletLandscape: {
      query: '(min-width: 769px) and (max-width: 1024px)',
      prefetch: 'tabletPortrait',
    },
    desktop: '(min-width: 1025px)',
  }

  return {
    isOldConfig,
    minify,
    media: getMediaOptions(options.media || defaultMediaOptions),
    chunkFileName,
  }
}


module.exports = getOptions
