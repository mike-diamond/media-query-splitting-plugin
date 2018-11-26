module.exports = ({ mediaQuery: _mediaQuery = '', mediaOptions }) => {
  const mediaQuery                = _mediaQuery.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ')

  const desktop                   = new RegExp(`(min-width: ${mediaOptions.desktopStart}px)`)
  const tabletLandscape           = new RegExp(`(min-width: ${mediaOptions.tabletLandscapeStart}px) and (max-width: ${mediaOptions.tabletLandscapeEnd}px)`)
  const tablet                    = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}px) and (max-width: ${mediaOptions.tabletLandscapeEnd}px)`)
  const tabletPortrait            = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}px) and (max-width: ${mediaOptions.tabletPortraitEnd}px)`)
  const mobile                    = new RegExp(`(max-width: ${mediaOptions.mobileEnd}px)`)
  const tabletLandscapeAndHigher  = new RegExp(`(min-width: ${mediaOptions.tabletLandscapeStart}px)`)
  const tabletLandscapeAndLower   = new RegExp(`(max-width: ${mediaOptions.tabletLandscapeEnd}px)`)
  const exceptMobile              = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}px)`)
  const exceptDesktop             = new RegExp(`(max-width: ${mediaOptions.tabletLandscapeEnd}px)`)
  const tabletPortraitAndHigher   = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}px)`)
  const tabletPortraitAndLower    = new RegExp(`(max-width: ${mediaOptions.tabletPortraitEnd}px)`)

  const isDesktop = (
    desktop.test(mediaQuery)
    || tabletLandscapeAndHigher.test(mediaQuery)
    || tabletPortraitAndHigher.test(mediaQuery)
    || exceptMobile.test(mediaQuery)
  )

  const isTabletLandscape = (
    tablet.test(mediaQuery)
    || tabletLandscape.test(mediaQuery)
    || tabletPortraitAndHigher.test(mediaQuery)
    || tabletLandscapeAndLower.test(mediaQuery)
    || tabletLandscapeAndHigher.test(mediaQuery)
    || exceptMobile.test(mediaQuery)
    || exceptDesktop.test(mediaQuery)
  )

  const isTabletPortrait = (
    tablet.test(mediaQuery)
    || tabletPortrait.test(mediaQuery)
    || tabletPortraitAndHigher.test(mediaQuery)
    || tabletPortraitAndLower.test(mediaQuery)
    || tabletLandscapeAndLower.test(mediaQuery)
    || exceptMobile.test(mediaQuery)
    || exceptDesktop.test(mediaQuery)
  )

  const isTablet = isTabletPortrait || isTabletLandscape

  const isMobile = (
    mobile.test(mediaQuery)
    || tabletPortraitAndLower.test(mediaQuery)
    || tabletLandscapeAndLower.test(mediaQuery)
    || exceptDesktop.test(mediaQuery)
  )

  return {
    isDesktop,
    isTablet,
    isTabletLandscape,
    isTabletPortrait,
    isMobile,
  }
}
