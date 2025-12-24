import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

export async function POST(request) {
  try {
    const { couponCode, totalAmount } = await request.json();

    // 1. Xác thực user
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 2. Tìm coupon trong DB
    const coupons = await query({
      query: "SELECT * FROM coupons WHERE code = ? AND end_date >= NOW()",
      values: [couponCode]
    });

    if (coupons.length === 0) {
      return NextResponse.json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    const coupon = coupons[0];

    // 3. Kiểm tra điều kiện đơn hàng tối thiểu
    if (totalAmount < coupon.min_order_amount) {
      return NextResponse.json({ 
        message: `Đơn hàng phải từ ${new Intl.NumberFormat('vi-VN').format(coupon.min_order_amount)}đ để dùng mã này` 
      }, { status: 400 });
    }

    // 4. Lưu coupon_id vào giỏ hàng của user
    await query({
      query: "UPDATE carts SET coupon_id = ? WHERE user_id = ?",
      values: [coupon.coupon_id, userId]
    });

    return NextResponse.json({ 
      message: "Áp dụng mã thành công", 
      discount: {
        type: coupon.discount_type,
        value: coupon.discount_value,
        code: coupon.code
      }
    });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}