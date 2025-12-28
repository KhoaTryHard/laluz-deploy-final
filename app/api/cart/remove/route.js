import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123"; // Đảm bảo trùng với key lúc login

export async function POST(request) {
  try {
    // 1. KIỂM TRA ĐĂNG NHẬP
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });
    }

    // 2. LẤY ID SẢN PHẨM CẦN XÓA
    const body = await request.json();
    // Hỗ trợ nhận cả 'product_id' hoặc 'id' để tránh lỗi frontend gửi sai tên
    const product_id = body.product_id || body.id;

    if (!product_id) {
      return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    // 3. TÌM GIỎ HÀNG ACTIVE CỦA USER
    const carts = await query({
      query: "SELECT cart_id FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1",
      values: [userId]
    });

    if (carts.length === 0) {
      return NextResponse.json({ message: "Giỏ hàng không tồn tại" }, { status: 404 });
    }

    const cartId = carts[0].cart_id;

    // 4. THỰC HIỆN XÓA TRONG DB
    await query({
      query: "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      values: [cartId, product_id]
    });

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });

  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    return NextResponse.json({ message: "Lỗi Server: " + error.message }, { status: 500 });
  }
}