import { ErrorMessages, HttpStatusCode, MessageCommands } from "@/models/enums";

export type TUser = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

export type ClientData = Pick<TUser, "username" | "age"> & {
  hobbies: (string | number | [])[];
};

export type TResponsePayload = {
  message: ErrorMessages | HttpStatusCode | string;
  data: null | TUser | TUser[];
};

export type Message = {
  type: MessageCommands;
  message: string;
  data?: { id?: string; userData?: ClientData };
};
