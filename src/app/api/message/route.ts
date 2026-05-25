import { query, queryOne } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { io } from "socket.io-client";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const body = await req.json();
    const newSocket = io("http://localhost:3000");
    newSocket.emit("send-message", body);

    try {
        const payload = await verifyToken(token);

        const rows = await query<any>(
            'INSERT INTO messages (message, user_id) VALUES ($1, $2) RETURNING *',
            [body.message, payload.userId]
        );

        const messages = await query<any>(
            'SELECT * FROM messages;'
        );

        for (const item of rows) {
            item.user = await queryOne<any>(`SELECT photo_url, name FROM users WHERE id = ${item.user_id};`);
        }

        newSocket.emit("all-messages", messages);

        return NextResponse.json(rows[0]);
    } catch (ex) {
        return NextResponse.json({}, { status: 400 });
    }
}