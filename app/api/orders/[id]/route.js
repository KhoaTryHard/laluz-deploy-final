import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

// Trong Next.js 15/16: tham số thứ 2 không nên destructuring ngay mà đặt tên là props
export async function GET(request, props) {
  try {
    // 👇 QUAN TRỌNG: Phải await params trước khi dùng
    const params = await props.params; 
    const orderId = params.id;

    // Kiểm tra nếu orderId vẫn lỗi
    if (!orderId) {
      return NextResponse.json({ message: "Thiếu Order ID" }, { status: 400 });
    }

    // 1. Xác thực người dùng
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
      return NextResponse.json({ message: "Token lỗi" }, { status: 401 });
    }

    // Kiểm tra kỹ userId trước khi gọi SQL để tránh lỗi "Bind parameters..."
    if (!userId) {
       return NextResponse.json({ message: "Không tìm thấy User ID trong token" }, { status: 403 });
    }

    // 2. Lấy thông tin đơn hàng
    const orderSql = `
      SELECT order_id, total_amount, status, created_at 
      FROM orders 
      WHERE order_id = ? AND user_id = ?
    `;
    
    // Gọi SQL: Lúc này orderId và userId chắc chắn đã có giá trị
    const orders = await query({
      query: orderSql,
      values: [orderId, userId],
    });

    if (orders.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // 3. Lấy sản phẩm trong đơn
    const itemsSql = `
      SELECT 
        oi.quantity, 
        oi.price_at_purchase,
        p.product_id, 
        p.name, 
        p.slug, 
        pi.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      WHERE oi.order_id = ?
    `;

    const items = await query({
      query: itemsSql,
      values: [orderId],
    });

    return NextResponse.json({
      orderInfo: orders[0],
      items: items
    });

  } catch (error) {
    console.error("Lỗi chi tiết:", error); // Log ra terminal để dễ debug
    return NextResponse.json({ message: error.message || "Lỗi Server" }, { status: 500 });
  }
}