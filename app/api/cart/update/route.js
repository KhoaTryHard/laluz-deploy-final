import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

export async function POST(request) {
  try {
    // 1. Check Auth
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 2. Lấy dữ liệu
    const body = await request.json();
    const { product_id, quantity } = body;
    const newQty = Number(quantity);
    
    // Hỗ trợ cả item.id và item.product_id
    const pId = Number(product_id); 

    if (newQty < 1) return NextResponse.json({ message: "Số lượng không hợp lệ" }, { status: 400 });

    // 3. Lấy Cart ID
    const carts = await query({
        query: "SELECT cart_id FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1",
        values: [userId]
    });
    if (carts.length === 0) return NextResponse.json({ message: "Giỏ hàng không tồn tại" }, { status: 404 });
    const cartId = carts[0].cart_id;

    // 4. KIỂM TRA TỒN KHO
    const products = await query({
        query: "SELECT stock_quantity FROM products WHERE product_id = ?",
        values: [pId]
    });
    
    if (products.length === 0) return NextResponse.json({ message: "Sản phẩm không tồn tại" }, { status: 404 });
    
    const stock = products[0].stock_quantity;
    if (newQty > stock) {
        return NextResponse.json({ 
            message: `Kho chỉ còn ${stock} sản phẩm`, 
            maxStock: stock 
        }, { status: 400 });
    }

    // 5. Cập nhật số lượng
    await query({
        query: "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
        values: [newQty, cartId, pId]
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update Cart Error:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}