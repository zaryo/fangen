export default function truncateUrl(url, size) {
  if (url.length <= size) return url;

  const half = Math.trunc(size / 2) + 4;

  return `${url.slice(0, half)}...${url.slice(-half - 2)}`;
}
