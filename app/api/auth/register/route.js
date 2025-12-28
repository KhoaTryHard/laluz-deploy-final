// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body; // Chỉ nhận email và password

    // 1. Validate dữ liệu
    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập email và mật khẩu!" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra email trùng
    const checkUser = await query({
      query: "SELECT user_id FROM users WHERE email = ?",
      values: [email],
    });

    if (checkUser.length > 0) {
      return NextResponse.json(
        { message: "Email này đã được đăng ký!" },
        { status: 409 }
      );
    }

    // 3. LOGIC MỚI: Tự động lấy tên từ email
    // Ví dụ: email là "hieuvm@gmail.com" -> fullName là "hieuvm"
    const derivedName = email.split('@')[0];

    // 4. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Insert vào Database
    // Lưu ý: phone_number để NULL hoặc rỗng vì form không nhập
    const sql = `
      INSERT INTO users (email, password_hash, full_name, phone_number, role, created_at)
      VALUES (?, ?, ?, NULL, 'customer', NOW())
    `;

    await query({
      query: sql,
      values: [email, passwordHash, derivedName],
    });

    return NextResponse.json(
      { message: "Đăng ký thành công!", username: derivedName },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Lỗi server, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}