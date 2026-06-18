import { streamingMimeTypes } from "./types/streamingMimeTypes.js";

const streamingUrls = new Set();
let logLevel = "silent";

chrome.storage.onChanged.addListener((changes) => {
  if (changes.logLevel !== undefined) {
    logLevel = changes.logLevel.newValue ?? "silent";
  }
});

function isStreamingResponse(responseHeaders) {
  const contentType =
    responseHeaders.find(
      (responseHeader) => responseHeader.name.toLowerCase() === "content-type",
    )?.value ?? "";

  return streamingMimeTypes.some((responseMimeType) =>
    contentType.toLowerCase().includes(responseMimeType),
  );
}

async function logStreamingUrl(url) {
  const logEntry = `[INFO] ${new Date().toISOString()}: Streaming server address found: ${url}`;

  console.info(logEntry);

  const { infoLogs = [] } = await chrome.storage.local.get("infoLogs");
  await chrome.storage.local.set({ infoLogs: [...infoLogs, logEntry] });
}

async function handleRequest(requestDetails) {
  if (!isStreamingResponse(requestDetails.responseHeaders)) return;

  streamingUrls.add(requestDetails.url);

  if (logLevel === "info") {
    await logStreamingUrl(requestDetails.url);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getStreamingUrls") {
    sendResponse({ urls: Array.from(streamingUrls) });
    return;
  }

  if (message.type === "getInfoLogs") {
    chrome.storage.local
      .get("infoLogs")
      .then(({ infoLogs = [] }) => sendResponse({ infoLogs }));
    return true;
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  handleRequest,
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);
