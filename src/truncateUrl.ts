export default function truncateUrl(url: string, size: number): string {
  if (url.length <= size) return url;

  const available = size - 3;
  const tail = Math.floor(available / 2);
  const head = available - tail;

  return `${url.slice(0, head)}...${url.slice(-tail)}`;
}
