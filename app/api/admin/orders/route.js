import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const orders = await query({
      query: `
        SELECT 
          o.order_id,
          o.user_id,
          o.total_amount,
          o.coupon_discount,
          o.status,
          o.shipping_address,
          o.phone_number,
          o.created_at,
          u.email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
      `,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
