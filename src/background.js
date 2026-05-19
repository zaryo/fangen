const streamingMimeTypes = [
  "video/",
  "audio/",
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "application/dash+xml",
];

const streamingUrls = new Set();

function isStreamingResponse(responseHeaders) {
  const contentType =
    responseHeaders.find((h) => h.name.toLowerCase() === "content-type")
      ?.value ?? "";
  return streamingMimeTypes.some((t) => contentType.toLowerCase().includes(t));
}

function logURL(requestDetails) {
  if (isStreamingResponse(requestDetails.responseHeaders)) {
    console.log(`Streaming: ${requestDetails.url}`);
    streamingUrls.add(requestDetails.url);
  }
}

chrome.webRequest.onHeadersReceived.addListener(
  logURL,
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getStreamingUrls") {
    sendResponse({ urls: Array.from(streamingUrls) });
  }
});

console.log("Listener registered");
