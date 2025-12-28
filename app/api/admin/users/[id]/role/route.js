import { query } from "@/lib/db";

export async function POST(req, context) {
  const { id } = await context.params;
  const { newRole, currentUserId } = await req.json();

  // 🔒 Không cho tự đổi role chính mình
  if (String(id) === String(currentUserId)) {
    return new Response(
      JSON.stringify({ message: "Không thể tự thay đổi quyền của chính mình" }),
      { status: 403 }
    );
  }

  if (!["admin", "customer"].includes(newRole)) {
    return new Response(JSON.stringify({ message: "Role không hợp lệ" }), {
      status: 400,
    });
  }

  await query({
    query: `
      UPDATE users
      SET role = ?
      WHERE user_id = ?
    `,
    values: [newRole, id],
  });

  return Response.json({ success: true });
}
