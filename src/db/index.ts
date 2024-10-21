import { TUser } from "@/models/types";
import { Storage } from "@/db/Classes/Storage";

const storeDB: TUser[] = [];

export const storage = new Storage(storeDB);
