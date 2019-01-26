import net, { Socket } from "net";

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

  socket.write("info:");

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
    console.info(
      `Data Received >> ${socket.remoteAddress}:${socket.remotePort} >> ${data}`
    );

    const messages = data.toString().split("|");

    for (const msg of messages) {
      const [header, payload] = msg.split(":");
      switch (header) {
        case "info":
          const [level, region] = payload.split(";");
          console.info(`Updating socket level: ${level} / region: ${region}`);
          socketInfo.level = level;
          socketInfo.region = region;
          break;
        case "vtk":
          const [token] = payload.split(";");
          console.info(`Received token ${token.substring(0, 6)}...`);
          // TODO: validate real token
          if (token === "leordev") {
            const account = "leordev";
            const playerName = "Leo";
            socket.write(`tvs:${token};newtoken?;${account};${playerName}|`);
          } else {
            socket.write(`tvf:${token}|`);
          }

          break;
        default:
          console.warn(`Unknown message`);
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

const HOST = "127.0.0.1";
const PORT = 5095;
server.listen(PORT, HOST);
console.info(`TCP Listening @ ${HOST}:${PORT}`);