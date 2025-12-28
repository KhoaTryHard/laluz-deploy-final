import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 

export async function POST(request) {
  try {
    const { code, orderTotal } = await request.json();

    // 1. Kiểm tra đầu vào
    if (!code) {
      return NextResponse.json(
        { message: 'Vui lòng nhập mã giảm giá' }, 
        { status: 400 }
      );
    }

    // 2. Query tìm coupon (SỬA LẠI: Dùng hàm query của bạn)
    const sql = 'SELECT * FROM coupons WHERE code = ? LIMIT 1';
    const rows = await query({ query: sql, values: [code] });
    
    // Vì hàm query của bạn trả về thẳng results (mảng), nên ta lấy phần tử đầu tiên
    const coupon = rows[0];

    // 3. Kiểm tra: Mã có tồn tại không?
    if (!coupon) {
      return NextResponse.json(
        { message: 'Mã giảm giá không tồn tại' }, 
        { status: 404 }
      );
    }

    const now = new Date();
    const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

    // 4. Kiểm tra: Ngày bắt đầu
    if (startDate && now < startDate) {
      return NextResponse.json(
        { message: 'Mã giảm giá chưa đến đợt áp dụng' }, 
        { status: 400 }
      );
    }

    // 5. Kiểm tra: Ngày hết hạn
    if (endDate && now > endDate) {
      return NextResponse.json(
        { message: 'Mã giảm giá đã hết hạn' }, 
        { status: 400 }
      );
    }

    // 6. Kiểm tra: Giá trị đơn hàng tối thiểu
    if (Number(orderTotal) < Number(coupon.min_order_amount)) {
        const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        return NextResponse.json(
          { message: `Đơn hàng phải từ ${formatter.format(coupon.min_order_amount)} mới được dùng mã này` }, 
          { status: 400 }
        );
    }

    // 7. Thành công -> Trả về JSON
    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_order_amount: Number(coupon.min_order_amount)
      }
    });

  } catch (error) {
    console.error('Lỗi API Coupon:', error);
    return NextResponse.json(
      { message: 'Lỗi server: ' + error.message }, 
      { status: 500 }
    );
  }
}