// app/api/admin/login/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // [DEBUG]
    console.log("-----------------------------------");
    console.log("1. Client gửi Email:", email);
    console.log("2. Client gửi Password:", password);

    const users = await query({
      query: "SELECT * FROM users WHERE email = ?",
      values: [email],
    });

    console.log("3. Kết quả tìm trong DB:", users);

    if (users.length === 0) {
      return NextResponse.json({ message: 'Email không tồn tại' }, { status: 401 });
    }

    const user = users[0];
    
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Bạn không có quyền truy cập Admin' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return NextResponse.json({ message: 'Mật khẩu sai' }, { status: 401 });
    }

    const { password_hash, ...userWithoutPass } = user;
    
    return NextResponse.json({ 
      message: 'Đăng nhập thành công', 
      user: userWithoutPass 
    });

  } catch (error) {
    console.error("LỖI SERVER:", error);
    return NextResponse.json({ message: 'Lỗi server: ' + error.message }, { status: 500 });
  }
}