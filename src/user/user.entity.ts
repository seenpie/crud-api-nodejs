import { v4 as uuidv4 } from "uuid";

export class UserEntity {
  readonly id: string;
  readonly username: string;
  readonly age: number;
  readonly hobbies: string[];

  constructor(username: string, age: number, hobbies: string[] | []) {
    this.id = uuidv4();
    this.username = username;
    this.age = age;
    this.hobbies = hobbies;
  }
}
