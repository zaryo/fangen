import { HttpResponse, http as mswHttp } from "msw";
import { setupServer } from "msw/node";
import http from "node:http";
import { mimeTypeByExtension } from "../../types/streamingMimeTypes.js";

const INTERNAL_MOCK_ORIGIN = "http://mock.internal";

const streamingRequestHandler = mswHttp.get(
  `${INTERNAL_MOCK_ORIGIN}/stream/:extension`,
  ({ params }) => {
    const mimeType = mimeTypeByExtension.get(params.extension);

    if (!mimeType) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, {
      status: 200,
      headers: { "Content-Type": mimeType, "Content-Length": "0" },
    });
  },
);

export function launchMockServer() {
  const mswServer = setupServer(streamingRequestHandler);
  mswServer.listen({ onUnhandledRequest: "bypass" });

  const httpServer = http.createServer(async (req, res) => {
    try {
      const internalUrl = `${INTERNAL_MOCK_ORIGIN}${req.url}`;
      const internalResponse = await fetch(internalUrl, { method: req.method });

      res.writeHead(
        internalResponse.status,
        Object.fromEntries(internalResponse.headers.entries()),
      );
      const body = await internalResponse.arrayBuffer();
      res.end(Buffer.from(body));
    } catch {
      res.writeHead(500);
      res.end();
    }
  });

  return new Promise((resolve, reject) => {
    httpServer.listen(0, "127.0.0.1", () => {
      const { port } = httpServer.address();
      resolve({
        port,
        urlFor: (extension) => `http://127.0.0.1:${port}/stream/${extension}`,
        resetHandlers: () => mswServer.resetHandlers(),
        close: async () => {
          mswServer.close();
          httpServer.closeAllConnections();
          await new Promise((res) => httpServer.close(res));
        },
      });
    });
    httpServer.on("error", reject);
  });
}
