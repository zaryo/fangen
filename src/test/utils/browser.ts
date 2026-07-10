import fs from "node:fs";
import type { Page, Browser as PuppeteerBrowser } from "puppeteer";

export abstract class Browser {
  protected _browser: PuppeteerBrowser;
  protected extensionPage: Page;
  protected userDataDir: string;

  get browser(): PuppeteerBrowser {
    return this._browser;
  }

  abstract launchBrowser(): Promise<Browser>;
  abstract getActiveTabId(): Promise<number | null>;
  abstract getBrowserStreamingUrls(tabId: number): Promise<string[]>;

  async close(): Promise<void> {
    await this._browser.close();
    fs.rmSync(this.userDataDir, { recursive: true, force: true });
  }

  async deleteBrowserStreamingUrls(tabId: number): Promise<void> {
    try {
      await this.extensionPage.evaluate(async (currentTabId: number) => {
        return await chrome.runtime.sendMessage({
          data: { currentTabId },
          type: "deleteStreamingUrls",
        });
      }, tabId);
    } catch {}
  }
}
