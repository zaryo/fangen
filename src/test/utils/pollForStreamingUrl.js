import { STREAMING_POLL_DELAY } from "./extension.js";

export default async function pollForStreamingUrl(
  browserHandle,
  present,
  tabId,
  targetUrl,
  timeout = 30000,
) {
  const start = Date.now();

  if (present === false) {
    await browserHandle.deleteBrowserStreamingUrls(tabId);
  }

  while (Date.now() - start < timeout) {
    const streamingUrls = await browserHandle.getBrowserStreamingUrls(tabId);

    const targetUrlExists = streamingUrls.some(
      (streamingUrl) => streamingUrl === targetUrl,
    );

    if (targetUrlExists && present === true) {
      return streamingUrls;
    } else if (!targetUrlExists && present === false) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, STREAMING_POLL_DELAY));
  }

  const streamingUrls = await browserHandle.getBrowserStreamingUrls(tabId);

  let errorMessage;

  if (present !== false) {
    errorMessage = `Timeout: streaming URL not found for ${targetUrl}. Captured URLs: ${JSON.stringify(streamingUrls)}`;
  } else {
    errorMessage = `Timeout: Captured URLs: ${JSON.stringify(streamingUrls)}`;
  }

  throw new Error(errorMessage);
}
