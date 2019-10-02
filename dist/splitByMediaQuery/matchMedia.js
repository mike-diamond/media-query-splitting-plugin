const matchMedia = ({ mediaQuery: _mediaQuery = '', mediaOptions, units }) => {
  const mediaQuery                = _mediaQuery.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ')

  const desktop                   = new RegExp(`(min-width: ${mediaOptions.desktopStart}${units})`)
  const tabletLandscape           = new RegExp(`(min-width: ${mediaOptions.tabletLandscapeStart}${units}) and (max-width: ${mediaOptions.tabletLandscapeEnd}${units})`)
  const tablet                    = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}${units}) and (max-width: ${mediaOptions.tabletLandscapeEnd}${units})`)
  const tabletPortrait            = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}${units}) and (max-width: ${mediaOptions.tabletPortraitEnd}${units})`)
  const mobile                    = new RegExp(`(max-width: ${mediaOptions.mobileEnd}${units})`)
  const tabletLandscapeAndHigher  = new RegExp(`(min-width: ${mediaOptions.tabletLandscapeStart}${units})`)
  const tabletLandscapeAndLower   = new RegExp(`(max-width: ${mediaOptions.tabletLandscapeEnd}${units})`)
  const exceptMobile              = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}${units})`)
  const exceptDesktop             = new RegExp(`(max-width: ${mediaOptions.tabletLandscapeEnd}${units})`)
  const tabletPortraitAndHigher   = new RegExp(`(min-width: ${mediaOptions.tabletPortraitStart}${units})`)
  const tabletPortraitAndLower    = new RegExp(`(max-width: ${mediaOptions.tabletPortraitEnd}${units})`)

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


export default matchMedia
