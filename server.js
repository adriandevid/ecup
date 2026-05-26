const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");
const { Pool } = require("pg");
const { jwtVerify } = require("jose");

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'futchamp-super-secret-key-change-in-production'
);

async function verifyToken(token) {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
}

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", async (socket) => {
        try {
            const accessToken = socket.handshake.query["token"];
            await verifyToken(accessToken);
        } catch(ex) {
            socket.disconnect();
        }

        socket.on(`send-message`, (message) => {
            io.emit(`send-message`, message);
        });

        socket.on("all-messages", async (msg) => {
            socket.emit("load-messages", "true");

            const message = JSON.parse(msg);
            const payload = await verifyToken(message.token);

            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 10,
            });

            const connection = await pool.connect();

            const insertOfMessageOperation = await connection.query(
                'INSERT INTO messages (message, user_id) VALUES ($1, $2) RETURNING *',
                [message.message, payload.userId]
            );

            try {
                var userQuery = await connection.query(`SELECT photo_url, name FROM users WHERE id = ${payload.userId};`);
                insertOfMessageOperation.rows[0].user = userQuery.rows[0];

                io.emit("all-messages", JSON.stringify(insertOfMessageOperation.rows[0]));

                socket.emit("load-messages", "false");
            } finally {
                connection.release();
            }
        });

        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });
    });

    httpServer.listen(3000);
});