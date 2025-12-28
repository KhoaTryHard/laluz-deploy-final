import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = "laluz-secret-key-123";

// Helper: Hàm xác thực User từ Cookie
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    // Giải mã Token để lấy userId
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
}

// 1. GET: Lấy thông tin người dùng HIỆN TẠI
export async function GET() {
  try {
    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    // Query SQL bằng ID thật vừa lấy được
    const users = await query({
      query:
        "SELECT full_name, email, phone_number, date_of_birth, role FROM users WHERE user_id = ?",
      values: [userId],
    });

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Format ngày sinh
    let formattedDob = "";
    if (user.date_of_birth) {
      const date = new Date(user.date_of_birth);
      formattedDob = date.toISOString().split("T")[0];
    }

    return NextResponse.json({
      name: user.full_name,
      email: user.email,
      phone: user.phone_number,
      birthday: formattedDob,
      role: user.role,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. PUT: Cập nhật thông tin (Cũng dùng ID thật)
export async function PUT(request) {
  try {
    const userId = await getAuthenticatedUser();
    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, birthday } = body;

    await query({
      query: `
        UPDATE users 
        SET full_name = ?, phone_number = ?, date_of_birth = ? 
        WHERE user_id = ?
      `,
      values: [name, phone, birthday || null, userId],
    });

    return NextResponse.json({ message: "Cập nhật thành công!" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
