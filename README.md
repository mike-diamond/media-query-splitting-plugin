# media-query-splitting-plugin
Webpack 4 plugin for styles splitting by media query

[![Npm Version](https://badge.fury.io/js/media-query-splitting-plugin.svg)](https://www.npmjs.com/package/media-query-splitting-plugin)
[![Npm Licence](https://img.shields.io/npm/l/media-query-splitting-plugin.svg)](https://www.npmjs.com/package/media-query-splitting-plugin)

This plugin is addition to mini-css-extract-plugin. It splits styles from style chunks by media query and creates separate CSS file for mobile, tablet and desktop.

Also it handles loading of this files depending of the client's screen width. 

## Install

```bash
npm install --save media-query-splitting-plugin
```


## Usage

####webpack.config.js
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

