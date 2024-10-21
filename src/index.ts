import { Server } from "@/server/Classes/Server";
import dotenv from "dotenv";

dotenv.config();

const server = new Server();

function main() {
  server.start(process.env.PORT);
}

main();
