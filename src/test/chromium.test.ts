import {
  afterAll,
  beforeAll,
  beforeEach,
  expect,
  jest,
  test,
} from "@jest/globals";
import { mimeTypeByExtension } from "../types/streamingMimeTypes";
import { Chromium } from "./utils/Chromium";
import launchMockServer, {
  type MockServerHandle,
} from "./utils/launchMockServer";
import pollForStreamingUrl from "./utils/pollForStreamingUrl";
import toTestName from "./utils/toTestName";

jest.setTimeout(6000);

let serverHandle: MockServerHandle;

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
    const browserHandle = await new Chromium().launchBrowser();

    try {
      const targetUrl = serverHandle.urlFor(extension);
      const page = await browserHandle.browser.newPage();

      let tabId: number | null | undefined;

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
        tabId!,
        targetUrl,
      );
      expect(urls).toStrictEqual([targetUrl]);
    } finally {
      await browserHandle.close();
    }
  });
}

test("testStreamingUrlsAreIsolatedAcrossDifferentTabs", async () => {
  const browserHandle = await new Chromium().launchBrowser();

  try {
    const firstTargetUrl = serverHandle.urlFor("mp4");
    const secondTargetUrl = serverHandle.urlFor("mp3");

    const firstPage = await browserHandle.browser.newPage();
    const secondPage = await browserHandle.browser.newPage();

    let firstTabId: number | null | undefined;
    let secondTabId: number | null | undefined;

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
      firstTabId!,
      firstTargetUrl,
    );

    const secondTabUrls = await pollForStreamingUrl(
      browserHandle,
      true,
      secondTabId!,
      secondTargetUrl,
    );

    expect(firstTabUrls).toStrictEqual([firstTargetUrl]);
    expect(firstTabUrls).not.toContain(secondTargetUrl);

    expect(secondTabUrls).toStrictEqual([secondTargetUrl]);
    expect(secondTabUrls).not.toContain(firstTargetUrl);
  } finally {
    await browserHandle.close();
  }
}, 8000);

test("testStreamingUrlsAreDeleted", async () => {
  const browserHandle = await new Chromium().launchBrowser();

  try {
    const targetUrl = serverHandle.urlFor("mp4");
    const page = await browserHandle.browser.newPage();

    let tabId: number | null | undefined;

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

    await browserHandle.getBrowserStreamingUrls(tabId!);

    await pollForStreamingUrl(browserHandle, false, tabId!, targetUrl);

    const tabUrls = await browserHandle.getBrowserStreamingUrls(tabId!);

    expect(tabUrls).not.toContain(targetUrl);
  } finally {
    await browserHandle.close();
  }
}, 8000);

test("testOnlyOneTabStreamingUrlsAreDeleted", async () => {
  const browserHandle = await new Chromium().launchBrowser();

  try {
    const firstTargetUrl = serverHandle.urlFor("mp4");
    const secondTargetUrl = serverHandle.urlFor("mp3");

    const firstPage = await browserHandle.browser.newPage();
    const secondPage = await browserHandle.browser.newPage();

    let firstTabId: number | null | undefined;
    let secondTabId: number | null | undefined;

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
    await pollForStreamingUrl(
      browserHandle,
      false,
      firstTabId!,
      firstTargetUrl,
    );

    const firstTabUrls = await browserHandle.getBrowserStreamingUrls(
      firstTabId!,
    );
    const secondTabUrls = await browserHandle.getBrowserStreamingUrls(
      secondTabId!,
    );

    expect(firstTabUrls).not.toContain(firstTargetUrl);
    expect(secondTabUrls).toStrictEqual([secondTargetUrl]);
  } finally {
    await browserHandle.close();
  }
}, 8000);
