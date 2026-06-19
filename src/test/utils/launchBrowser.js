import Browser from "./browser.js";
import launchChromium from "./launchChromium.js";
import launchFirefox from "./launchFirefox.js";

export default async function launchBrowser(browserName) {
  switch (browserName) {
    case Browser.Chromium:
      return launchChromium();
    case Browser.Firefox:
      return launchFirefox();
    default:
      throw new Error(`Unknown browser: ${browserName}`);
  }
}
