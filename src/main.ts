import getBrowserActiveTab from "./getBrowserActiveTab";
import initializeTheme from "./theme";
import truncateUrl from "./truncateUrl";

initializeTheme();

document
  .querySelector(".page__button_fetch_streaming_urls")
  ?.addEventListener("click", async () => {
    const activeTab = await getBrowserActiveTab();

    const { urls: streamingUrls } = (await chrome.runtime.sendMessage({
      type: "getStreamingUrls",
      data: { currentTabId: activeTab.id! },
    })) as { urls: string[] };

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

    await chrome.runtime.sendMessage({
      type: "deleteStreamingUrls",
      data: { currentTabId: activeTab.id! },
    });
  });
