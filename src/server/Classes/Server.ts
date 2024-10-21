import { createServer, Server as ServerType } from "http";
import { RequestHandler } from "@/server/Classes/RequestHandler";
import { ResponseHandler } from "@/server/Classes/ResponseHandler";

type port = string | undefined;

export class Server {
  private readonly server: ServerType;
  private readonly requestHandler: RequestHandler;
  private readonly defaultPort = 3000;
  private readonly responseHandler: ResponseHandler;

  constructor() {
    this.responseHandler = new ResponseHandler();
    this.requestHandler = new RequestHandler(this.responseHandler);
    this.server = this._createServer();
  }

  start(serverPort: port) {
    const port = this._createPort(serverPort);
    this._startServer(port);
  }

  stop() {
    this.server.close();
  }

  getServerInstance() {
    return this.server;
  }

  private _startServer(serverPort: number): void {
    this.server.listen(serverPort);
  }

  private _createServer() {
    return createServer(this.requestHandler.handleRequest);
  }

  private _createPort(serverPort: port): number {
    const parsedPort = Number(serverPort);

    if (Number.isNaN(parsedPort) || 0 >= parsedPort || parsedPort >= 65536) {
      return this.defaultPort;
    }

    return parsedPort;
  }
}
