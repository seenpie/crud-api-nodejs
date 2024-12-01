import { Server } from "@/server/Classes/Server";
import dotenv from "dotenv";
import { TUser } from "./models/types";
import { Storage } from "./db/Classes/Storage";

dotenv.config();

function main() {
  process.on("uncaughtException", console.log);

  const store: TUser[] = [];
  const dbService = new Storage(store);
  const server = new Server(dbService);

  server.start(process.env.PORT);
}

main();
