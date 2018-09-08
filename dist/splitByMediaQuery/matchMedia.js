"use strict";

module.exports = function (_ref) {
  var mediaQuery = _ref.mediaQuery,
      mediaOptions = _ref.mediaOptions;
  var desktop = "(min-width: ".concat(mediaOptions.desktopStart, "px)");
  var tabletLandscape = "(min-width: ".concat(mediaOptions.tabletLandscapeStart, "px) and (max-width: ").concat(mediaOptions.tabletLandscapeEnd, "px)");
  var tablet = "(min-width: ".concat(mediaOptions.tabletPortraitStart, "px) and (max-width: ").concat(mediaOptions.tabletLandscapeEnd, "px)");
  var tabletPortrait = "(min-width: ".concat(mediaOptions.tabletPortraitStart, "px) and (max-width: ").concat(mediaOptions.tabletPortraitEnd, "px)");
  var mobile = "(max-width: ".concat(mediaOptions.mobileEnd, "px)");
  var tabletLandscapeAndHigher = "(min-width: ".concat(mediaOptions.tabletLandscapeStart, "px)");
  var tabletLandscapeAndLower = "(max-width: ".concat(mediaOptions.tabletLandscapeEnd, "px)");
  var exceptMobile = "(min-width: ".concat(mediaOptions.tabletPortraitStart, "px)");
  var exceptDesktop = "(max-width: ".concat(mediaOptions.tabletLandscapeEnd, "px)");
  var tabletPortraitAndHigher = "(min-width: ".concat(mediaOptions.tabletPortraitStart, "px)");
  var tabletPortraitAndLower = "(max-width: ".concat(mediaOptions.tabletPortraitEnd, "px)");
  var retina2x = 'only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (min-resolution: 144dpi)';
  var retina3x = 'only screen and (-webkit-min-device-pixel-ratio: 2.5), only screen and (min-resolution: 288dpi)';
  var retina2xMobile = "only screen and ".concat(mobile, " and (-webkit-min-device-pixel-ratio: 1.5), only screen and ").concat(mobile, " and (min-resolution: 144dpi)");
  var retina3xMobile = "only screen and ".concat(mobile, " and (-webkit-min-device-pixel-ratio: 2.5), only screen and ").concat(mobile, " and (min-resolution: 288dpi)");
  var retina3PlusMobile = "only screen and ".concat(mobile, " and (-webkit-min-device-pixel-ratio: 2.5), only screen and ").concat(mobile, " and (-webkit-min-device-pixel-ratio: 3), only screen and ").concat(mobile, " and (min-resolution: 288dpi)");
  var retina2xTablet = "only screen and ".concat(tabletPortraitAndHigher, " and ").concat(tabletLandscapeAndLower, " and (-webkit-min-device-pixel-ratio: 1.5), only screen and ").concat(tabletPortraitAndHigher, " and ").concat(tabletLandscapeAndLower, " and (min-resolution: 144dpi)");
  var retina3xTablet = "only screen and ".concat(tabletPortraitAndHigher, " and ").concat(tabletLandscapeAndLower, " and (-webkit-min-device-pixel-ratio: 2.5), only screen and ").concat(tabletPortraitAndHigher, " and ").concat(tabletLandscapeAndLower, " and (min-resolution: 288dpi)");
  var retina2xTabletPortrait = "only screen and ".concat(tabletPortrait, " and (-webkit-min-device-pixel-ratio: 1.5), only screen and ").concat(tabletPortrait, " and (min-resolution: 144dpi)");
  var retina3xTabletPortrait = "only screen and ".concat(tabletPortrait, " and (-webkit-min-device-pixel-ratio: 2.5), only screen and ").concat(tabletPortrait, " and (-webkit-min-device-pixel-ratio: 3), only screen and ").concat(tabletPortrait, " and (min-resolution: 288dpi)");
  var retina2xDesktop = "only screen and ".concat(desktop, " and (-webkit-min-device-pixel-ratio: 1.5), only screen and ").concat(desktop, " and (min-resolution: 144dpi)");
  var retina3xDesktop = "only screen and ".concat(desktop, " and (-webkit-min-device-pixel-ratio: 2.5), only screen and ").concat(desktop, " and (min-resolution: 288dpi)");
  var retina2xExceptMobile = "only screen and ".concat(exceptMobile, " and (-webkit-min-device-pixel-ratio: 1.5), only screen and ").concat(exceptMobile, " and (min-resolution: 144dpi)");
  var retina3xExceptMobile = "only screen and ".concat(exceptMobile, " and (-webkit-min-device-pixel-ratio: 2.5), only screen and ").concat(exceptMobile, " and (min-resolution: 288dpi)");
  var isDesktop = mediaQuery === desktop || mediaQuery === tabletLandscapeAndHigher || mediaQuery === tabletPortraitAndHigher || mediaQuery === exceptMobile || mediaQuery === retina2x || mediaQuery === retina3x || mediaQuery === retina2xDesktop || mediaQuery === retina3xDesktop || mediaQuery === retina2xExceptMobile || mediaQuery === retina3xExceptMobile;
  var isTabletLandscape = mediaQuery === tablet || mediaQuery === tabletLandscape || mediaQuery === tabletPortraitAndHigher || mediaQuery === tabletLandscapeAndLower || mediaQuery === tabletLandscapeAndHigher || mediaQuery === exceptMobile || mediaQuery === exceptDesktop || mediaQuery === retina2xTablet || mediaQuery === retina3xTablet || mediaQuery === retina2xExceptMobile || mediaQuery === retina3xExceptMobile;
  var isTabletPortrait = mediaQuery === tablet || mediaQuery === tabletPortrait || mediaQuery === tabletPortraitAndHigher || mediaQuery === tabletPortraitAndLower || mediaQuery === tabletLandscapeAndLower || mediaQuery === exceptMobile || mediaQuery === exceptDesktop || mediaQuery === retina2xTabletPortrait || mediaQuery === retina3xTabletPortrait || mediaQuery === retina2xExceptMobile || mediaQuery === retina3xExceptMobile;
  var isTablet = isTabletPortrait || isTabletLandscape;
  var isMobile = mediaQuery === mobile || mediaQuery === tabletPortraitAndLower || mediaQuery === tabletLandscapeAndLower || mediaQuery === exceptDesktop || mediaQuery === retina2xMobile || mediaQuery === retina3xMobile || mediaQuery === retina3PlusMobile; // const isRetina2x = (
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
    isDesktop: isDesktop,
    isTablet: isTablet,
    isTabletLandscape: isTabletLandscape,
    isTabletPortrait: isTabletPortrait,
    isMobile: isMobile // isRetina,

  };
};