export default async function getBrowserActiveTab(): Promise<chrome.tabs.Tab> {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab) {
    throw new Error("No active tab found");
  }

  return activeTab;
}
