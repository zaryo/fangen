import initializeTheme from "./theme.js";
import truncateUrl from "./truncateUrl.js";

initializeTheme();

chrome.runtime.sendMessage({
  type: "setLogLevel",
  data: { logLevel: "info" },
});

document
  .querySelector(".page__button_fetch_servers")
  .addEventListener("click", async () => {
    const { urls } = await chrome.runtime.sendMessage({
      type: "getStreamingUrls",
    });

    const backend_url_addresses_list = document.querySelector(
      ".page__servers_list",
    );

    backend_url_addresses_list.replaceChildren(
      ...urls.map((url) => {
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
