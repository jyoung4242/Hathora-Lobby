import "./style.css";
import { HathoraClient } from "@hathora/client-sdk";
import { UI } from "@peasy-lib/peasy-ui";
import queryString from "query-string";

const parsed = queryString.parse(location.search);
console.log(parsed);

const APP_ID = "449687c3";
//LOCALHOST
//const connectionInfo = { host: "localhost", port: 9000, transportType: "tcp" as const };
const connectionInfo = undefined; //cloud
const client = new HathoraClient(APP_ID, connectionInfo);
console.log(client);

const token = await client.loginAnonymous();

console.log(token);

let roomId: any;
if (parsed.init) {
  roomId = await client.createPublicLobby(token);
  console.log("new room: ", roomId);
} else {
  roomId = "132nqoiabao7x"; //"zifdbv8t5igc"; // GENERAL PURPOSE LOBBY
}

let connection = await client.newConnection(roomId); //connect(token, roomId, onMessage, onError);

console.log(connection);
const getJSONmsg = (msg: any) => {
  console.log("json msg:", msg);
  if (msg.type == "USERLIST") {
    model.users = [];
    model.users = [...msg.users];
    console.log(...msg.users);
  }
};

const onClose = (e: any) => {
  console.error("connection closed", e);
};

connection.onClose(onClose);
connection.onMessageJson(getJSONmsg);

await connection.connect(token);
console.log("Connected to server");
connection.writeJson({ type: "STATUS", msg: "Hello Hathora" });

//establish UI
const template = `
<div class="App">

  <div class="App_Header"> <span>LOBBY TEST</span><span> Username: \${myUserName}</span><span>Room: \${getRoom}</span></div>
  <div class="App_Controls">
    <div class="App_SubControls">
      <button class="button" \${click@=>joinPrivate}>JOIN PRIVATE LOBBY</button>
      <button class="button" \${click@=>newPublic}>CREATE NEW PUBLIC LOBBY</button>
      <button class="button" \${click@=>newPrivate}>CREATE NEW PRIVATE LOBBY</button>
      <button class="button" \${click@=>joinLobby} \${disabled<=>isDisabled}>GOTO LOBBY</button>
    </div>

    <div class="App_List">
        <div class="App_List_rel">
          <div class="App_List_header"> AVAILABLE LOBBYS <button \${click@=>refreshLobbies}>refresh</button></div>
          <div class="App_List_area">
            <div class="entry" \${entry<=*lobbies}>
              <div>\${entry.roomData.roomId}</div>
              <button id="button_\${entry.$index}" data-room="\${entry.roomData.roomId}" \${click@=>entry.join}>Join</button>
            </div>
          </div>
        </div>
    </div>
  </div>
  
  <div class="Lobby_Users">
    Users
    <div style="overflow: auto;">
      <div class="users" \${user<=*users}>\${user}</div> 
    </div>
  </div>
 </div>`;

const model = {
  get getRoom() {
    if (roomId == "132nqoiabao7x") {
      return "LOBBY";
    } else return roomId;
  },
  myUserName: "",
  get isDisabled() {
    return roomId == "132nqoiabao7x";
  },
  joinPrivate: () => {
    const rslt = prompt("Enter room ID");
    if (rslt) {
      switchRoom(rslt);
      refreshLobbies();
    }
  },
  joinLobby: () => {
    switchRoom("132nqoiabao7x");
    refreshLobbies();
  },
  lobbies: <any>[],
  newPublic: async () => {
    const newroom = await client.createPublicLobby(token);
    switchRoom(newroom);
    refreshLobbies();
  },
  newPrivate: async () => {
    const newroom = await client.createPublicLobby(token);
    switchRoom(newroom);
    refreshLobbies();
  },
  users: <any>[],
  refreshLobbies: async () => {
    refreshLobbies();
  },
};
model.myUserName = HathoraClient.getUserFromToken(token).id;
UI.create(document.body, template, model);
UI.initialize(1000 / 60);

const refreshLobbies = async () => {
  model.lobbies = [];
  let rslt = await client.getPublicLobbies(token);
  rslt = rslt.filter(r => r.roomId != "132nqoiabao7x");
  console.log(rslt);

  rslt.forEach(rm => {
    model.lobbies.push({
      roomData: rm,
      join: async () => {
        await switchRoom(rm.roomId);
      },
    });
  });
};

refreshLobbies();
console.log("lobbies: ", model.lobbies);

const switchRoom = async (newRoom: string) => {
  await connection.disconnect();
  connection = await client.newConnection(newRoom);
  connection.connect(token);
  connection.onClose(onClose);
  connection.onMessageJson(getJSONmsg);
  roomId = newRoom;
};
