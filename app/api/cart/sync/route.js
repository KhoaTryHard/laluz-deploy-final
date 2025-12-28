import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

export async function POST(request) {
  try {
    // 1. Xác thực người dùng
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    let userId;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
    } catch (e) {
        return NextResponse.json({ message: "Token lỗi" }, { status: 401 });
    }

    // 2. Lấy dữ liệu từ localStorage gửi lên
    // Body mong đợi: { localItems: [{ product_id: 1, quantity: 2 }, ...] }
    const body = await request.json();
    const localItems = body.localItems || [];

    if (localItems.length === 0) {
        return NextResponse.json({ message: "Không có dữ liệu để đồng bộ" });
    }

    // 3. Tìm Giỏ hàng 'active' của User
    let carts = await query({ 
        query: "SELECT cart_id FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1", 
        values: [userId] 
    });
    
    let cartId;

    if (carts.length === 0) {
      // Nếu chưa có -> Tạo mới
      const result = await query({ 
          query: "INSERT INTO carts (user_id, status, created_at) VALUES (?, 'active', NOW())", 
          values: [userId] 
      });
      cartId = result.insertId;
    } else {
      cartId = carts[0].cart_id;
    }

    // 4. Trộn (Merge) sản phẩm
    for (const item of localItems) {
        const pId = item.product_id || item.id; // Hỗ trợ cả 2 tên trường
        const qty = Number(item.quantity) || 1;

        // Kiểm tra xem sản phẩm đã có trong DB chưa
        const existing = await query({
            query: "SELECT item_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
            values: [cartId, pId]
        });

        if (existing.length > 0) {
            // Nếu có rồi -> Cộng dồn số lượng
            // (Ví dụ: Trong DB có 1, Local có 2 -> Thành 3)
            await query({
                query: "UPDATE cart_items SET quantity = quantity + ? WHERE item_id = ?",
                values: [qty, existing[0].item_id]
            });
        } else {
            // Nếu chưa có -> Thêm mới
            await query({
                query: "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
                values: [cartId, pId, qty]
            });
        }
    }

    return NextResponse.json({ success: true, message: "Đồng bộ thành công" });

  } catch (error) {
    console.error("Sync Cart Error:", error);
    return NextResponse.json({ message: "Lỗi Server: " + error.message }, { status: 500 });
  }
}