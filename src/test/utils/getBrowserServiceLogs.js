import Browser from "./browser.js";

async function getChromiumServiceWorkerLogs(extensionPage) {
  try {
    const infoLogs = await extensionPage.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "getInfoLogs" }, (response) => {
          if (chrome.runtime.lastError) {
            resolve([]);
            return;
          }
          resolve(response?.infoLogs ?? []);
        });
      });
    });

    console.log("Received response from background script:", infoLogs);
    return infoLogs ?? [];
  } catch {
    return [];
  }
}

async function getFirefoxServiceWorkerLogs(extensionPage) {
  try {
    const response = await extensionPage.evaluate(async () => {
      return browser.runtime.sendMessage({ type: "getInfoLogs" });
    });

    return response?.infoLogs ?? [];
  } catch {
    return [];
  }
}

export default async function getBrowserServiceWorkerLogs(
  extensionType,
  extensionPage,
) {
  switch (extensionType) {
    case Browser.Chromium:
      return getChromiumServiceWorkerLogs(extensionPage);
    case Browser.Firefox:
      return getFirefoxServiceWorkerLogs(extensionPage);
    default:
      throw new Error(`Unknown extension type: ${extensionType}`);
  }
}
