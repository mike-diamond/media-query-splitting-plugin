const mediaQuery = require('css-mediaquery')

const toPx = (length) => {
  const value = parseFloat(length)
  const units = String(length).match(/(em|rem|px|cm|mm|in|pt|pc)?$/)[1]

  switch (units) {
    case 'em' : return value * 16;
    case 'rem': return value * 16;
    case 'cm' : return value * 96 / 2.54;
    case 'mm' : return value * 96 / 2.54 / 10;
    case 'in' : return value * 96;
    case 'pt' : return value * 72;
    case 'pc' : return value * 72 / 12;
    default   : return value;
  }
}

const getExpression = (expressions) => expressions.reduce((result, { feature, modifier, value }) => {
  result[feature] = result[feature] || {}

  result[feature][modifier] = toPx(value)

  return result
}, {})

const compare = (query1, query2) => {
  const [ ast1 ] = mediaQuery.parse(query1)
  const [ ast2 ] = mediaQuery.parse(query2)

  const ast1Expression = getExpression(ast1.expressions)
  const ast2Expression = getExpression(ast2.expressions)

  const ast1Features = Object.keys(ast1Expression)
  const ast2Features = Object.keys(ast2Expression)

  return ast1Features.every((feature) => {
    const ast1Feature = ast1Expression[feature]
    const ast2Feature = ast2Expression[feature]

    const has1MinMax = ast1Features.length === 2
    const has2MinMax = ast2Features.length === 2

    if (ast2Feature) {
      const has1Min = typeof ast1Feature.min === 'number'
      const has2Min = typeof ast2Feature.min === 'number'

      if (has1MinMax) {
        // min and max vs min and max
        if (has2MinMax) {
          // (min: 50) and (max: 100) vs (min: 51) and (max: 99)
          return (
            ast1Feature.min <= ast2Feature.min
            && ast1Feature.max >= ast2Feature.max
          )
        }

        // min and max vs min | max
        return has2Min
          // (min: 50) and (max: 100) vs (min: 51)
          ? (
            ast1Feature.min <= ast2Feature.min
            && ast1Feature.max >= ast2Feature.min
          )
          // (min: 50) and (max: 100) vs (max: 99)
          : (
            ast1Feature.max >= ast2Feature.max
            && ast1Feature.min <= ast2Feature.max
          )
      }

      // min | max vs min and max
      if (has2MinMax) {
        return has1Min
          // (min: 50) vs (min: 51) and (max: 99)
          ? ast1Feature.min >= ast2Feature.min
          // (max: 100) vs (min: 51) and (max: 99)
          : ast1Feature.max <= ast2Feature.max
      }

      // min vs min | max
      if (has1Min) {
        return has2Min
          // (min: 100) vs (min: 51)
          ? ast1Feature.min >= ast2Feature.min
          // (min: 100) vs (max: 99)
          : ast1Feature.min <= ast2Feature.max
      }

      // max vs min | max
      return has2Min
        // (max: 100) vs (min: 51)
        ? ast1Feature.max >= ast2Feature.min
        // (max: 100) vs (max: 99)
        : ast1Feature.max <= ast2Feature.max
    }

    return true
  })
}

const escapeQuery = (query) => query.replace(/:/g, ': ').replace(/,/g, ', ').replace(/\s+/g, ' ')

const matchMedia = ({ mediaQuery = '', mediaOptions }) => {
  const mediaResults = {}

  Object.keys(mediaOptions).forEach((mediaKey) => {
    const mediaOption = mediaOptions[mediaKey]
    const optionQuery = mediaOption.query || ''

    if (mediaOption.exact) {
      mediaResults[mediaKey] = escapeQuery(optionQuery) === escapeQuery(mediaQuery)
    }
    else {
      mediaResults[mediaKey] = compare(optionQuery, mediaQuery)
    }
  })

  return mediaResults
}


module.exports = matchMedia
