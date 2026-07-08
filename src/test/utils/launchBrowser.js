import Browser from "./browser.js";
import launchChromium from "./launchChromium.js";
import launchFirefox from "./launchFirefox.js";

export default async function launchBrowser(browserName) {
  switch (browserName) {
    case Browser.CHROMIUM:
      return launchChromium();
    case Browser.FIREFOX:
      return launchFirefox();
    default:
      throw new Error(`Unknown browser: ${browserName}`);
  }
}
