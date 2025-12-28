import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

export async function POST(request) {
  try {
    /* =========================
       1️⃣ LẤY BODY
    ========================== */
    const body = await request.json();
    const rawOrderId = body.order_id;

    // Ép kiểu order_id
    const orderId = Number(rawOrderId);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        { message: "Mã đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    /* =========================
       2️⃣ LẤY USER (KHÔNG BẮT BUỘC)
    ========================== */
    let userId = null;

    // Lấy user nếu có token
    try {
      const token = (await cookies()).get("auth_token")?.value;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      }
    } catch {
      userId = null;
    }

    /* =========================
       3️⃣ LẤY ĐƠN HÀNG
    ========================== */
    const orders = await query({
      query: `SELECT order_id, user_id, status FROM orders WHERE order_id = ?`,
      values: [orderId],
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    const order = orders[0];

    /* =========================
       4️⃣ KIỂM TRA ĐIỀU KIỆN HỦY
    ========================== */
    if (order.status !== "pending") {
      return NextResponse.json(
        { message: "Đơn hàng không thể hủy ở trạng thái hiện tại" },
        { status: 400 }
      );
    }

    // Nếu là user đăng nhập → chỉ được hủy đơn của mình
    if (userId && order.user_id && order.user_id !== userId) {
      return NextResponse.json(
        { message: "Bạn không có quyền hủy đơn hàng này" },
        { status: 403 }
      );
    }

    /* =========================
       5️⃣ CẬP NHẬT TRẠNG THÁI
    ========================== */
    const updateResult = await query({
      query: `
        UPDATE orders
        SET status = 'cancelled'
        WHERE order_id = ?
      `,
      values: [orderId],
    });

    // 🔑 KEY DEBUG
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { message: "Hủy đơn hàng thất bại (không có dòng nào được cập nhật)" },
        { status: 500 }
      );
    }

    /* =========================
       6️⃣ HOÀN LẠI TỒN KHO
    ========================== */
    const items = await query({
      query: `
        SELECT product_id, quantity
        FROM order_items
        WHERE order_id = ?
      `,
      values: [orderId],
    });

    for (const item of items) {
      await query({
        query: `
          UPDATE products
          SET stock_quantity = stock_quantity + ?
          WHERE product_id = ?
        `,
        values: [item.quantity, item.product_id],
      });
    }

    /* =========================
       7️⃣ RESPONSE
    ========================== */
    return NextResponse.json({
      message: "Hủy đơn hàng thành công",
    });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    return NextResponse.json(
      { message: "Lỗi server khi hủy đơn hàng" },
      { status: 500 }
    );
  }
}
