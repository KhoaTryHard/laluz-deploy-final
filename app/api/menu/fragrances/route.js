import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const FALLBACK = ["Floral", "Floral Fruity", "Woody"]; // menu không rỗng

export async function GET() {
  try {
    const rows = await query({
      query: `
        SELECT DISTINCT family
        FROM notes
        WHERE family IS NOT NULL
          AND family <> ''
          AND family <> 'Unknown'
        ORDER BY family ASC
      `,
      values: [],
    });

    const list = rows.map((r) => r.family).filter(Boolean);
    return NextResponse.json(list.length ? list : FALLBACK);
  } catch (e) {
    console.error("API /fragrances error:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
