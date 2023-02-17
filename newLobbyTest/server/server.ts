import { Application, RoomId, startServer, UserId, verifyJwt } from "@hathora/server-sdk";

import * as dotenv from "dotenv";

dotenv.config();

type RoomData = Record<string, string[]>;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
const LOBBY = process.env.LOBBY as string;
let roomMap: RoomData = { [LOBBY]: [] };

const app: Application = {
  verifyToken: (token: string): UserId | undefined => {
    return verifyJwt(token, process.env.APP_SECRET as string);
  },
  subscribeUser: (roomId: RoomId, userId: UserId): void => {
    console.log("subscribeUser", roomId, userId);
    if (!roomMap[roomId]) {
      roomMap[roomId] = [];
    }
    roomMap[roomId].push(userId);
    console.log("roommap", roomMap);
    server.broadcastMessage(
      roomId,
      encoder.encode(
        JSON.stringify({
          type: "USERLIST",
          roomID: roomId,
          users: [...roomMap[roomId]],
        })
      )
    );
  },
  unsubscribeUser: (roomId: RoomId, userId: UserId): void => {
    console.log("unsubscribeUser", roomId, userId);

    const userIndex = roomMap[roomId].findIndex(i => i == userId);
    roomMap[roomId].splice(userIndex, 1);
    console.log("roommap", roomMap);

    const users = {
      [roomId]: [...roomMap[roomId]],
    };
    server.broadcastMessage(
      roomId,
      encoder.encode(
        JSON.stringify({
          type: "USERLIST",
          roomID: roomId,
          users: [...roomMap[roomId]],
        })
      )
    );
  },

  onMessage: (roomId: RoomId, userId: UserId, data: ArrayBuffer): void => {
    const msg = JSON.parse(decoder.decode(data));
    console.log(msg);
    server.sendMessage(
      roomId,
      userId,
      encoder.encode(
        JSON.stringify({
          type: "SERVERMESSAGE",
          msg: "HELLO FROM SERVER",
        })
      )
    );
  },
};

const port = 9000;
const server = await startServer(app, port);

console.log(`Hathora Server listening on port ${port}`);
