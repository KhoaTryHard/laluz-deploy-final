import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req, ctx) {
  const params = await ctx.params; // ✅ BẮT BUỘC
  const id = params.id;

  if (!id) {
    return NextResponse.json({ message: "Missing order id" }, { status: 400 });
  }

  try {
    const orders = await query({
      query: `
        SELECT o.*, u.email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        WHERE order_id = ?
        LIMIT 1
      `,
      values: [Number(id)],
    });

    if (orders.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const items = await query({
      query: `
        SELECT 
          oi.quantity,
          oi.price_at_purchase,
          p.name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `,
      values: [Number(id)],
    });

    return NextResponse.json({
      order: orders[0],
      items,
    });
  } catch (error) {
    console.error("ADMIN ORDER DETAIL ERROR:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, context) {
  const { id } = await context.params;

  const body = await req.json();
  const { status } = body;

  if (!id)
    return NextResponse.json({ message: "Missing order id" }, { status: 400 });
  if (!status)
    return NextResponse.json({ message: "Missing status" }, { status: 400 });

  await query({
    query: `UPDATE orders SET status = ? WHERE order_id = ?`,
    values: [status, Number(id)],
  });

  return NextResponse.json({ message: "Updated" });
}
