import Browser from "./browser.js";

async function deleteChromiumStreamingUrls(extensionPage, tabId) {
  try {
    await extensionPage.evaluate(async (currentTabId) => {
      return await chrome.runtime.sendMessage({
        data: { currentTabId: currentTabId },
        type: "deleteStreamingUrls",
      });
    }, tabId);
  } catch {}
}

async function deleteFirefoxStreamingUrls(extensionPage, tabId) {
  try {
    await extensionPage.evaluate(async (currentTabId) => {
      return await chrome.runtime.sendMessage({
        data: { currentTabId: currentTabId },
        type: "deleteStreamingUrls",
      });
    }, tabId);
  } catch {}
}

export default async function deleteBrowserStreamingUrls(
  browserType,
  extensionPage,
  tabId,
) {
  switch (browserType) {
    case Browser.CHROMIUM:
      return deleteChromiumStreamingUrls(extensionPage, tabId);
    case Browser.FIREFOX:
      return deleteFirefoxStreamingUrls(extensionPage, tabId);
    default:
      throw new Error(`Unknown extension type: ${browserType}`);
  }
}
