import {HttpResponse, http as mswHttp} from "msw";
import {setupServer} from "msw/node";
import http from "node:http";
import {AddressInfo} from "node:net";
import {mimeTypeByExtension} from "../../types/streamingMimeTypes";

const INTERNAL_MOCK_SERVER_ORIGIN = "http://mock.internal";

const streamingRequestHandler = mswHttp.get(
  `${INTERNAL_MOCK_SERVER_ORIGIN}/stream/:extension`,
  ({params}) => {
    const mimeType = mimeTypeByExtension.get(params["extension"] as string);

    if (!mimeType) {
      return new HttpResponse(null, {status: 404});
    }

    return new HttpResponse(null, {
      status: 200,
      headers: {"Content-Type": mimeType, "Content-Length": "0"},
    });
  },
);

export interface MockServerHandle {
  port: number;
  urlFor: (extension: string) => string;
  resetHandlers: () => void;
  close: () => Promise<void>;
}

export default function launchMockServer(): Promise<MockServerHandle> {
  const mswServer = setupServer(streamingRequestHandler);
  mswServer.listen({onUnhandledRequest: "bypass"});

  const httpServer = http.createServer(async (req, res) => {
    try {
      const internalUrl = `${INTERNAL_MOCK_SERVER_ORIGIN}${req.url}`;
      const internalResponse = await fetch(internalUrl, {
        method: req.method ?? "GET",
      });

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
      const {port} = httpServer.address() as AddressInfo;
      resolve({
        port,
        urlFor: (extension: string) =>
          `http://127.0.0.1:${port}/stream/${extension}`,
        resetHandlers: () => mswServer.resetHandlers(),
        close: async () => {
          mswServer.close();
          httpServer.closeAllConnections();
          await new Promise<void>((res) => httpServer.close(() => res()));
        },
      });
    });
    httpServer.on("error", reject);
  });
}
