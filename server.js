const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const app = next({ dev:  process.env.NODE_ENV !== "production" });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", async (socket) => {
        socket.on(`send-message`, (message) => {
            io.emit(`send-message`, message)
        });

        socket.on("all-messages", (message) => {
            io.emit("all-messages", message)
        })
    });

    httpServer.listen(3000);
});