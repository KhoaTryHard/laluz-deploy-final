import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123"; // Đảm bảo trùng với secret key lúc đăng nhập

export async function POST(request) {
  try {
    // 1. KIỂM TRA ĐĂNG NHẬP
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });
    }

    // 2. LẤY DỮ LIỆU TỪ CLIENT GỬI LÊN
    const body = await request.json();
    const { product_id, quantity } = body;

    // Đảm bảo dữ liệu hợp lệ
    // Hỗ trợ cả trường hợp client gửi lên id hoặc product_id
    const pId = Number(product_id || body.id);
    const qty = Number(quantity);

    if (!pId || !qty) {
        return NextResponse.json({ message: "Dữ liệu sản phẩm không hợp lệ" }, { status: 400 });
    }

    // 3. TÌM GIỎ HÀNG (CART) CỦA USER ĐANG ACTIVE
    // Logic: Một user chỉ nên có 1 giỏ hàng trạng thái 'active'
    const cartRes = await query({
        query: `SELECT cart_id FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1`,
        values: [userId]
    });

    let cartId;

    // 4. NẾU CHƯA CÓ GIỎ HÀNG -> TẠO MỚI
    if (cartRes.length === 0) {
        const newCart = await query({
            query: `INSERT INTO carts (user_id, status, created_at) VALUES (?, 'active', NOW())`,
            values: [userId]
        });
        cartId = newCart.insertId;
    } else {
        cartId = cartRes[0].cart_id;
    }

    // 5. THÊM SẢN PHẨM VÀO GIỎ (cart_items)
    
    // 5a. Kiểm tra xem sản phẩm này đã có trong giỏ chưa
    const existingItem = await query({
        query: `SELECT item_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        values: [cartId, pId]
    });

    if (existingItem.length > 0) {
        // TRƯỜNG HỢP 1: Đã có -> Cập nhật số lượng (Cộng dồn)
        await query({
            query: `UPDATE cart_items SET quantity = quantity + ? WHERE item_id = ?`,
            values: [qty, existingItem[0].item_id]
        });
    } else {
        // TRƯỜNG HỢP 2: Chưa có -> Thêm dòng mới
        await query({
            query: `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
            values: [cartId, pId, qty]
        });
    }

    return NextResponse.json({ success: true, message: "Đã thêm vào giỏ hàng" });

  } catch (error) {
    console.error("Lỗi API Add Cart:", error);
    return NextResponse.json({ message: "Lỗi Server: " + error.message }, { status: 500 });
  }
}