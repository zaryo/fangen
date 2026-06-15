export function parseStreamingUrls(logs) {
  const urls = logs
    .map((log) =>
      log.match(/^\[INFO\] .+? Streaming server address found: (.+)$/),
    )
    .filter(Boolean)
    .map((match) => match[1]);

  return { urls };
}
