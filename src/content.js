window.addEventListener("message", async (event) => {
  if (event.source !== window || event.data?.origin !== "fangen-test") return;
  const { type, data, messageId } = event.data;
  let response;
  try {
    const extensionResponse = await browser.runtime.sendMessage({ type, data });
    response = { ok: true, data: extensionResponse };
  } catch (error) {
    response = { ok: false, error: error.message };
  }
  window.postMessage({ origin: "fangen-extension", messageId, response }, "*");
});
