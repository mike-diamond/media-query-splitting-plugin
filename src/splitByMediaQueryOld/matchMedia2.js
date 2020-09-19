const matchMedia = ({ mediaQuery: _mediaQuery = '', mediaOptions, units }) => {
  const mediaQuery                = _mediaQuery.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ')
  
  const min   = new RegExp(`min-width: (?<min>[0-9\.]+)${units}`)
  const max   = new RegExp(`max-width: (?<max>[0-9\.]+)${units}`)
  const isMin = min.test(mediaQuery);
  const isMax = max.test(mediaQuery);
  
  const isMinQuery     = isMin && !isMax
  const isMaxQuery     = isMax && !isMin
  const isBetweenQuery = isMax && isMin

  let isDesktop = false, isTabletPortrait = false, isTabletLandscape = false, isMobile = false;

  if (isMinQuery) {
    const match = mediaQuery.match(min);
    const number = match['groups'].min
    isMobile = (number <= mediaOptions.mobileEnd)
    isTabletPortrait = (number <= mediaOptions.tabletPortraitEnd);
    isTabletLandscape = (number <= mediaOptions.tabletLandscapeEnd);
    isDesktop = true;
  } else if (isMaxQuery) {
    const match = mediaQuery.match(max);
    const number = match['groups'].max
    isMobile = true
    isTabletPortrait = (number > mediaOptions.tabletPortraitEnd)
    isTabletLandscape = (number > mediaOptions.tabletLandscapeEnd)
    isDesktop = (number >= mediaOptions.desktopStart)
  } else if (isBetweenQuery) {
    const matchMin = mediaQuery.match(min);
    const matchMax = mediaQuery.match(max);
    const minNumber = matchMin['groups'].min
    const maxNumber = matchMax['groups'].max
    isMobile = (minNumber <= mediaOptions.mobileEnd)
    isTabletPortrait = (minNumber <= mediaOptions.tabletPortraitEnd || maxNumber > mediaOptions.tabletPortraitEnd);
    isTabletLandscape = (minNumber <= mediaOptions.tabletLandscapeEnd || maxNumber > mediaOptions.tabletLandscapeEnd);
    isDesktop = (maxNumber >= mediaOptions.desktopStart);
  }

  const isTablet = isTabletPortrait || isTabletLandscape

  return {
    isDesktop,
    isTablet,
    isTabletLandscape,
    isTabletPortrait,
    isMobile,
  }
}


module.exports = matchMedia
