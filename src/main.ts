import getBrowserActiveTab from "./getBrowserActiveTab";
import initializeTheme from "./theme";
import truncateUrl from "./truncateUrl";

initializeTheme();

document
  .querySelector(".page__button_fetch_streaming_urls")
  ?.addEventListener("click", async () => {
    const activeTab = await getBrowserActiveTab();
    const activeTabId = activeTab.id;

    if (activeTabId === undefined) {
      throw new Error("Active tab has no id");
    }

    const { urls: streamingUrls }: { urls: string[] } =
      await chrome.runtime.sendMessage({
        type: "getStreamingUrls",
        data: { currentTabId: activeTabId },
      });

    const backendUrlAddressesList = document.querySelector(
      ".page__servers_list",
    );

    backendUrlAddressesList?.replaceChildren(
      ...streamingUrls.map((streamingUrl) => {
        const backendUrlAddress = document.createElement("a");
        backendUrlAddress.href = streamingUrl;
        backendUrlAddress.className = "page__servers_list_item";
        backendUrlAddress.target = "_blank";
        backendUrlAddress.textContent = truncateUrl(streamingUrl, 25);
        const listItem = document.createElement("li");
        listItem.appendChild(backendUrlAddress);

        return listItem;
      }),
    );
  });

document
  .querySelector(".page__button_delete_streaming_urls")
  ?.addEventListener("click", async () => {
    const activeTab = await getBrowserActiveTab();
    const activeTabId = activeTab.id;

    if (activeTabId === undefined) {
      throw new Error("Active tab has no id");
    }

    await chrome.runtime.sendMessage({
      type: "deleteStreamingUrls",
      data: { currentTabId: activeTabId },
    });

    document.querySelector(".page__servers_list")?.replaceChildren();
  });
