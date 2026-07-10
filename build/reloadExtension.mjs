let reloadTimer = null;

export default function reloadExtension(extensionRunner) {
  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => extensionRunner.reloadAllExtensions(), 200);
}
