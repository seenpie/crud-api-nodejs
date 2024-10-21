import { ClientData, TResponsePayload, TUser } from "@/models/types";
import { User } from "@/db/Classes/User";
import { UserDataValidator } from "@/db/Classes/UserDataValidator";
import { ErrorMessages, HttpStatusCode } from "@/models/enums";

export class Storage {
  private store: TUser[];
  private readonly validator: UserDataValidator;

  constructor(store: TUser[]) {
    this.store = store;
    this.validator = new UserDataValidator();
  }

  private _return(
    message: ErrorMessages | HttpStatusCode,
    data: null | TUser | TUser[] = null
  ): TResponsePayload {
    return { message, data };
  }

  private _findUserById(id: string): number {
    return this.store.findIndex((user) => user.id === id);
  }

  createUser(userData: ClientData): TResponsePayload {
    const isDataValid = this.validator.validateUserData(userData);
    if (!isDataValid) return this._return(ErrorMessages.DATA_IS_INVALID);

    const { username, age, hobbies } = userData;
    const newUser = new User(username, age, hobbies as string[] | []);
    this.store.push(newUser.getUser());
    return this._return(HttpStatusCode.CREATED, newUser.getUser());
  }

  deleteUser(id: string): TResponsePayload {
    const isIdValid = this.validator.validateUserId(id);
    if (!isIdValid) return this._return(ErrorMessages.ID_NOT_VALID);

    const userIndex = this._findUserById(id);
    if (userIndex === -1) return this._return(ErrorMessages.USER_NOT_EXISTS);

    this.store = this.store.filter((_, id) => id !== userIndex);

    return this._return(HttpStatusCode.NO_CONTENT, null);
  }

  updateUser(id: string, userData: ClientData): TResponsePayload {
    const isIdValid = this.validator.validateUserId(id);
    if (!isIdValid) return this._return(ErrorMessages.ID_NOT_VALID);

    const userIndex = this._findUserById(id);
    if (userIndex === -1) return this._return(ErrorMessages.USER_NOT_EXISTS);

    const isDataValid = this.validator.validateUpdatedUserData(userData);
    if (!isDataValid) return this._return(ErrorMessages.DATA_IS_INVALID);

    const user = this.store[userIndex];
    const updatedUser: TUser = { ...user, ...userData } as TUser;

    this.store[userIndex] = updatedUser;

    return this._return(HttpStatusCode.OK, updatedUser);
  }

  getUserList() {
    return this.store;
  }

  getUserById(id: string): TResponsePayload {
    const isIdValid = this.validator.validateUserId(id);
    if (!isIdValid) return this._return(ErrorMessages.ID_NOT_VALID);

    const userIndex = this._findUserById(id);
    if (userIndex === -1) return this._return(ErrorMessages.USER_NOT_EXISTS);

    return this._return(HttpStatusCode.OK, this.store[userIndex]);
  }
}
