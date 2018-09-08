const config = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          browsers: [
            'last 2 versions',
            'Safari >= 9',
            'IE >= 11',
            'last 2 iOS major versions',
          ],
          node: 'current',
        },
        useBuiltIns: 'entry',
      },
    ],
  ],
}


module.exports = config
