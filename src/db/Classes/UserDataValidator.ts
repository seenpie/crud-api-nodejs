import { ClientData } from "@/models/types";
import { validate as validateUuid } from "uuid";

export class UserDataValidator {
  private _validateUsernameField(data: ClientData) {
    if (!data["username"] || data.username.trim() === "") {
      return false;
    }

    return typeof data["username"] === "string";
  }

  private _validateAgeField(data: ClientData) {
    if (!data["age"] || isNaN(data.age) || data.age <= 0) {
      return false;
    }

    return typeof data["age"] === "number";
  }

  private _validateHobbiesField(data: ClientData) {
    if (!data["hobbies"] || !Array.isArray(data.hobbies)) {
      return false;
    }

    return data["hobbies"].every((hobby) => typeof hobby === "string");
  }

  private _validateDataLength(data: ClientData) {
    const parsedUser = Object.entries(data);

    return parsedUser.length <= 3;
  }

  validateUserData(data: ClientData): boolean {
    return (
      this._validateUsernameField(data) &&
      this._validateAgeField(data) &&
      this._validateHobbiesField(data) &&
      this._validateDataLength(data)
    );
  }

  validateUpdatedUserData(data: ClientData): boolean {
    return (
      (this._validateUsernameField(data) ||
        this._validateAgeField(data) ||
        this._validateHobbiesField(data)) &&
      this._validateDataLength(data)
    );
  }

  validateUserId(id: string) {
    return validateUuid(id);
  }
}
