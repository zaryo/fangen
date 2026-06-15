import { Browser } from "./browser.js";
import { launchChrome } from "./launchChrome.js";
import { launchFirefox } from "./launchFirefox.js";

export async function launchBrowser(browserName, logLevel) {
  switch (browserName) {
    case Browser.Chrome:
      return launchChrome(logLevel);
    case Browser.Firefox:
      return launchFirefox(logLevel);
    default:
      throw new Error(`Unknown browser: ${browserName}`);
  }
}
