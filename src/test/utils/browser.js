class ExtensionLog {
  async setLogLevel(_extensionPage, _logLevel) {}
}

class ChromiumExtensionLog extends ExtensionLog {
  async setLogLevel(extensionPage, logLevel) {
    await extensionPage.evaluate(async (logLevel) => {
      await chrome.storage.local.set({ logLevel, infoLogs: [] });
    }, logLevel);
  }
}

class FirefoxExtensionLog extends ExtensionLog {
  async setLogLevel(extensionPage, logLevel) {
    await extensionPage.evaluate(async (logLevel) => {
      await browser.storage.local.set({ logLevel, infoLogs: [] });
    }, logLevel);
  }
}

const Browser = Object.freeze({
  Chromium: new ChromiumExtensionLog(),
  Firefox: new FirefoxExtensionLog(),
});

export default Browser;
