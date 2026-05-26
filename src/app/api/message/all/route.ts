import { query, queryOne } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const rows = await query(
        'SELECT * FROM messages;'
    );

    for (const item of rows) {
        item.user = await queryOne(`SELECT photo_url, name FROM users WHERE id = ${item.user_id};`);
    }

    return NextResponse.json(rows);
}