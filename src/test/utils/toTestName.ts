export default function toTestName(extension: string): string {
  return extension
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
