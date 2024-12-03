import { ClientData, Message, TResponsePayload, TUser } from "@/models/types";
import { MessageCommands } from "@/models/enums";

async function sendMessageToPrimary(message: Message) {
  return new Promise((resolve, reject) => {
    if (process.send) {
      process.send(message);
      process.once("message", (msg: { data: TResponsePayload | TUser[] }) => {
        console.log("I got message from master", msg);
        resolve(msg.data);
        reject(new Error("failed to receive message from master"));
      });
    }
  });
}

export async function getDbInstance(): Promise<TUser[]> {
  console.log("in db instance request");
  return (await sendMessageToPrimary({
    type: MessageCommands.GET_MANY,
    message: "get db from primary"
  })) as Promise<TUser[]>;
}

export async function setItemToMasterDb(
  clientData: ClientData
): Promise<TResponsePayload> {
  return (await sendMessageToPrimary({
    type: MessageCommands.CREATE,
    message: "I need to set user in master db",
    data: { userData: clientData }
  })) as TResponsePayload;
}

export async function getItemById(itemId: string): Promise<TResponsePayload> {
  return (await sendMessageToPrimary({
    type: MessageCommands.GET_UNIQUE,
    message: "I need a user by id",
    data: { id: itemId }
  })) as TResponsePayload;
}

export async function deleteItemById(
  itemId: string
): Promise<TResponsePayload> {
  return (await sendMessageToPrimary({
    type: MessageCommands.DELETE,
    message: "I need delete user by id from db",
    data: { id: itemId }
  })) as TResponsePayload;
}

export async function updateItemById(
  itemId: string,
  userData: ClientData
): Promise<TResponsePayload> {
  return (await sendMessageToPrimary({
    type: MessageCommands.UPDATE,
    message: "I need a user by id",
    data: { id: itemId, userData }
  })) as TResponsePayload;
}
