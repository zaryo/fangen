export default async function setExtensionLogLevel(
  extensionType,
  extensionPage,
  logLevel,
) {
  return extensionType.setLogLevel(extensionPage, logLevel);
}
