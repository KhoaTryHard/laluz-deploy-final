import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

export async function POST(request) {
  try {
    // 1. Kiểm tra Auth
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch {
        userId = null; // guest
      }
    }

    // 2. Lấy dữ liệu từ Frontend
    const body = await request.json();
    const { items, customerInfo, coupon_code } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Giỏ hàng trống" }, { status: 400 });
    }

    // 3. TÍNH TOÁN TỔNG TIỀN GỐC & KIỂM TRA TỒN KHO
    const productIds = items.map((item) => item.product_id);
    // Tạo chuỗi dấu chấm hỏi cho SQL IN clause (VD: ?,?,?)
    const placeholders = productIds.map(() => "?").join(",");

    // Lấy thông tin sản phẩm và NOTE HƯƠNG (để lưu preference)
    const productsDb = await query({
      query: `
        SELECT p.product_id, p.price, p.stock_quantity, p.name, pn.note_id
        FROM products p
        LEFT JOIN product_notes pn ON p.product_id = pn.product_id
        WHERE p.product_id IN (${placeholders})
      `,
      values: productIds,
    });

    // Gom nhóm sản phẩm
    const uniqueProducts = {};
    const productNotes = [];

    productsDb.forEach((row) => {
      if (!uniqueProducts[row.product_id]) {
        uniqueProducts[row.product_id] = {
          price: Number(row.price),
          stock: row.stock_quantity,
          name: row.name,
        };
      }
      if (row.note_id) productNotes.push(row.note_id);
    });

    let subTotal = 0;
    const finalItems = [];

    for (const item of items) {
      const dbProduct = uniqueProducts[item.product_id];

      // Check sản phẩm tồn tại
      if (!dbProduct) {
        return NextResponse.json(
          { message: `Sản phẩm ID ${item.product_id} không tồn tại` },
          { status: 400 }
        );
      }

      const quantity = Number(item.quantity);

      // --- BỔ SUNG: CHECK TỒN KHO ---
      if (dbProduct.stock < quantity) {
        return NextResponse.json(
          {
            message: `Sản phẩm "${dbProduct.name}" không đủ số lượng tồn kho (Còn: ${dbProduct.stock})`,
          },
          { status: 400 }
        );
      }

      subTotal += dbProduct.price * quantity;

      finalItems.push({
        product_id: item.product_id,
        quantity: quantity,
        price: dbProduct.price,
      });
    }

    // 4. TÍNH GIẢM GIÁ (COUPON) - ĐÃ SỬA LỖI SQL
    let discountAmount = 0;
    let couponId = null;

    if (coupon_code) {
      // FIX 1: Bỏ "AND is_active = 1" vì bảng coupons không có cột này.
      // FIX 2: Thêm điều kiện check ngày start_date và end_date chuẩn xác hơn.
      const coupons = await query({
        query: `
            SELECT * FROM coupons 
            WHERE code = ? 
            AND (usage_limit > 0) 
            AND (end_date >= NOW() OR end_date IS NULL)
            AND (start_date <= NOW() OR start_date IS NULL)
        `,
        values: [coupon_code],
      });

      if (coupons.length > 0) {
        const cp = coupons[0];

        // FIX 3: Sửa tên biến 'min_order_value' thành 'min_order_amount' (theo DB)
        if (subTotal >= Number(cp.min_order_amount || 0)) {
          couponId = cp.coupon_id;

          if (cp.discount_type === "percent") {
            discountAmount = (subTotal * Number(cp.discount_value)) / 100;

            // FIX 4: Bỏ check 'max_discount_amount' vì DB không có cột này.
            // Nếu sau này bạn thêm cột đó vào DB thì uncomment đoạn dưới:
            /*
             if (cp.max_discount_amount && discountAmount > Number(cp.max_discount_amount)) {
               discountAmount = Number(cp.max_discount_amount);
             }
             */
          } else {
            // Giảm giá cố định (fixed)
            discountAmount = Number(cp.discount_value);
          }

          // Trừ lượt sử dụng coupon
          await query({
            query: `UPDATE coupons SET usage_limit = usage_limit - 1 WHERE coupon_id = ?`,
            values: [couponId],
          });
        }
      }
    }

    const finalTotal = Math.max(subTotal - discountAmount, 0);

    // 5. TẠO ĐƠN HÀNG
    const orderResult = await query({
      query: `
        INSERT INTO orders (user_id, total_amount, coupon_discount, status, created_at, note, shipping_address, phone_number)
        VALUES (?, ?, ?, 'pending', NOW(), ?, ?, ?)
      `,
      values: [
        userId,
        finalTotal,
        discountAmount,
        customerInfo.note || "",
        customerInfo.address,
        customerInfo.phone,
      ],
    });
    const newOrderId = orderResult.insertId;

    // 6. LƯU CHI TIẾT ĐƠN HÀNG & TRỪ TỒN KHO
    for (const item of finalItems) {
      // Lưu order_items
      await query({
        query: `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`,
        values: [newOrderId, item.product_id, item.quantity, item.price],
      });

      // --- BỔ SUNG: TRỪ TỒN KHO SẢN PHẨM ---
      await query({
        query: `UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?`,
        values: [item.quantity, item.product_id],
      });
    }

    // 7. TỰ ĐỘNG LƯU ĐỊA CHỈ (Logic cũ giữ nguyên)
    const existingAddress = await query({
      query: `SELECT address_id FROM user_addresses WHERE user_id = ? LIMIT 1`,
      values: [userId],
    });

    if (userId && existingAddress.length === 0) {
      await query({
        query: `INSERT INTO user_addresses (user_id, recipient_name, phone_number, address_line, is_default) VALUES (?, ?, ?, ?, 1)`,
        values: [
          userId,
          customerInfo.fullName,
          customerInfo.phone,
          customerInfo.address,
        ],
      });
    }

    // 8. CẬP NHẬT SỞ THÍCH MÙI HƯƠNG (Logic cũ giữ nguyên)
    if (userId && productNotes.length > 0) {
      const uniqueNotes = [...new Set(productNotes)];
      for (const noteId of uniqueNotes) {
        await query({
          query: `
                    INSERT INTO user_scent_preferences (user_id, note_id, preference_level) 
                    VALUES (?, ?, 1) 
                    ON DUPLICATE KEY UPDATE preference_level = preference_level + 1
                `,
          values: [userId, noteId],
        });
      }
    }

    return NextResponse.json({
      message: "Đặt hàng thành công",
      orderId: newOrderId,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { message: "Lỗi Server: " + error.message },
      { status: 500 }
    );
  }
}
