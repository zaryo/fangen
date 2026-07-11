import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";
import {Browser} from "./browser";
import {EXTENSION_PAGE, EXTENSION_PATH} from "./extension";

export class Firefox extends Browser {
  async launchBrowser(): Promise<Browser> {
    const firefoxBinaryPath = process.env["FIREFOX_BINARY"];
    if (!firefoxBinaryPath)
      throw new Error("FIREFOX_BINARY env var is required");

    this.userDataDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "fangen-firefox-"),
    );

    const browser = await puppeteer.launch({
      browser: "firefox",
      executablePath: firefoxBinaryPath,
      extraPrefsFirefox: {
        "xpinstall.signatures.required": false,
      },
      headless: true,
      protocol: "webDriverBiDi",
      timeout: 3000,
      userDataDir: this.userDataDir,
    });

    this._browser = browser;

    const addonId = await browser.installExtension(EXTENSION_PATH);
    const extensionUuid = await this.pollExtensionUuid(addonId, 1800);

    this.extensionPage = await browser.newPage();
    await this.extensionPage.goto(
      `moz-extension://${extensionUuid}${EXTENSION_PAGE}`,
      {timeout: 1800, waitUntil: "commit"},
    );

    process.on("exit", () => {
      browser.close().catch(() => {});
      fs.rmSync(this.userDataDir, {recursive: true, force: true});
    });

    return this;
  }

  private async pollExtensionUuid(
    addonId: string,
    timeout: number,
  ): Promise<string> {
    const prefsPath = path.join(this.userDataDir, "prefs.js");
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const prefsContent = fs.readFileSync(prefsPath, "utf8");
        const uuidsLine = prefsContent
          .split("\n")
          .find((line) => line.includes("webextensions.uuids"));

        if (uuidsLine) {
          const matchResult = uuidsLine.match(
            /"extensions\.webextensions\.uuids", "(.+)"\);/,
          );
          if (matchResult) {
            const rawValue = matchResult[1]!;
            const extensionUuids = JSON.parse(
              rawValue.replace(/\\"/g, '"'),
            ) as Record<string, string>;
            const uuid = extensionUuids[addonId];
            if (uuid) return uuid;
          }
        }
      } catch {}

      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for Firefox UUID for addon ${addonId}`);
  }

  async getActiveTabId(): Promise<number | null> {
    return this.extensionPage.evaluate(async () => {
      const browserGlobal = (globalThis as unknown as {browser: typeof chrome})
        .browser;
      const [activeTab] = await browserGlobal.tabs.query({
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
          const browserGlobal = (
            globalThis as unknown as {browser: typeof chrome}
          ).browser;
          const response = (await browserGlobal.runtime.sendMessage({
            data: {currentTabId},
            type: "getStreamingUrls",
          })) as {urls?: string[]} | undefined;
          return response?.urls ?? [];
        },
        tabId,
      );
      return streamingUrls ?? [];
    } catch {
      return [];
    }
  }
}
