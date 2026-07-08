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

jest.setTimeout(4000);

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

//
// test("testStreamingUrlsAreIsolatedAcrossDifferentTabs", async () => {
//   const browserHandle = await launchBrowser(Browser.Chromium);
//
//   try {
//     const firstTargetUrl = serverHandle.urlFor("mp4");
//     const secondTargetUrl = serverHandle.urlFor("mp3");
//
//     const firstPage = await browserHandle.browser.newPage();
//     const secondPage = await browserHandle.browser.newPage();
//
//     try {
//       await firstPage.goto(firstTargetUrl, {
//         waitUntil: "networkidle0",
//         timeout: 3000,
//       });
//
//       await secondPage.goto(secondTargetUrl, {
//         waitUntil: "networkidle0",
//         timeout: 3000,
//       });
//     } catch {
//     } finally {
//       await firstPage.close();
//       await secondPage.close();
//     }
//
//     const firstTabUrls = await pollForStreamingUrl(
//       browserHandle,
//       firstTargetUrl,
//     );
//     const secondTabUrls = await pollForStreamingUrl(
//       browserHandle,
//       secondTargetUrl,
//     );
//
//     console.log("First tab URLs:", firstTabUrls);
//     console.log("Second tab URLs:", secondTabUrls);
//   } finally {
//     await browserHandle.close();
//   }
// });
