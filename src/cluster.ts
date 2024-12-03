import os from "os";
import cluster, { Worker } from "cluster";
import dotenv from "dotenv";
import { DatabaseService } from "./db/database.service";
import { Message, TUser } from "./models/types";
import { MessageCommands } from "@/models/enums";
import {
  createDefaultServer,
  createLoadBalancerServer
} from "@/helpers/server.helper";

dotenv.config();

const PORT = process.env.PORT || "3000";
const store: TUser[] = [];
const dbService = new DatabaseService(store);

async function startCluster() {
  if (cluster.isPrimary) {
    console.log(`is primary, primary pid: ${process.pid}`);
    const workerPorts = spawnWorkers();

    const loadBalancer = createLoadBalancerServer(workerPorts);
    loadBalancer.start(+PORT);
  } else {
    const server = createDefaultServer(dbService);
    server.start(PORT);
  }
}

function createWorker(id: number) {
  const WORKER_PORT = +PORT + 1 + id;
  cluster.schedulingPolicy = cluster.SCHED_RR;
  const worker = cluster.fork({ PORT: WORKER_PORT });
  worker.on("message", () => {});
  return { worker, WORKER_PORT };
}

function handleWorkerMessage(message: Message, worker: Worker) {
  console.log(
    `in master process ${process.pid} got message from worker ${worker.id}, message: ${JSON.stringify(message)}`
  );

  const { type, data } = message;

  switch (type) {
    case MessageCommands.CREATE:
      if (!data || !data.userData) throw new Error("500");
      worker.send({ data: dbService.createUser(data.userData) });
      break;
    case MessageCommands.GET_UNIQUE:
      if (!data || !data.id) throw new Error("500");
      worker.send({ data: dbService.getUserById(data.id) });
      break;
    case MessageCommands.DELETE:
      if (!data || !data.id) throw new Error("500");
      worker.send({ data: dbService.deleteUser(data.id) });
      break;
    case MessageCommands.UPDATE:
      if (!data || !data.id || !data.userData) throw new Error("500");
      worker.send({ data: dbService.updateUser(data.id, data.userData) });
      break;
    default:
      worker.send({ data: store });
  }
}

function spawnWorkers() {
  const availableParallelism = os.availableParallelism();
  const workerPorts: number[] = [];
  const workers = [...Array(availableParallelism).keys()].map((i) => {
    const { worker, WORKER_PORT } = createWorker(i);
    workerPorts.push(WORKER_PORT);
    return worker;
  });

  workers.forEach((worker) => {
    worker.on("message", (msg) => {
      if ("type" in msg) {
        handleWorkerMessage(msg, worker);
      }
    });
  });

  cluster.on("exit", (worker) => {
    console.log("worker has been killed", worker.process.pid);
    cluster.fork();
  });

  return workerPorts;
}

startCluster();
