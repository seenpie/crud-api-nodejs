import { ClientData, TResponsePayload, TUser } from "../../models/types";

type MessageType = "get" | "set";

type Message = {
  type: MessageType;
  message: string;
  data?: any;
};

async function sendMessageToPrimary(message: Message) {
  return new Promise((resolve, reject) => {
    if (process.send) {
      process.send(message);
      process.once("message", (msg: { data }) => {
        console.log("I got message from master", msg);
        resolve(msg.data);
        reject(new Error("failed to receive message from master"));
      });
    }
  });
}

export async function getDbInstance(): Promise<TUser[]> {
  return (await sendMessageToPrimary({
    type: "get",
    message: "get db from primary"
  })) as Promise<TUser[]>;
}

export async function setItemToMasterDb(
  clientData: ClientData
): Promise<TResponsePayload> {
  return (await sendMessageToPrimary({
    type: "set",
    message: "I need to set user in master db",
    data: clientData
  })) as TResponsePayload;
}
