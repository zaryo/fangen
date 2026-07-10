import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { match } from "ts-pattern";
import webExt from "web-ext";

const buildDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(buildDirectory, "..");

export default function startBrowser(browserName) {
  return match(browserName)
    .with("chromium", () =>
      webExt.cmd.run({
        sourceDir: projectRoot,
        target: "chromium",
        chromiumBinary: process.env.CHROMIUM_BINARY,
        noReload: true,
      }),
    )
    .with("firefox", () =>
      webExt.cmd.run({
        sourceDir: projectRoot,
        firefox: process.env.FIREFOX_BINARY,
        noReload: true,
      }),
    )
    .exhaustive();
}
