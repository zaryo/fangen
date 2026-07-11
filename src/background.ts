import { streamingMimeTypes } from "./types/streamingMimeTypes";

const streamingUrls = new Map<number, Set<string>>();

function isStreamingResponse(
  responseHeaders: chrome.webRequest.HttpHeader[],
): boolean {
  const contentType =
    responseHeaders.find(
      (responseHeader) => responseHeader.name.toLowerCase() === "content-type",
    )?.value ?? "";

  return streamingMimeTypes.some((responseMimeType) =>
    contentType.toLowerCase().includes(responseMimeType),
  );
}

function registerStreamingUrl(requestTabId: number, requestUrl: string): void {
  const tabsUrls = streamingUrls.get(requestTabId);

  if (tabsUrls) {
    tabsUrls.add(requestUrl);
  } else {
    streamingUrls.set(requestTabId, new Set([requestUrl]));
  }
}

function handleRequest(
  requestDetails: chrome.webRequest.WebResponseHeadersDetails,
): void {
  const responseHeaders = requestDetails.responseHeaders;
  if (!responseHeaders || !isStreamingResponse(responseHeaders)) return;

  const requestTabId = requestDetails.tabId;
  const requestUrl = requestDetails.url;

  registerStreamingUrl(requestTabId, requestUrl);
}

chrome.runtime.onMessage.addListener(
  (
    message: { type: string; data: { currentTabId: number } },
    _sender,
    sendResponse,
  ) => {
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
    }
  },
);

chrome.webRequest.onHeadersReceived.addListener(
  handleRequest,
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);
