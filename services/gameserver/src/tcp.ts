import net, { Socket } from "net";
import { GS_TCP_HOST, GS_TCP_PORT } from "./settings";

const server = net.createServer();

interface SocketInfo {
  id: number;
  remoteAddress?: string;
  remotePort?: number;
  level: string;
  region: string;
}

const sockets = [] as Socket[];
const socketInfos = [] as SocketInfo[];

let socketCounter = 1;
server.on("connection", socket => {
  socket.setEncoding("utf8");
  console.info(`Connected: ${socket.remoteAddress}:${socket.remotePort}`);
  sockets.push(socket);
  const socketInfo = {
    id: socketCounter,
    remoteAddress: socket.remoteAddress,
    remotePort: socket.remotePort,
    level: "",
    region: ""
  };
  socketInfos.push(socketInfo);
  socketCounter += 1;

  const sendMessage = (msg: string) => {
    console.info(`<< ${socket.remoteAddress}:${socket.remotePort} << [${msg}]`);
    socket.write(msg + "\n");
  };

  sendMessage("info:");

  // let infoCounter = 0
  // const randomPing = () => {
  //   infoCounter += 1
  //   console.info(`Sending Ping ${infoCounter}`)
  //   if (!socket.destroyed) {
  //       socket.write(`ping:${infoCounter}|`)
  //       setTimeout(randomPing, 2000 + Math.random() * 3000)
  //   }
  // }
  // randomPing();

  socket.on("data", data => {
    const messages = data
      .toString()
      .split(/\r\n|\r|\n/g)
      .slice(0, -1);

    for (const msg of messages) {
      if (!msg) continue;

      console.info(
        `>> ${socket.remoteAddress}:${socket.remotePort} >> [${msg}]`
      );

      if (msg === "ping") {
        sendMessage("pong");
        continue;
      }

      const [header, ...payloadList] = msg.split(":");
      const payload = payloadList.join();

      switch (header) {
        case "dmxl":
          const [session, player] = payload.split(";");
          console.info(`Login session/player ${session}/${player}`);
          let index = 0;
          for (const socketInfo of socketInfos) {
            const isEngineServer = !!socketInfo.level && !!socketInfo.region;
            if (isEngineServer) {
              const socket = sockets[index];
              if (socket) {
                const msg = `tvs:${session};${session};${player};${player}`;
                console.info("Messaging GameEngine Server:", msg);
                sendMessage(msg);
              }
            }
            index += 1;
          }
          break;
        case "info":
          const [level, region] = payload.split(";");
          console.info(`Updating socket level: ${level} / region: ${region}`);
          socketInfo.level = level;
          socketInfo.region = region;
          sendMessage("ok");
          break;
        case "db":
          const [account, memo, batch] = payload.split("|");
          if (account && memo && batch) {
            // TODO: Implement Blockchain Transaction
            sendMessage("OK");
          } else {
            sendMessage("FAIL:Missing Account, Memo and Batch");
          }
          break;
        case "vtk":
          const [token] = payload.split(";");
          console.info(`Received token ${token.substring(0, 6)}...`);
          // TODO: validate real token
          if (token === "leordev") {
            const account = "leordev";
            const playerName = "Leo";
            sendMessage(`tvs:${token};newtoken?;${account};${playerName}`);
          } else {
            sendMessage(`tvf:${token}`);
          }

          break;
        default:
          sendMessage(`unknown`);
      }
    }
  });

  socket.on("close", data => {
    const index = sockets.findIndex(s => s === socket);
    if (index !== -1) sockets.splice(index, 1);
    const infoIndex = socketInfos.findIndex(
      s =>
        s.remoteAddress === socket.remoteAddress &&
        s.remotePort === socket.remotePort
    );
    if (infoIndex !== -1) sockets.splice(index, 1);
    console.info(
      `Closed Connection: ${socket.remoteAddress}:${
        socket.remotePort
      } >> ${data}`
    );
  });

  socket.on("error", err => {
    console.error(
      `Socket Error >> ${socket.remoteAddress}:${socket.remotePort} >> ${err}`
    );
  });
});

server.listen(GS_TCP_PORT, GS_TCP_HOST);
console.info(`GameServer TCP Listening @ ${GS_TCP_HOST}:${GS_TCP_PORT}`);
