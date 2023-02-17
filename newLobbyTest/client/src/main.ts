import "./style.css";
import { HathoraClient } from "@hathora/client-sdk";

const serverOut = document.getElementById("server-out")!;
const txtAppId = document.getElementById("txt-app-id")!;
const outputPanel = document.querySelector(".output-panel")!;

const APP_ID = "285dcc97";
txtAppId.innerHTML = `Your app's unique ID is ${APP_ID}`;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const connectionInfo = { host: "localhost", port: 9000, transportType: "tcp" as const };
const client = new HathoraClient(APP_ID, connectionInfo);
const token = await client.loginAnonymous();
const roomId = await client.createPublicLobby(token); //create(token, new Uint8Array());
const connection = await client.newConnection(roomId); //connect(token, roomId, onMessage, onError);
connection.onMessage(onMessageString);
connection.onClose(e => {
  console.error("connection closed", e);
});

function onMessageString(msg: ArrayBuffer) {
  const msgStr = decoder.decode(msg);

  if (msgStr === "Hello Hathora!") {
    outputPanel.classList.add("connected");
    serverOut.innerHTML = `${msgStr}`;
  }
}

function onError(error: any) {
  console.error(error);
}

await connection.connect(token);
console.log("Connected to server");
connection.writeString("Hello Hathora!");
