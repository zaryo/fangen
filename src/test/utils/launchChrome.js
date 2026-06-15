import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, "../../..");

// Singleton: browser is launched once and shared across all tests to stay
// within jest's 2000ms per-test timeout.
let chromeBrowserContextPromise = null;

// Google Chrome 130+ ignores --load-extension. Chromium still supports it.
// When given a google-chrome binary, fall back to a Chromium binary.
function resolveChromiumExecutable(executablePath) {
  const binaryName = path.basename(executablePath);
  if (!binaryName.startsWith("google-chrome")) return executablePath;

  for (const candidate of ["chromium", "chromium-browser"]) {
    try {
      const result = execFileSync("which", [candidate], {
        timeout: 2000,
        encoding: "utf8",
      }).trim();
      if (result && fs.existsSync(result)) return result;
    } catch {}
  }

  try {
    const nixOutPath = execFileSync(
      "nix",
      ["eval", "nixpkgs#chromium.outPath", "--raw"],
      { timeout: 10000, encoding: "utf8" },
    ).trim();
    const chromiumBin = path.join(nixOutPath, "bin", "chromium");
    if (nixOutPath && fs.existsSync(chromiumBin)) return chromiumBin;
  } catch {}

  return executablePath;
}

async function initChromeBrowserContext(executablePath) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "fangen-chrome-"));
  const resolvedExecutablePath = resolveChromiumExecutable(executablePath);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: resolvedExecutablePath,
    userDataDir,
    ignoreDefaultArgs: [
      "--disable-extensions",
      "--disable-component-extensions-with-background-pages",
    ],
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      `--load-extension=${extensionPath}`,
    ],
  });

  const isFangenServiceWorker = (target) =>
    target.type() === "service_worker" &&
    target.url().endsWith("/src/background.js");

  let serviceWorkerTarget = browser.targets().find(isFangenServiceWorker);

  if (!serviceWorkerTarget) {
    serviceWorkerTarget = await browser.waitForTarget(isFangenServiceWorker, {
      timeout: 3000,
    });
  }

  const extensionBaseUrl = serviceWorkerTarget
    .url()
    .replace(/\/src\/background\.js$/, "");
  const queryPage = await browser.newPage();
  await queryPage.goto(`${extensionBaseUrl}/templates/index.html`, {
    timeout: 5000,
  });

  process.on("exit", () => {
    browser.close().catch(() => {});
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  return { browser, queryPage };
}

export async function preLaunchChrome() {
  const executablePath = process.env.CHROME_BINARY;
  if (!executablePath) throw new Error("CHROME_BINARY env var is required");

  if (!chromeBrowserContextPromise) {
    chromeBrowserContextPromise = initChromeBrowserContext(executablePath);
  }

  await chromeBrowserContextPromise;
}

export async function launchChrome(logLevel) {
  const executablePath = process.env.CHROME_BINARY;
  if (!executablePath) throw new Error("CHROME_BINARY env var is required");

  if (!chromeBrowserContextPromise) {
    chromeBrowserContextPromise = initChromeBrowserContext(executablePath);
  }

  const { browser, queryPage } = await chromeBrowserContextPromise;

  await queryPage.evaluate((level) => {
    window.__keepAlivePort = chrome.runtime.connect();
    return chrome.storage.local.set({ logLevel: level, infoLogs: [] });
  }, logLevel);

  return {
    browser,
    getServiceWorkerLogs: async () => {
      try {
        const result = await queryPage.evaluate(() =>
          chrome.storage.local.get("infoLogs"),
        );
        return result.infoLogs ?? [];
      } catch {
        return [];
      }
    },
    close: async () => {
      // Browser is shared across all tests; actual cleanup happens on process exit.
    },
  };
}
