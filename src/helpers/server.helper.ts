import { DefaultServerService } from "@/server/default-server.service";
import { DatabaseService } from "@/db/database.service";
import { LoadBalancerService } from "@/server/load-balancer.service";

export const createLoadBalancerServer = (
  workerPorts: number[]
): LoadBalancerService => {
  return new LoadBalancerService(workerPorts);
};
export const createDefaultServer = (
  dbService: DatabaseService
): DefaultServerService => {
  return new DefaultServerService(dbService);
};
