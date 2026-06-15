import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, "../../..");

// Singleton: browser is launched once and shared across all tests to stay
// within jest's 2000ms per-test timeout.
let firefoxBrowserContextPromise = null;

function createQueryHttpServer() {
  const queryHttpServer = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<html><body></body></html>");
  });
  return new Promise((resolve, reject) => {
    queryHttpServer.listen(0, "127.0.0.1", () => {
      resolve({
        queryHttpServer,
        queryPageUrl: `http://127.0.0.1:${queryHttpServer.address().port}/`,
      });
    });
    queryHttpServer.on("error", reject);
  });
}

function sendExtensionMessage(queryPage, type, data) {
  return queryPage.evaluate(
    ({ type, data }) =>
      new Promise((resolve) => {
        const messageId = `${type}-${Date.now()}-${Math.random()}`;
        window.addEventListener("message", function handler(event) {
          if (
            event.data?.origin === "fangen-extension" &&
            event.data?.messageId === messageId
          ) {
            window.removeEventListener("message", handler);
            resolve(event.data.response);
          }
        });
        window.postMessage(
          { origin: "fangen-test", type, data, messageId },
          "*",
        );
        setTimeout(() => resolve({ ok: false, error: "timeout" }), 5000);
      }),
    { type, data },
  );
}

async function waitForExtensionReady(queryPage, queryPageUrl) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const result = await sendExtensionMessage(
      queryPage,
      "getStreamingUrls",
      null,
    );
    if (result?.ok) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
    await queryPage.goto(queryPageUrl, { timeout: 5000 });
  }
  throw new Error("Extension background did not become ready in time");
}

async function initFirefoxBrowserContext(executablePath) {
  const { queryHttpServer, queryPageUrl } = await createQueryHttpServer();

  const browser = await puppeteer.launch({
    product: "firefox",
    protocol: "webDriverBiDi",
    headless: true,
    executablePath,
    extraPrefsFirefox: {
      "xpinstall.signatures.required": false,
    },
    timeout: 30000,
  });

  await browser.connection.send("webExtension.install", {
    extensionData: { type: "path", path: extensionPath },
  });

  const queryPage = await browser.newPage();
  await queryPage.goto(queryPageUrl, { timeout: 10000 });
  await waitForExtensionReady(queryPage, queryPageUrl);

  process.on("exit", () => {
    browser.close().catch(() => {});
    queryHttpServer.close();
  });

  return { browser, queryPage };
}

export async function preLaunchFirefox() {
  const executablePath = process.env.FIREFOX_BINARY;
  if (!executablePath) throw new Error("FIREFOX_BINARY env var is required");

  if (!firefoxBrowserContextPromise) {
    firefoxBrowserContextPromise = initFirefoxBrowserContext(executablePath);
  }

  await firefoxBrowserContextPromise;
}

export async function launchFirefox(logLevel) {
  const executablePath = process.env.FIREFOX_BINARY;
  if (!executablePath) throw new Error("FIREFOX_BINARY env var is required");

  if (!firefoxBrowserContextPromise) {
    firefoxBrowserContextPromise = initFirefoxBrowserContext(executablePath);
  }

  const { browser, queryPage } = await firefoxBrowserContextPromise;

  await sendExtensionMessage(queryPage, "setLogLevel", { logLevel });

  return {
    browser,
    getServiceWorkerLogs: async () => {
      try {
        const result = await sendExtensionMessage(
          queryPage,
          "getInfoLogs",
          null,
        );
        return result?.data?.infoLogs ?? [];
      } catch {
        return [];
      }
    },
    close: async () => {
      // Browser is shared across all tests; actual cleanup happens on process exit.
    },
  };
}
