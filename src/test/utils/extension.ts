import path from "node:path";
import { fileURLToPath } from "node:url";

const directoryName = path.dirname(fileURLToPath(import.meta.url));

export const EXTENSION_PATH = path.resolve(directoryName, "../../..");
export const EXTENSION_PAGE = "/templates/index.html";
export const STREAMING_POLL_DELAY = 30;
