import { TUser } from "@/models/types";
import { Storage } from "@/db/Classes/Storage";
import { User } from "@/db/Classes/User";

const testUser = new User("test user", 18, [
  "riding on bike",
  "watching films"
]);

const storeDB: TUser[] = [testUser.getUser()];

export const storage = new Storage(storeDB);
