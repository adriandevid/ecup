import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sql } = await req.json();

    if (!sql?.trim()) {
      return NextResponse.json({ error: 'Query vazia' }, { status: 400 });
    }

    const normalized = sql.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
      return NextResponse.json(
        { error: 'Apenas consultas SELECT/WITH são permitidas no console por segurança.' },
        { status: 403 }
      );
    }

    const rows = await query(sql);
    const columns = rows.length > 0 ? Object.keys(rows[0] as object) : [];
    return NextResponse.json({ columns, rows });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
