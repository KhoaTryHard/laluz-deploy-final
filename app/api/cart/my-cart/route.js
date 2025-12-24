import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // Nếu không có token -> Trả về rỗng (để Frontend hiển thị giỏ hàng trống hoặc localStorage)
    if (!token) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    // 1. Lấy items (Chỉ lấy giỏ hàng đang 'active')
    const sql = `
      SELECT 
        ci.quantity, 
        p.product_id, p.product_id as id, 
        p.name, 
        p.slug,  -- <--- THÊM DÒNG NÀY ĐỂ LINK KHÔNG BỊ LỖI
        p.price, 
        pi.image_url,
        p.stock_quantity,
        p.volume_ml -- Thêm volume nếu cần hiển thị dung tích
      FROM carts c
      JOIN cart_items ci ON c.cart_id = ci.cart_id
      JOIN products p ON ci.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      WHERE c.user_id = ? AND c.status = 'active'
    `;
    const items = await query({ query: sql, values: [userId] });

    // Format lại dữ liệu cho giống với cấu trúc localStorage để Frontend dễ xử lý
    const formattedItems = items.map((item) => ({
      ...item,
      price: Number(item.price), // Đảm bảo giá là số
      image: item.image_url || "",
    }));

    // 2. Lấy coupon đang áp dụng (nếu có)
    const couponSql = `
      SELECT cp.code, cp.discount_type, cp.discount_value, cp.min_order_amount
      FROM carts c
      JOIN coupons cp ON c.coupon_id = cp.coupon_id
      WHERE c.user_id = ? AND c.status = 'active'
    `;
    const coupons = await query({ query: couponSql, values: [userId] });

    return NextResponse.json({
      items: formattedItems,
      coupon: coupons.length > 0 ? coupons[0] : null,
    });
  } catch (error) {
    console.error("My Cart Error:", error);
    return NextResponse.json({ items: [], coupon: null });
  }
}
