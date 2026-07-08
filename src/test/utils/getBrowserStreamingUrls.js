import Browser from "./browser.js";

async function getChromiumStreamingUrls(extensionPage) {
  try {
    const streamingUrls = await extensionPage.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "getStreamingUrls" }, (response) => {
          if (chrome.runtime.lastError) {
            resolve([]);
            return;
          }
          resolve(response?.urls ?? []);
        });
      });
    });

    return streamingUrls ?? [];
  } catch {
    return [];
  }
}

async function getFirefoxStreamingUrls(extensionPage) {
  try {
    const streamingUrls = await extensionPage.evaluate(async () => {
      const response = await browser.runtime.sendMessage({
        type: "getStreamingUrls",
      });
      return response?.urls ?? [];
    });

    return streamingUrls ?? [];
  } catch {
    return [];
  }
}

export default async function getBrowserStreamingUrls(
  extensionType,
  extensionPage,
) {
  switch (extensionType) {
    case Browser.CHROMIUM:
      return getChromiumStreamingUrls(extensionPage);
    case Browser.FIREFOX:
      return getFirefoxStreamingUrls(extensionPage);
    default:
      throw new Error(`Unknown extension type: ${extensionType}`);
  }
}
