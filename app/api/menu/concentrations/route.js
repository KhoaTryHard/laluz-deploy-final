import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query({
      query: `
        SELECT DISTINCT concentration
        FROM products
        WHERE concentration IS NOT NULL AND concentration != ''
        ORDER BY concentration
      `,
    });

    return Response.json(rows.map(r => r.concentration));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "DB error" }, { status: 500 });
  }
}
