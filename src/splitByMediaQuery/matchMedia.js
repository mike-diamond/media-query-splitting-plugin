module.exports = ({ mediaQuery, mediaOptions }) => {
  const desktop                   = `(min-width: ${mediaOptions.desktopStart}px)`
  const tabletLandscape           = `(min-width: ${mediaOptions.tabletLandscapeStart}px) and (max-width: ${mediaOptions.tabletLandscapeEnd}px)`
  const tablet                    = `(min-width: ${mediaOptions.tabletPortraitStart}px) and (max-width: ${mediaOptions.tabletLandscapeEnd}px)`
  const tabletPortrait            = `(min-width: ${mediaOptions.tabletPortraitStart}px) and (max-width: ${mediaOptions.tabletPortraitEnd}px)`
  const mobile                    = `(max-width: ${mediaOptions.mobileEnd}px)`
  const tabletLandscapeAndHigher  = `(min-width: ${mediaOptions.tabletLandscapeStart}px)`
  const tabletLandscapeAndLower   = `(max-width: ${mediaOptions.tabletLandscapeEnd}px)`
  const exceptMobile              = `(min-width: ${mediaOptions.tabletPortraitStart}px)`
  const exceptDesktop             = `(max-width: ${mediaOptions.tabletLandscapeEnd}px)`
  const tabletPortraitAndHigher   = `(min-width: ${mediaOptions.tabletPortraitStart}px)`
  const tabletPortraitAndLower    = `(max-width: ${mediaOptions.tabletPortraitEnd}px)`

  const retina2x                  = 'only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (min-resolution: 144dpi)'
  const retina3x                  = 'only screen and (-webkit-min-device-pixel-ratio: 2.5), only screen and (min-resolution: 288dpi)'

  const retina2xMobile            = `only screen and ${mobile} and (-webkit-min-device-pixel-ratio: 1.5), only screen and ${mobile} and (min-resolution: 144dpi)`
  const retina3xMobile            = `only screen and ${mobile} and (-webkit-min-device-pixel-ratio: 2.5), only screen and ${mobile} and (min-resolution: 288dpi)`
  const retina3PlusMobile         = `only screen and ${mobile} and (-webkit-min-device-pixel-ratio: 2.5), only screen and ${mobile} and (-webkit-min-device-pixel-ratio: 3), only screen and ${mobile} and (min-resolution: 288dpi)`

  const retina2xTablet            = `only screen and ${tabletPortraitAndHigher} and ${tabletLandscapeAndLower} and (-webkit-min-device-pixel-ratio: 1.5), only screen and ${tabletPortraitAndHigher} and ${tabletLandscapeAndLower} and (min-resolution: 144dpi)`
  const retina3xTablet            = `only screen and ${tabletPortraitAndHigher} and ${tabletLandscapeAndLower} and (-webkit-min-device-pixel-ratio: 2.5), only screen and ${tabletPortraitAndHigher} and ${tabletLandscapeAndLower} and (min-resolution: 288dpi)`

  const retina2xTabletPortrait    = `only screen and ${tabletPortrait} and (-webkit-min-device-pixel-ratio: 1.5), only screen and ${tabletPortrait} and (min-resolution: 144dpi)`
  const retina3xTabletPortrait    = `only screen and ${tabletPortrait} and (-webkit-min-device-pixel-ratio: 2.5), only screen and ${tabletPortrait} and (-webkit-min-device-pixel-ratio: 3), only screen and ${tabletPortrait} and (min-resolution: 288dpi)`

  const retina2xDesktop           = `only screen and ${desktop} and (-webkit-min-device-pixel-ratio: 1.5), only screen and ${desktop} and (min-resolution: 144dpi)`
  const retina3xDesktop           = `only screen and ${desktop} and (-webkit-min-device-pixel-ratio: 2.5), only screen and ${desktop} and (min-resolution: 288dpi)`

  const retina2xExceptMobile      = `only screen and ${exceptMobile} and (-webkit-min-device-pixel-ratio: 1.5), only screen and ${exceptMobile} and (min-resolution: 144dpi)`
  const retina3xExceptMobile      = `only screen and ${exceptMobile} and (-webkit-min-device-pixel-ratio: 2.5), only screen and ${exceptMobile} and (min-resolution: 288dpi)`

  const isDesktop = (
    mediaQuery === desktop
    || mediaQuery === tabletLandscapeAndHigher
    || mediaQuery === tabletPortraitAndHigher
    || mediaQuery === exceptMobile
    || mediaQuery === retina2x
    || mediaQuery === retina3x
    || mediaQuery === retina2xDesktop
    || mediaQuery === retina3xDesktop
    || mediaQuery === retina2xExceptMobile
    || mediaQuery === retina3xExceptMobile
  )

  const isTabletLandscape = (
    mediaQuery === tablet
    || mediaQuery === tabletLandscape
    || mediaQuery === tabletPortraitAndHigher
    || mediaQuery === tabletLandscapeAndLower
    || mediaQuery === tabletLandscapeAndHigher
    || mediaQuery === exceptMobile
    || mediaQuery === exceptDesktop
    || mediaQuery === retina2xTablet
    || mediaQuery === retina3xTablet
    || mediaQuery === retina2xExceptMobile
    || mediaQuery === retina3xExceptMobile
  )

  const isTabletPortrait = (
    mediaQuery === tablet
    || mediaQuery === tabletPortrait
    || mediaQuery === tabletPortraitAndHigher
    || mediaQuery === tabletPortraitAndLower
    || mediaQuery === tabletLandscapeAndLower
    || mediaQuery === exceptMobile
    || mediaQuery === exceptDesktop
    || mediaQuery === retina2xTabletPortrait
    || mediaQuery === retina3xTabletPortrait
    || mediaQuery === retina2xExceptMobile
    || mediaQuery === retina3xExceptMobile
  )

  const isTablet = isTabletPortrait || isTabletLandscape

  const isMobile = (
    mediaQuery === mobile
    || mediaQuery === tabletPortraitAndLower
    || mediaQuery === tabletLandscapeAndLower
    || mediaQuery === exceptDesktop
    || mediaQuery === retina2xMobile
    || mediaQuery === retina3xMobile
    || mediaQuery === retina3PlusMobile
  )

  // const isRetina2x = (
  //   mediaQuery === retina2x
  //   || mediaQuery === retina2xMobile
  //   || mediaQuery === retina2xTablet
  //   || mediaQuery === retina2xTabletPortrait
  //   || mediaQuery === retina2xDesktop
  //   || mediaQuery === retina2xExceptMobile
  // )
  //
  // const isRetina3x = (
  //   mediaQuery === retina3x
  //   || mediaQuery === retina3xMobile
  //   || mediaQuery === retina3PlusMobile
  //   || mediaQuery === retina3xTablet
  //   || mediaQuery === retina3xTabletPortrait
  //   || mediaQuery === retina3xDesktop
  //   || mediaQuery === retina3xExceptMobile
  // )
  //
  // const isRetina = isRetina2x || isRetina3x

  return {
    isDesktop,
    isTablet,
    isTabletLandscape,
    isTabletPortrait,
    isMobile,
    // isRetina,
  }
}
