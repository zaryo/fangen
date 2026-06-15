import { preLaunchChrome } from "./utils/launchChrome.js";
import { preLaunchFirefox } from "./utils/launchFirefox.js";

// Pre-launch browsers before tests run so startup cost does not count
// against the per-test 2000ms timeout.
if (process.env.CHROME_BINARY) {
  beforeAll(preLaunchChrome, 30000);
}

if (process.env.FIREFOX_BINARY) {
  beforeAll(preLaunchFirefox, 30000);
}
