import { Application, RoomId, startServer, UserId, verifyJwt } from "@hathora/server-sdk";

import * as dotenv from "dotenv";
dotenv.config();

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

const app: Application = {
  verifyToken: (token: string): UserId | undefined => {
    return verifyJwt(token, process.env.APP_SECRET as string);
  },
  subscribeUser: (roomId: RoomId, userId: UserId): void => {
    console.log("subscribeUser", roomId, userId);
  },
  unsubscribeUser: (roomId: RoomId, userId: UserId): void => {
    console.log("unsubscribeUser", roomId, userId);
  },
  onMessage: (roomId: RoomId, userId: UserId, data: ArrayBuffer): void => {
    server.sendMessage(roomId, userId, data);
    console.log(decoder.decode(data));
  },
};

const port = 9000;
const server = await startServer(app, port);
console.log(`Hathora Server listening on port ${port}`);
