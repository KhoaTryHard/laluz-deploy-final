import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query({
      query: `
        SELECT 
          b.brand_id,
          b.name,
          SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN brands b ON p.brand_id = b.brand_id
        GROUP BY b.brand_id, b.name
        ORDER BY total_sold DESC
        LIMIT 6
      `,
    });

    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "DB error" }),
      { status: 500 }
    );
  }
}
