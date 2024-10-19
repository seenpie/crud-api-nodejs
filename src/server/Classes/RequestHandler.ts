import { IncomingMessage, ServerResponse } from "http";
import {
  AvailableRequestMethods,
  AvailableRequestURL,
  ErrorMessages,
  HttpStatusCode
} from "@/models/enums";
import { storage } from "@/db";
import { ClientData } from "@/models/types";
import { ResponseHandler } from "@/server/Classes/ResponseHandler";

const userUrlPattern = /^\/api\/users\/([a-zA-Z0-9-]+)$/;

export class RequestHandler {
  private requestCount: number;
  private responseHandler: ResponseHandler;

  constructor(responseHandler: ResponseHandler) {
    this.requestCount = 0;
    this.responseHandler = responseHandler;
  }

  handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
    const { url } = req;

    this._incRequestCount();

    if (url?.startsWith("/api/users")) {
      const match = userUrlPattern.exec(url);

      if (match) {
        const userId = match[1];
        this._handleUserIdURLRequest(req, res, userId);
        return;
      }
    }

    if (url === AvailableRequestURL.USERS) {
      this._handleUsersURLRequest(req, res);
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

  private _handleUsersURLRequest = (
    req: IncomingMessage,
    res: ServerResponse
  ): void => {
    const { method } = req;

    if (method === AvailableRequestMethods.GET) {
      this._handleGetUsers(res);
      return;
    }

    if (method === AvailableRequestMethods.POST) {
      this._handleCreateUser(req, res);
      return;
    }

    this.responseHandler.respond(res, {
      message: ErrorMessages.METHOD_NOT_FOUND,
      data: null
    });
  };

  private _handleGetUsers(res: ServerResponse): void {
    const userList = storage.getUserList();
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

  private _handleUserIdURLRequest(
    req: IncomingMessage,
    res: ServerResponse,
    userId: string
  ): void {
    const { method } = req;

    if (method === AvailableRequestMethods.GET) {
      this._handleGetUser(res, userId);
      return;
    }

    if (method === AvailableRequestMethods.PUT) {
      this._handleUpdateUser(req, res, userId);
      return;
    }

    if (method === AvailableRequestMethods.DELETE) {
      this._handleDeleteUser(res, userId);
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

  private _handleCreateUser(req: IncomingMessage, res: ServerResponse): void {
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

    req.on("end", () => {
      try {
        const parsedBody = JSON.parse(body) as ClientData;
        const createdUserOp = storage.createUser(parsedBody);
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

  private _handleDeleteUser(res: ServerResponse, userId: string): void {
    const deleteUserOp = storage.deleteUser(userId);
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

    req.on("end", () => {
      try {
        const parsedBody = JSON.parse(body) as ClientData;
        const updatedUserOp = storage.updateUser(userId, parsedBody);

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

  private _handleGetUser(res: ServerResponse, userId: string): void {
    const getUserOp = storage.getUserById(userId);
    this.responseHandler.respond(res, getUserOp);
  }
}
