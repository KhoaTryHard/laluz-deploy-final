import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mã bí mật để ký tên vào Token (Nên lưu trong file .env, ở đây mình để tạm string)
const JWT_SECRET = "laluz-secret-key-123";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Kiểm tra input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập Email và Mật khẩu" },
        { status: 400 }
      );
    }

    // 2. Tìm user trong Database
    const users = await query({
      query:
        "SELECT user_id, email, password_hash, full_name, role FROM users WHERE email = ?",
      values: [email],
    });

    if (users.length === 0) {
      return NextResponse.json(
        { message: "Email không tồn tại" },
        { status: 401 }
      );
    }

    const user = users[0];

    // 3. So sánh mật khẩu (Input vs Hash trong DB)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: "Sai mật khẩu" }, { status: 401 });
    }

    // 4. Tạo Token (Vé đăng nhập) chứa ID user
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Trả về kết quả và Set Cookie
    const response = NextResponse.json({
      message: "Đăng nhập thành công",
      user: {
        user_id: user.user_id, // ✅ BẮT BUỘC
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

    // Lưu token vào Cookie (HttpOnly để bảo mật, JS không đọc được)
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true, // Quan trọng: Chặn hacker lấy trộm cookie bằng JS
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return response;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}
