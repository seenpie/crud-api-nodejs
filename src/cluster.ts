import os from "os";
import cluster from "cluster";
import dotenv from "dotenv";
import { Port, Server } from "./server/Classes/Server";
import { Storage } from "./db/Classes/Storage";
import { TUser } from "./models/types";

dotenv.config();

const PORT = process.env.PORT || "3000";
const store: TUser[] = [];
const dbService = new Storage(store);

async function startCluster() {
  if (cluster.isPrimary) {
    console.log(`is primary, primary pid: ${process.pid}`);
    spawnWorkers();

    startServer(PORT, dbService);
  } else {
    // worker?.send(`i'm ready ${worker?.id}, sending message to parent`);
    // console.log("is worker", process.env.PORT);
    startServer(PORT, dbService);
  }
}

async function startServer(port: Port, dbService: Storage) {
  const server = new Server(dbService);
  server.start(port);
}

function createWorker(id: number) {
  const WORKER_PORT = +PORT + 1 + id;
  cluster.schedulingPolicy = cluster.SCHED_RR;
  const worker = cluster.fork({ PORT: WORKER_PORT });
  worker.on("message", () => {});
  return worker;
}

function handleWorkerMessage(message, worker) {
  console.log(
    `in master process ${process.pid} got message from worker ${worker.id}, message: ${JSON.stringify(message)}`
  );

  if (!("type" in message)) return;

  const { type, data } = message;

  switch (type) {
    case "set":
      worker.send({ data: dbService.createUser(data) });
      break;
    default:
      worker.send({ data: store });
  }
}

function spawnWorkers() {
  const availableParallelism = os.availableParallelism();
  const workers = [...Array(availableParallelism).keys()].map((i) =>
    createWorker(i)
  );

  workers.forEach((worker) => {
    worker.on("message", (msg) => {
      if ("type" in msg) {
        handleWorkerMessage(msg, worker);
      }
      // console.log(`worker ${worker.id} got a message ${msg}`);
    });
  });

  // cluster.on("fork", (worker) => console.log(`worker ${worker.id} is online`));

  // cluster.on("listening", (worker, address) => {
  //   console.log(`worker ${worker.id} connected to ${JSON.stringify(address)}`);
  // });

  // cluster.on("disconnect", (worker) => {
  //   console.log(`worker ${worker.id} has disconnected`);
  // });

  cluster.on("exit", (worker) => {
    console.log("worker has been killed", worker.process.pid);
    cluster.fork();
  });
}

startCluster();
