import {
  afterAll,
  beforeAll,
  beforeEach,
  expect,
  jest,
  test,
} from "@jest/globals";
import { mimeTypeByExtension } from "../types/streamingMimeTypes.js";
import Browser from "./utils/browser.js";
import launchBrowser from "./utils/launchBrowser.js";
import launchMockServer from "./utils/launchMockServer.js";
import pollForStreamingUrl from "./utils/pollForStreamingUrl.js";
import toTestName from "./utils/toTestName.js";

jest.setTimeout(3000);

let serverHandle;

beforeAll(async () => {
  serverHandle = await launchMockServer();
});

afterAll(async () => {
  await serverHandle.close();
});

beforeEach(() => {
  serverHandle.resetHandlers();
});

for (const [extension] of mimeTypeByExtension) {
  const testName = `testIsStreamingResponseWorksFor${toTestName(extension)}`;

  test(testName, async () => {
    const browserHandle = await launchBrowser(Browser.CHROMIUM);

    try {
      const targetUrl = serverHandle.urlFor(extension);
      const page = await browserHandle.browser.newPage();

      try {
        await page.goto(targetUrl, {
          waitUntil: "networkidle0",
          timeout: 3000,
        });
      } catch {
      } finally {
        await page.close();
      }

      const urls = await pollForStreamingUrl(browserHandle, targetUrl);
      expect(urls).toContain(targetUrl);
    } finally {
      await browserHandle.close();
    }
  });
}
