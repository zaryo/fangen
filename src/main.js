import getBrowserActiveTab from "./getBrowserActiveTab.js";
import initializeTheme from "./theme.js";
import truncateUrl from "./truncateUrl.js";

initializeTheme();

document
  .querySelector(".page__button_fetch_streaming_urls")
  .addEventListener("click", async () => {
    const activeTab = await getBrowserActiveTab();

    const { urls: streamingUrls } = await chrome.runtime.sendMessage({
      type: "getStreamingUrls",
      data: { currentTabId: activeTab.id },
    });

    const backend_url_addresses_list = document.querySelector(
      ".page__servers_list",
    );

    backend_url_addresses_list.replaceChildren(
      ...streamingUrls.map((url) => {
        const backend_url_address = document.createElement("a");
        backend_url_address.href = url;
        backend_url_address.className = "page__servers_list_item";
        backend_url_address.target = "_blank";
        backend_url_address.textContent = truncateUrl(url, 25);
        const list_item = document.createElement("li");
        list_item.appendChild(backend_url_address);
        return list_item;
      }),
    );
  });

document
  .querySelector(".page__button_delete_streaming_urls")
  .addEventListener("click", async () => {
    const activeTab = await getBrowserActiveTab();

    await chrome.runtime.sendMessage({
      type: "deleteStreamingUrls",
      data: { currentTabId: activeTab.id },
    });
  });
