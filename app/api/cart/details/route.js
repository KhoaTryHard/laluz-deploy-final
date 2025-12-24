// app/api/cart/details/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { productIds } = await request.json(); // Nhận mảng [1, 2, 3...]

    if (!productIds || productIds.length === 0) {
      return NextResponse.json([]);
    }

    // Tạo các dấu ? cho câu lệnh SQL: (?, ?, ?)
    const placeholders = productIds.map(() => "?").join(",");
    
    const sql = `
      SELECT 
        p.product_id, p.name, p.price, p.slug, p.stock_quantity, p.volume_ml, 
        pi.image_url 
      FROM PRODUCTS p
      LEFT JOIN PRODUCT_IMAGES pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      WHERE p.product_id IN (${placeholders})
    `;

    const products = await query({
      query: sql,
      values: productIds,
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}