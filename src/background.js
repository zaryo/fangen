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
    responseHeaders.find(
      (responseHeader) => responseHeader.name.toLowerCase() === "content-type",
    )?.value ?? "";
  return streamingMimeTypes.some((responseMimeType) =>
    contentType.toLowerCase().includes(responseMimeType),
  );
}

async function handleRequest(requestDetails) {
  if (isStreamingResponse(requestDetails.responseHeaders)) {
    streamingUrls.add(requestDetails.url);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getStreamingUrls") {
    sendResponse({ urls: Array.from(streamingUrls) });
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  handleRequest,
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);
