export const streamingMimeTypes = [
  "video/",
  "audio/",
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "application/dash+xml",
];

export const mimeTypeByExtension = new Map([
  ["mp4", "video/mp4"],
  ["mp3", "audio/mpeg"],
  ["m3u8", "application/vnd.apple.mpegurl"],
  ["x-mpegurl", "application/x-mpegurl"],
  ["mpd", "application/dash+xml"],
]);
