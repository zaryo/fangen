import { STREAMING_POLL_DELAY } from "./extension.js";

export default async function pollForStreamingUrl(
  browserHandle,
  targetUrl,
  timeout = 1800,
) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const streamingUrls = await browserHandle.getBrowserStreamingUrls();

    if (streamingUrls.some((streamingUrl) => streamingUrl === targetUrl)) {
      return streamingUrls;
    }

    await new Promise((resolve) => setTimeout(resolve, STREAMING_POLL_DELAY));
  }

  const streamingUrls = await browserHandle.getBrowserStreamingUrls();
  throw new Error(
    `Timeout: streaming URL not found for ${targetUrl}. Captured URLs: ${JSON.stringify(streamingUrls)}`,
  );
}
