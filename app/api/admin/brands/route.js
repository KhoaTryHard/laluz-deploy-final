import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const brands = await query({
      query: "SELECT brand_id, name FROM brands ORDER BY name ASC",
    });
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json(
        { message: "Thiếu tên thương hiệu" },
        { status: 400 }
      );
    }

    // 1. Kiểm tra brand đã tồn tại chưa (tránh trùng)
    const existed = await query({
      query: "SELECT brand_id, name FROM brands WHERE LOWER(name) = LOWER(?)",
      values: [name],
    });

    if (existed.length > 0) {
      // Đã tồn tại → trả brand cũ
      return NextResponse.json(existed[0]);
    }

    // 2. Insert brand mới
    const result = await query({
      query: "INSERT INTO brands (name) VALUES (?)",
      values: [name],
    });

    return NextResponse.json({
      brand_id: result.insertId,
      name,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
