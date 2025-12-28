import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123"; // Đảm bảo khớp với file login

export async function GET() {
  try {
    // 1. Xác thực người dùng qua Token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });
    }

    // 2. Truy vấn SQL lấy danh sách đơn hàng
    // Sắp xếp đơn mới nhất lên đầu
    const sql = `
      SELECT order_id, total_amount, status, created_at 
      FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;

    const orders = await query({
      query: sql,
      values: [userId],
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}