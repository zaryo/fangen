#!/usr/bin/env node

import { watch } from "node:fs";
import rebuild from "./build/rebuild.mjs";
import reloadExtension from "./build/reloadExtension.mjs";
import startBrowser from "./build/startBrowser.mjs";
import bundleProject from "./build/bundle.mjs";

const commandLineArguments = process.argv.slice(2);
const browserFlags = commandLineArguments.filter(
  (argument) => argument === "--chromium" || argument === "--firefox",
);

if (browserFlags.length !== 1) {
  console.error("Usage: ./watch.mjs --chromium | --firefox");
  process.exit(1);
}

const browserFlag = browserFlags[0];

await bundleProject();
console.log("[watch] Initial build complete. Starting browser...");

const extensionRunner = await startBrowser(browserFlag.slice(2));

watch("src", { recursive: false }, rebuild);
watch("src/types", { recursive: true }, rebuild);
watch("dist", { recursive: true }, () => reloadExtension(extensionRunner));
watch("resources", { recursive: true }, () => reloadExtension(extensionRunner));
watch("templates", { recursive: true }, () => reloadExtension(extensionRunner));

console.log("[watch] Watching for changes...");
