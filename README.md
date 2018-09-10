# <img src="./images/logo.png" height="30" /> media-query-splitting-plugin
Webpack 4 plugin for styles splitting by media query

[![Npm Version](https://badge.fury.io/js/media-query-splitting-plugin.svg)](https://www.npmjs.com/package/media-query-splitting-plugin)
[![Npm Licence](https://img.shields.io/npm/l/media-query-splitting-plugin.svg)](https://www.npmjs.com/package/media-query-splitting-plugin)

This plugin is addition to mini-css-extract-plugin. It splits styles from style chunks by media query and creates separate CSS files for mobile, tablet and desktop.

#### Chunk before applying
`0.04a9302b77ca5a27bfee.css` - chunk includes all styles and media queries

#### Chunks after applying
`0.04a9302b77ca5a27bfee.css` - common chunk includes the styles without media query conditions
`0.desktop.04a9302b77ca5a27bfee.css` - styles for desktop media query, by default it's *(min-width: 1025px)*
`0.tabletLandscape.04a9302b77ca5a27bfee.css` - styles for tabletLandscape media query, by default it's *(min-width: 769px) and (max-width: 1024px)*

`0.tabletPortrait.04a9302b77ca5a27bfee.css` - styles for tabletPortrait media query, by default it's *(min-width: 569px) and (max-width: 768px)*

`0.tablet.04a9302b77ca5a27bfee.css` - styles for both tabletLandscape and tabletPortrait
`0.mobile.04a9302b77ca5a27bfee.css` - styles for mobile media query by default it's *(max-width: 568px)*


Also it handles loading of this files depending of the client's screen width, it happens on loading new chunk or on window resize. 

## Install

```bash
npm install --save-dev media-query-splitting-plugin
```


## Usage

#### webpack.config.js
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MediaQuerySplittingPlugin = require('media-query-splitting-plugin')

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new MediaQuerySplittingPlugin({
      // This is default config (optional)
      media: {
        mobileEnd: 568,
        tabletPortraitEnd: 768,
        tabletLandscapeEnd: 1024,
      },
      splitTablet: true,
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ]
      }
    ]
  }
}
```

## Server side rendering
The plugin splits each css asset to common chunk (which should be always included to the response) and media chunk (for desktop, tabletPortrait / tabletLandscape / tablet (includes portrait and landscape) or mobile, which should be included depending on client's device).

How to use it with SSR.

All you need is to define client device type (mobile, tablet or desktop) and add style chunk for this device in addition the to common chunk. Define device type depending on req.headers['user-agent'] (use express-device middleware for it).

### Example:
```js
  const { getBundles } = require('react-loadable/webpack')
  const assets = require('assets.json') // webpack-assets-manifest

  const bundles  = getBundles(loadableAssets, loadableModules).filter(({ file }) => !/map$/.test(file))

  const styles   = (
    bundles
      .filter((bundle) => bundle.file.endsWith('.css'))
      .concat({ publicPath: assets.client.css })
      .map(({ publicPath }) => {
        const { isMobile, isTablet } = req

        let mediaType     = 'desktop'

        if (isMobile) {
          mediaType       = 'mobile'
        }
        else if (isTablet) {
          mediaType       = 'tablet'
        }

        const chunkId     = publicPath.replace(/\..*/, '')
        const mediaPath   = publicPath.replace(chunkId, `${chunkId}.${mediaType}`)

        return `
          <link rel="stylesheet" href="${publicPath}" /> // Common chunk (0.04a9302b77ca5a27bfee.css)
          <link rel="stylesheet" href="${mediaPath}" />  // Media chunk  (0.${mediaType}.04a9302b77ca5a27bfee.css)
        `
      })
  )

```
