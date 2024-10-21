export enum AvailableRequestMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE"
}

export enum AvailableRequestURL {
  USERS = "/api/users",
  FAVICON = "/favicon.ico"
}

export enum ErrorMessages {
  METHOD_NOT_FOUND = "Method Not Found",
  ID_NOT_VALID = "Id not valid",
  UNKNOWN_REQUEST = "Unknown request",
  UNKNOWN_ERROR = "Unknown error",
  USER_NOT_EXISTS = "User Not Exists",
  DATA_IS_INVALID = "Data IS invalid"
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}
