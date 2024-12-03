import dotenv from "dotenv";
import { TUser } from "./models/types";
import { DatabaseService } from "./db/database.service";
import { createDefaultServer } from "@/helpers/server.helper";

dotenv.config();

function main() {
  process.on("uncaughtException", console.log);

  const store: TUser[] = [];
  const dbService = new DatabaseService(store);
  const server = createDefaultServer(dbService);

  server.start(process.env.PORT);
}

main();
