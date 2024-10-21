import { ErrorMessages, HttpStatusCode } from "@/models/enums";
import { ServerResponse } from "http";
import { TResponsePayload } from "@/models/types";

type TStatusCodeHandlers = {
  [key in HttpStatusCode]: (
    res: ServerResponse,
    data: TResponsePayload
  ) => void;
};

type TErrorMessageMap = {
  [key in ErrorMessages]: HttpStatusCode;
};

export class ResponseHandler {
  private readonly _statusCodeHandlers: TStatusCodeHandlers = {
    [HttpStatusCode.OK]: this._handleOK.bind(this),
    [HttpStatusCode.CREATED]: this._handleCreate.bind(this),
    [HttpStatusCode.NOT_FOUND]: this._handleNotFound.bind(this),
    [HttpStatusCode.INTERNAL_SERVER_ERROR]:
      this._handleInternalServerError.bind(this),
    [HttpStatusCode.BAD_REQUEST]: this._handleBadRequest.bind(this),
    [HttpStatusCode.NO_CONTENT]: this._handleNoContent.bind(this)
  };

  private readonly _errorResponseMap: TErrorMessageMap = {
    [ErrorMessages.UNKNOWN_REQUEST]: HttpStatusCode.NOT_FOUND,
    [ErrorMessages.UNKNOWN_ERROR]: HttpStatusCode.INTERNAL_SERVER_ERROR,
    [ErrorMessages.DATA_IS_INVALID]: HttpStatusCode.BAD_REQUEST,
    [ErrorMessages.ID_NOT_VALID]: HttpStatusCode.BAD_REQUEST,
    [ErrorMessages.USER_NOT_EXISTS]: HttpStatusCode.NOT_FOUND,
    [ErrorMessages.METHOD_NOT_FOUND]: HttpStatusCode.BAD_REQUEST
  };

  private _handleOK(res: ServerResponse, payload: TResponsePayload): void {
    this._sendResponse(res, HttpStatusCode.OK, JSON.stringify(payload.data));
  }

  private _handleCreate(res: ServerResponse, payload: TResponsePayload): void {
    this._sendResponse(
      res,
      HttpStatusCode.CREATED,
      JSON.stringify(payload.data)
    );
  }

  private _handleNotFound(
    res: ServerResponse,
    payload: TResponsePayload
  ): void {
    this._sendResponse(
      res,
      HttpStatusCode.NOT_FOUND,
      JSON.stringify(payload.message)
    );
  }

  private _handleInternalServerError(
    res: ServerResponse,
    payload: TResponsePayload
  ): void {
    this._sendResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      JSON.stringify(payload.message)
    );
  }

  private _handleNoContent(res: ServerResponse): void {
    res.writeHead(HttpStatusCode.NO_CONTENT);
    res.end();
  }

  private _handleBadRequest(
    res: ServerResponse,
    payload: TResponsePayload
  ): void {
    this._sendResponse(
      res,
      HttpStatusCode.BAD_REQUEST,
      JSON.stringify(payload.message)
    );
  }

  private _sendResponse(
    res: ServerResponse,
    statusCode: HttpStatusCode,
    body: string
  ): void {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(body);
  }

  private _getStatusCode({ message }: TResponsePayload): HttpStatusCode {
    if (this._errorResponseMap[message as ErrorMessages]) {
      return this._errorResponseMap[message as ErrorMessages];
    }

    if (this._statusCodeHandlers[message as HttpStatusCode]) {
      return message as HttpStatusCode;
    }

    return HttpStatusCode.INTERNAL_SERVER_ERROR;
  }

  respond(res: ServerResponse, payload: TResponsePayload) {
    const statusCode = this._getStatusCode(payload);
    this._statusCodeHandlers[statusCode](res, payload);
  }
}
