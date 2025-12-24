import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = "laluz-secret-key-123"; // Đảm bảo giống file Login

export async function POST(request) {
  try {
    // 1. Kiểm tra đăng nhập
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
      return NextResponse.json({ message: "Token lỗi" }, { status: 401 });
    }

    // 2. Lấy dữ liệu từ Client
    const body = await request.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "Vui lòng nhập đủ thông tin" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Mật khẩu xác nhận không khớp" }, { status: 400 });
    }

    // 3. Lấy mật khẩu hiện tại trong DB để so sánh
    const users = await query({
      query: "SELECT password_hash FROM users WHERE user_id = ?",
      values: [userId],
    });

    if (users.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });
    }

    const currentHash = users[0].password_hash;
    const isMatch = await bcrypt.compare(oldPassword, currentHash);

    if (!isMatch) {
      return NextResponse.json({ message: "Mật khẩu cũ không chính xác!" }, { status: 400 });
    }

    // 4. Mã hóa mật khẩu mới và Cập nhật DB
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query({
      query: "UPDATE users SET password_hash = ? WHERE user_id = ?",
      values: [newHash, userId],
    });

    return NextResponse.json({ message: "Đổi mật khẩu thành công!" });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}