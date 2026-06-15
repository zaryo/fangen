import { streamingMimeTypes } from "./types/streamingMimeTypes.js";

const streamingUrls = new Set();

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

  const { logLevel = "silent" } = await chrome.storage.local.get("logLevel");

  if (logLevel === "info") {
    await logStreamingUrl(requestDetails.url);
  }
}

await chrome.storage.local.set({ logLevel: "info" });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getStreamingUrls") {
    sendResponse({ urls: Array.from(streamingUrls) });
    return;
  }

  if (message.type === "setLogLevel") {
    chrome.storage.local
      .set({ logLevel: message.data.logLevel, infoLogs: [] })
      .then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === "getinfoLogs") {
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
