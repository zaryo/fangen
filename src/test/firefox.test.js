import {
  afterAll,
  beforeAll,
  beforeEach,
  expect,
  jest,
  test,
} from "@jest/globals";
import { mimeTypeByExtension } from "../types/streamingMimeTypes.js";
import { Browser } from "./utils/browser.js";
import { launchBrowser } from "./utils/launchBrowser.js";
import { launchMockServer } from "./utils/launchMockServer.js";
import { LogLevel } from "./utils/logLevel.js";
import { parseStreamingUrls } from "./utils/parseLogs.js";

jest.setTimeout(2000);

const skip = !process.env.FIREFOX_BINARY;

let serverHandle;

beforeAll(async () => {
  if (skip) return;
  serverHandle = await launchMockServer();
});

afterAll(async () => {
  if (skip) return;
  await serverHandle.close();
});

beforeEach(() => {
  if (skip) return;
  serverHandle.resetHandlers();
});

function toTestName(extension) {
  return extension
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

async function pollForStreamingUrl(browserHandle, targetUrl, timeout = 2000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const logs = await browserHandle.getServiceWorkerLogs();
    const { urls } = parseStreamingUrls(logs);

    if (urls.some((url) => url === targetUrl)) {
      return urls;
    }

    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  const logs = await browserHandle.getServiceWorkerLogs();
  const { urls } = parseStreamingUrls(logs);
  throw new Error(
    `Timeout: streaming URL not found for ${targetUrl}. Captured URLs: ${JSON.stringify(urls)}`,
  );
}

for (const [extension] of mimeTypeByExtension) {
  const testName = `isStreamingResponseWorksFor${toTestName(extension)}`;

  const testFn = skip ? test.skip : test;

  testFn(testName, async () => {
    const browserHandle = await launchBrowser(Browser.Firefox, LogLevel.Info);

    try {
      const targetUrl = serverHandle.urlFor(extension);
      const page = await browserHandle.browser.newPage();

      try {
        await page.goto(targetUrl, {
          waitUntil: "networkidle0",
          timeout: 5000,
        });
      } catch {
        // Navigation may fail for non-HTML content types — the webRequest
        // interception still fires, which is all we need.
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
