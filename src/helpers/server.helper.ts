import { Server } from "@/server/Classes/Server";
import { DatabaseService } from "@/db/database.service";
import { LoadBalancerService } from "@/server/load-balancer.service";

export const createLoadBalancerServer = (workerPorts: number[]) => {
  return new LoadBalancerService(workerPorts);
};
export const createDefaultServer = (dbService: DatabaseService): Server => {
  return new Server(dbService);
};
