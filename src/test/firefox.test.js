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

jest.setTimeout(30000);

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
    const browserHandle = await launchBrowser(Browser.FIREFOX);

    try {
      const targetUrl = serverHandle.urlFor(extension);
      const page = await browserHandle.browser.newPage();

      let tabId;

      try {
        await page.goto(targetUrl, {
          timeout: 3000,
          waitUntil: "networkidle0",
        });
      } catch {
      } finally {
        tabId = await browserHandle.getActiveTabId();
        await page.close();
      }

      const urls = await pollForStreamingUrl(
        browserHandle,
        true,
        tabId,
        targetUrl,
      );
      expect(urls).toStrictEqual([targetUrl]);
    } finally {
      await browserHandle.close();
    }
  });
}

test("testStreamingUrlsAreIsolatedAcrossDifferentTabs", async () => {
  const browserHandle = await launchBrowser(Browser.FIREFOX);

  try {
    const firstTargetUrl = serverHandle.urlFor("mp4");
    const secondTargetUrl = serverHandle.urlFor("mp3");

    const firstPage = await browserHandle.browser.newPage();
    const secondPage = await browserHandle.browser.newPage();

    let firstTabId;
    let secondTabId;

    try {
      await firstPage.goto(firstTargetUrl, {
        timeout: 3000,
        waitUntil: "networkidle0",
      });

      await secondPage.goto(secondTargetUrl, {
        timeout: 3000,
        waitUntil: "networkidle0",
      });
    } catch {
    } finally {
      await firstPage.bringToFront();
      firstTabId = await browserHandle.getActiveTabId();
      await firstPage.close();

      await secondPage.bringToFront();
      secondTabId = await browserHandle.getActiveTabId();
      await secondPage.close();
    }

    const firstTabUrls = await pollForStreamingUrl(
      browserHandle,
      true,
      firstTabId,
      firstTargetUrl,
    );

    const secondTabUrls = await pollForStreamingUrl(
      browserHandle,
      true,
      secondTabId,
      secondTargetUrl,
    );

    expect(firstTabUrls).toStrictEqual([firstTargetUrl]);
    expect(firstTabUrls).not.toContain(secondTargetUrl);

    expect(secondTabUrls).toStrictEqual([secondTargetUrl]);
    expect(secondTabUrls).not.toContain(firstTargetUrl);
  } finally {
    await browserHandle.close();
  }
});

test("testStreamingUrlsAreDeleted", async () => {
  const browserHandle = await launchBrowser(Browser.FIREFOX);

  try {
    const targetUrl = serverHandle.urlFor("mp4");
    const page = await browserHandle.browser.newPage();

    let tabId;

    try {
      await page.goto(targetUrl, {
        timeout: 3000,
        waitUntil: "networkidle0",
      });
    } catch {
    } finally {
      await page.bringToFront();
      tabId = await browserHandle.getActiveTabId();
      await page.close();
    }

    let tabUrls = await browserHandle.getBrowserStreamingUrls(tabId);

    await pollForStreamingUrl(browserHandle, false, tabId, targetUrl);

    tabUrls = await browserHandle.getBrowserStreamingUrls(tabId);

    expect(tabUrls).not.toContain(targetUrl);
  } finally {
    await browserHandle.close();
  }
});

test("testOnlyOneTabStreamingUrlsAreDeleted", async () => {
  const browserHandle = await launchBrowser(Browser.FIREFOX);

  try {
    const firstTargetUrl = serverHandle.urlFor("mp4");
    const secondTargetUrl = serverHandle.urlFor("mp3");

    const firstPage = await browserHandle.browser.newPage();
    const secondPage = await browserHandle.browser.newPage();

    let firstTabId;
    let secondTabId;

    try {
      await firstPage.goto(firstTargetUrl, {
        timeout: 3000,
        waitUntil: "networkidle0",
      });
      await secondPage.goto(secondTargetUrl, {
        timeout: 3000,
        waitUntil: "networkidle0",
      });
    } catch {
    } finally {
      await firstPage.bringToFront();
      firstTabId = await browserHandle.getActiveTabId();
      await firstPage.close();

      await secondPage.bringToFront();
      secondTabId = await browserHandle.getActiveTabId();
      await secondPage.close();
    }

    await pollForStreamingUrl(browserHandle, false, firstTabId, firstTargetUrl);

    const firstTabUrls =
      await browserHandle.getBrowserStreamingUrls(firstTabId);
    const secondTabUrls =
      await browserHandle.getBrowserStreamingUrls(secondTabId);

    expect(firstTabUrls).not.toContain(firstTargetUrl);
    expect(secondTabUrls).toStrictEqual([secondTargetUrl]);
  } finally {
    await browserHandle.close();
  }
});
