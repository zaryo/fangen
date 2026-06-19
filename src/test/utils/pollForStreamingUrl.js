import parseStreamingUrls from "./parseStreamingUrls.js";

const STREAMING_POLL_DELAY = 30;

export default async function pollForStreamingUrl(
  browserHandle,
  targetUrl,
  timeout = 1800,
) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const logs = await browserHandle.getServiceWorkerLogs();
    const { urls } = parseStreamingUrls(logs);

    if (urls.some((url) => url === targetUrl)) {
      return urls;
    }

    await new Promise((resolve) => setTimeout(resolve, STREAMING_POLL_DELAY));
  }

  const logs = await browserHandle.getServiceWorkerLogs();
  const { urls } = parseStreamingUrls(logs);
  throw new Error(
    `Timeout: streaming URL not found for ${targetUrl}. Captured URLs: ${JSON.stringify(urls)}`,
  );
}
