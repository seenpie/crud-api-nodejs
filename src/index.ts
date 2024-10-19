import { Server } from "@/server/Classes/Server";

const server = new Server();

function main() {
  server.start(process.env.PORT);
}

main();
