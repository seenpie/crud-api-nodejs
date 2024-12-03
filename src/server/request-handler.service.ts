import { IncomingMessage, ServerResponse } from "http";
import {
  AvailableRequestMethods,
  AvailableRequestURL,
  ErrorMessages,
  HttpStatusCode
} from "@/models/enums";
import { ClientData, TResponsePayload, TUser } from "@/models/types";
import { ResponseHandlerService } from "@/server/response-handler.service";
import { DatabaseService } from "@/db/database.service";
import cluster from "cluster";
import {
  deleteItemById,
  getDbInstance,
  getItemById,
  setItemToMasterDb,
  updateItemById
} from "@/helpers/worker.helper";

const { isWorker } = cluster;

const userUrlPattern = /^\/api\/users\/([a-zA-Z0-9-]+)$/;

export class RequestHandlerService {
  private requestCount: number;
  private responseHandler: ResponseHandlerService;

  constructor(
    responseHandler: ResponseHandlerService,
    private readonly dbService: DatabaseService
  ) {
    this.requestCount = 0;
    this.responseHandler = responseHandler;
  }

  handleRequest = async (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> => {
    const { url } = req;

    this._incRequestCount();

    if (url?.startsWith("/api/users")) {
      const match = userUrlPattern.exec(url);

      if (match) {
        const userId = match[1];
        await this._handleUserIdURLRequest(req, res, userId);
        return;
      }
    }

    if (url === AvailableRequestURL.USERS) {
      await this._handleUsersURLRequest(req, res);
      return;
    }

    if (url === AvailableRequestURL.FAVICON) {
      this._handleFaviconURLRequest(res);
      return;
    }

    this._handleUnknownURLRequest(res);
    return;
  };

  private _incRequestCount() {
    return ++this.requestCount;
  }

  private _handleUsersURLRequest = async (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> => {
    const { method } = req;

    if (method === AvailableRequestMethods.GET) {
      await this._handleGetUsers(res);
      return;
    }

    if (method === AvailableRequestMethods.POST) {
      await this._handleCreateUser(req, res);
      return;
    }

    this.responseHandler.respond(res, {
      message: ErrorMessages.METHOD_NOT_FOUND,
      data: null
    });
  };

  private async _handleGetUsers(res: ServerResponse): Promise<void> {
    let userList: TUser[];
    if (isWorker) {
      userList = await getDbInstance();
    } else {
      userList = this.dbService.getUserList();
    }

    this.responseHandler.respond(res, {
      message: HttpStatusCode.OK,
      data: userList
    });
  }

  private _handleFaviconURLRequest(res: ServerResponse): void {
    this.responseHandler.respond(res, {
      message: HttpStatusCode.NO_CONTENT,
      data: null
    });
  }

  private async _handleUserIdURLRequest(
    req: IncomingMessage,
    res: ServerResponse,
    userId: string
  ): Promise<void> {
    const { method } = req;

    if (method === AvailableRequestMethods.GET) {
      await this._handleGetUser(res, userId);
      return;
    }

    if (method === AvailableRequestMethods.PUT) {
      this._handleUpdateUser(req, res, userId);
      return;
    }

    if (method === AvailableRequestMethods.DELETE) {
      await this._handleDeleteUser(res, userId);
      return;
    }

    this.responseHandler.respond(res, {
      message: ErrorMessages.METHOD_NOT_FOUND,
      data: null
    });
  }

  private _handleUnknownURLRequest(res: ServerResponse): void {
    this.responseHandler.respond(res, {
      message: ErrorMessages.UNKNOWN_REQUEST,
      data: null
    });
  }

  private async _handleCreateUser(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("error", (error) => {
      this.responseHandler.respond(res, {
        message: error.message,
        data: null
      });
    });

    req.on("end", async () => {
      try {
        const parsedBody = JSON.parse(body) as ClientData;

        let createdUserOp: TResponsePayload;
        if (isWorker) {
          createdUserOp = await setItemToMasterDb(parsedBody);
        } else {
          createdUserOp = this.dbService.createUser(parsedBody);
        }

        this.responseHandler.respond(res, createdUserOp);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR;

        this.responseHandler.respond(res, {
          message,
          data: null
        });
      }
    });
  }

  private async _handleDeleteUser(
    res: ServerResponse,
    userId: string
  ): Promise<void> {
    let deleteUserOp: TResponsePayload;
    if (isWorker) {
      deleteUserOp = await deleteItemById(userId);
    } else {
      deleteUserOp = this.dbService.deleteUser(userId);
    }
    this.responseHandler.respond(res, deleteUserOp);
  }

  private _handleUpdateUser(
    req: IncomingMessage,
    res: ServerResponse,
    userId: string
  ) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("error", (error) => {
      this.responseHandler.respond(res, {
        message: error.message,
        data: null
      });
    });

    req.on("end", async () => {
      try {
        const parsedBody = JSON.parse(body) as ClientData;
        let updatedUserOp: TResponsePayload;
        if (isWorker) {
          updatedUserOp = await updateItemById(userId, parsedBody);
        } else {
          updatedUserOp = this.dbService.updateUser(userId, parsedBody);
        }

        this.responseHandler.respond(res, updatedUserOp);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR;

        this.responseHandler.respond(res, {
          message,
          data: null
        });
      }
    });
  }

  private async _handleGetUser(
    res: ServerResponse,
    userId: string
  ): Promise<void> {
    let getUserOp: TResponsePayload;
    if (isWorker) {
      getUserOp = await getItemById(userId);
    } else {
      getUserOp = this.dbService.getUserById(userId);
    }
    this.responseHandler.respond(res, getUserOp);
  }
}
