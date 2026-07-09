import Browser from "./browser.js";

async function getChromiumStreamingUrls(extensionPage, tabId) {
  try {
    const streamingUrls = await extensionPage.evaluate(async (currentTabId) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { data: { currentTabId }, type: "getStreamingUrls" },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve([]);
              return;
            }
            resolve(response?.urls ?? []);
          },
        );
      });
    }, tabId);

    return streamingUrls ?? [];
  } catch {
    return [];
  }
}

async function getFirefoxStreamingUrls(extensionPage, tabId) {
  try {
    const streamingUrls = await extensionPage.evaluate(async (currentTabId) => {
      const response = await browser.runtime.sendMessage({
        data: { currentTabId },
        type: "getStreamingUrls",
      });
      return response?.urls ?? [];
    }, tabId);

    return streamingUrls ?? [];
  } catch {
    return [];
  }
}

export default async function getBrowserStreamingUrls(
  browserType,
  extensionPage,
  tabId,
) {
  switch (browserType) {
    case Browser.CHROMIUM:
      return getChromiumStreamingUrls(extensionPage, tabId);
    case Browser.FIREFOX:
      return getFirefoxStreamingUrls(extensionPage, tabId);
    default:
      throw new Error(`Unknown extension type: ${browserType}`);
  }
}
