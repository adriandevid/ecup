import { query, queryOne } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const rows = await query<any>(
        'SELECT * FROM messages;'
    );

    for (const item of rows) {
        item.user = await queryOne<any>(`SELECT photo_url, name FROM users WHERE id = ${item.user_id};`);
    }

    return NextResponse.json(rows);
}