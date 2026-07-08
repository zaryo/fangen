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

async function handleRequest(requestDetails) {
  if (!isStreamingResponse(requestDetails.responseHeaders)) return;

  streamingUrls.add(requestDetails.url);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getStreamingUrls") {
    sendResponse({ urls: Array.from(streamingUrls) });
    return;
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  handleRequest,
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);
