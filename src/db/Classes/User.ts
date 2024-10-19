import { v4 as uuidv4 } from "uuid";
import { TUser } from "@/models/types";

export class User {
  private readonly id: string;
  private readonly username: string;
  private readonly age: number;
  private readonly hobbies: string[];

  constructor(username: string, age: number, hobbies: string[] | []) {
    this.id = uuidv4();
    this.username = username;
    this.age = age;
    this.hobbies = hobbies;
  }

  getUser(): TUser {
    return {
      id: this.id,
      username: this.username,
      age: this.age,
      hobbies: this.hobbies
    };
  }
}
