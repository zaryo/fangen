import truncateUrl from "../truncateUrl";

test("testTruncateUrlTrimsUrlMiddle", () => {
  const url = "https://example.com/streaming/video.m3u8";
  const truncatedUrl = "https://exampl...ng/video.m3u8";

  expect(truncateUrl(url, 30)).toBe(truncatedUrl);
});

test("testTruncateUrlDoesNotTrimUrlEnd", () => {
  const url = "https://example.com/streaming/video.m3u8";
  const truncatedEndUrl = "https://example.com/streaming/video.m...";

  expect(truncateUrl(url, 30)).not.toBe(truncatedEndUrl);
});
