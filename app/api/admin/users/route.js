import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

/* =========================
   GET: lấy danh sách users
========================= */
export async function GET() {
  const users = await query({
    query: `
      SELECT
        user_id,
        email,
        full_name,
        phone_number,
        role,
        created_at,
        last_login
      FROM users
      ORDER BY created_at DESC
    `,
  });

  return Response.json(users);
}

/* =========================
   POST: tạo admin mới
========================= */
export async function POST(req) {
  try {
    const { email, password, full_name, phone_number } = await req.json();

    if (!email || !password) {
      return new Response("Thiếu email hoặc mật khẩu", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query({
      query: `
        INSERT INTO users (email, password_hash, full_name, phone_number, role)
        VALUES (?, ?, ?, ?, 'admin')
      `,
      values: [email, hashedPassword, full_name || null, phone_number || null],
    });

    return Response.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return new Response("Email đã tồn tại", { status: 409 });
    }

    console.error(err);
    return new Response("Lỗi tạo admin", { status: 500 });
  }
}
