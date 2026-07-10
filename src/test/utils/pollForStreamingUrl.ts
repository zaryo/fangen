import type {Browser} from "./browser";
import {STREAMING_POLL_DELAY} from "./extension";

export default async function pollForStreamingUrl(
  browserHandle: Browser,
  present: boolean,
  tabId: number,
  targetUrl: string,
  timeout = 30000,
): Promise<string[] | undefined> {
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

    await new Promise<void>((resolve) =>
      setTimeout(resolve, STREAMING_POLL_DELAY),
    );
  }

  const streamingUrls = await browserHandle.getBrowserStreamingUrls(tabId);

  let errorMessage: string;

  if (present !== false) {
    errorMessage = `Timeout: streaming URL not found for ${targetUrl}. Captured URLs: ${JSON.stringify(streamingUrls)}`;
  } else {
    errorMessage = `Timeout: Captured URLs: ${JSON.stringify(streamingUrls)}`;
  }

  throw new Error(errorMessage);
}
