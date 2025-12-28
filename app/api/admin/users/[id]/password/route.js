import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req, context) {
  // ✅ unwrap params đúng chuẩn Next.js mới
  const { id } = await context.params;

  const { newPassword, currentUserId } = await req.json();

  // 🔒 Chỉ cho đổi mật chính mình
  if (String(id) !== String(currentUserId)) {
    return new Response(
      JSON.stringify({ message: "Không có quyền đổi mật khẩu tài khoản khác" }),
      { status: 403 }
    );
  }

  if (!newPassword || newPassword.length < 6) {
    return new Response(JSON.stringify({ message: "Mật khẩu không hợp lệ" }), {
      status: 400,
    });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await query({
    query: `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `,
    values: [hashed, id],
  });

  return Response.json({ success: true });
}
