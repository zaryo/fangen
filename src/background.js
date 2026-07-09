import { streamingMimeTypes } from "./types/streamingMimeTypes.js";

const streamingUrls = new Map();

function isStreamingResponse(responseHeaders) {
  const contentType =
    responseHeaders.find(
      (responseHeader) => responseHeader.name.toLowerCase() === "content-type",
    )?.value ?? "";

  return streamingMimeTypes.some((responseMimeType) =>
    contentType.toLowerCase().includes(responseMimeType),
  );
}

function registerStreamingUrl(requestTabId, requestUrl) {
  const tabsUrls = streamingUrls.get(requestTabId);

  if (tabsUrls) {
    tabsUrls.add(requestUrl);
  } else {
    streamingUrls.set(requestTabId, new Set([requestUrl]));
  }
}

function handleRequest(requestDetails) {
  if (!isStreamingResponse(requestDetails.responseHeaders)) return;

  const requestTabId = requestDetails.tabId;
  const requestUrl = requestDetails.url;

  registerStreamingUrl(requestTabId, requestUrl);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getStreamingUrls") {
    const currentTabId = message.data.currentTabId;

    const tabUrls = streamingUrls.get(currentTabId);

    if (tabUrls) {
      sendResponse({ urls: Array.from(tabUrls) });
    } else {
      sendResponse({ urls: [] });
    }

    return;
  }

  if (message.type === "deleteStreamingUrls") {
    const currentTabId = message.data.currentTabId;

    console.log(streamingUrls);

    const tabUrls = streamingUrls.get(currentTabId);

    if (tabUrls) {
      streamingUrls.delete(currentTabId);
    }

    console.log(streamingUrls);
    return;
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  handleRequest,
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);
