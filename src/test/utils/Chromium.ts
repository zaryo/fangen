import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";
import {match} from "ts-pattern";
import {Browser} from "./browser";
import {EXTENSION_PAGE, EXTENSION_PATH} from "./extension";

export class Chromium extends Browser {
  async launchBrowser(): Promise<Browser> {
    const chromiumBinaryPath = process.env["CHROMIUM_BINARY"];
    if (!chromiumBinaryPath)
      throw new Error("CHROMIUM_BINARY env var is required");

    this.userDataDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "fangen-chromium-"),
    );

    const browser = await puppeteer.launch({
      args: [
        "--enable-unsafe-extension-debugging",
        ...match(Boolean(process.env["CI"]))
          .with(true, () => ["--no-sandbox", "--disable-setuid-sandbox"])
          .with(false, (): string[] => [])
          .exhaustive(),
      ],
      executablePath: chromiumBinaryPath,
      headless: true,
      ignoreDefaultArgs: [
        "--disable-extensions",
        "--disable-component-extensions-with-background-pages",
      ],
      pipe: true,
      userDataDir: this.userDataDir,
    });

    this._browser = browser;

    const extensionId = await browser.installExtension(EXTENSION_PATH);
    this.extensionPage = await browser.newPage();
    await this.extensionPage.goto(
      `chrome-extension://${extensionId}${EXTENSION_PAGE}`,
      {timeout: 1800},
    );

    process.on("exit", () => {
      browser.close().catch(() => {});
      fs.rmSync(this.userDataDir, {recursive: true, force: true});
    });

    return this;
  }

  async getActiveTabId(): Promise<number | null> {
    return this.extensionPage.evaluate(async () => {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      return activeTab?.id ?? null;
    });
  }

  async getBrowserStreamingUrls(tabId: number): Promise<string[]> {
    try {
      const streamingUrls = await this.extensionPage.evaluate(
        async (currentTabId: number) => {
          return new Promise<string[]>((resolve) => {
            chrome.runtime.sendMessage(
              {data: {currentTabId}, type: "getStreamingUrls"},
              (response: {urls?: string[]} | undefined) => {
                if (chrome.runtime.lastError) {
                  resolve([]);
                  return;
                }
                resolve(response?.urls ?? []);
              },
            );
          });
        },
        tabId,
      );
      return streamingUrls ?? [];
    } catch {
      return [];
    }
  }
}
