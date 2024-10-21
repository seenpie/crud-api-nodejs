import { ErrorMessages, HttpStatusCode } from "@/models/enums";

export type TUser = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

export type ClientData = Pick<TUser, "username" | "age"> & {
  hobbies: (string | number | [])[];
};

export type UpdateClientData = Partial<ClientData>;

export type TResponsePayload = {
  message: ErrorMessages | HttpStatusCode | string;
  data: null | TUser | TUser[];
};
