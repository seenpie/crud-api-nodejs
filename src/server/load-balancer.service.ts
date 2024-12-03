import { IncomingMessage, request, ServerResponse, createServer } from "http";
import { Server } from "node:net";

export class LoadBalancerService {
  private currentIndex: number;
  private server: Server;

  constructor(private readonly workerPorts: number[]) {
    this.currentIndex = 0;
    this.server = this._createServer();
  }

  start(port: number) {
    this.server.listen(port, () => {
      console.log(`Load Balancer is running on port ${port}`);
    });
  }

  private _createServer() {
    return createServer(this._handleRequest);
  }

  private _getNextWorkerPort() {
    const port = this.workerPorts[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.workerPorts.length;
    return port;
  }

  private _handleRequest = async (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> => {
    const targetPort = this._getNextWorkerPort();

    const proxyOptions = {
      hostname: "localhost",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyRequest = request(proxyOptions, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyRequest, { end: true });

    proxyRequest.on("error", (err) => {
      console.error("Proxy error:", err);
      res.writeHead(500);
      res.end("Internal DefaultServerService Error");
    });
  };
}
