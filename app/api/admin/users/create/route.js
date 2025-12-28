import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password, full_name, phone_number } = await req.json();

  if (!email || !password) {
    return new Response("Thiếu email hoặc mật khẩu", { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    await query({
      query: `
        INSERT INTO users (email, password_hash, full_name, phone_number, role)
        VALUES (?, ?, ?, ?, 'admin')
      `,
      values: [email, hashed, full_name || null, phone_number || null],
    });

    return Response.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return new Response("Email đã tồn tại", { status: 409 });
    }

    return new Response("Lỗi tạo admin", { status: 500 });
  }
}
