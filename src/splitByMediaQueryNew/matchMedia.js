const escapeQuery = (query = '') => query.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ')

const matchMedia = ({ mediaQuery, mediaOptions }) => {
  const mediaResults = {}

  Object.keys(mediaOptions).forEach((mediaKey) => {
    const mediaOption         = mediaOptions[mediaKey]

    const escapedOptionQuery  = escapeQuery(mediaOption.query)
    const escapedMediaQuery   = escapeQuery(mediaQuery)

    if (mediaOption.exact) {
      mediaResults[mediaKey] = escapedOptionQuery === escapedMediaQuery
    }
    else {
      const conditions = escapedOptionQuery.split(' and ')

      mediaResults[mediaKey] = conditions.some((condition) => new RegExp(condition).test(escapedMediaQuery))
    }
  })

  return mediaResults
}


module.exports = matchMedia
