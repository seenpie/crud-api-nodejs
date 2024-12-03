import { createServer, Server as ServerInstance } from "http";
import { RequestHandlerService } from "@/server/request-handler.service";
import { ResponseHandlerService } from "@/server/response-handler.service";
import { DatabaseService } from "@/db/database.service";

export type Port = string | undefined;

export class DefaultServerService {
  private readonly server: ServerInstance;
  private readonly requestHandler: RequestHandlerService;
  private readonly defaultPort = 3000;
  private readonly responseHandler: ResponseHandlerService;

  constructor(private readonly dbService: DatabaseService) {
    this.responseHandler = new ResponseHandlerService();
    this.requestHandler = new RequestHandlerService(
      this.responseHandler,
      dbService
    );
    this.server = this._createServer();
  }

  start(serverPort: Port) {
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

  private _createPort(serverPort: Port): number {
    const parsedPort = Number(serverPort);

    if (Number.isNaN(parsedPort) || 0 >= parsedPort || parsedPort >= 65536) {
      return this.defaultPort;
    }

    return parsedPort;
  }
}
