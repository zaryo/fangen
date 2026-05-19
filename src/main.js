import truncateUrl from "./truncate_url.js";

document
  .querySelector(".page__button_fetch_servers")
  .addEventListener("click", async () => {
    const { urls } = await chrome.runtime.sendMessage({
      type: "getStreamingUrls",
    });

    const list = document.querySelector(".page__servers_list");
    list.innerHTML = urls
      .map(
        (url) =>
          `<li><a href="${url}" class="page__servers_list_item" target="_blank">${truncateUrl(url, 25)}</a></li>`,
      )
      .join("");
  });
