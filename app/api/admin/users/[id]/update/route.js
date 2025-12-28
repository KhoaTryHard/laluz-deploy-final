import { query } from "@/lib/db";

export async function POST(req, { params }) {
  const { id } = params;
  const { full_name, phone_number, role } = await req.json();

  await query({
    query: `
      UPDATE users
      SET full_name = ?, phone_number = ?, role = ?
      WHERE user_id = ?
    `,
    values: [full_name || null, phone_number || null, role || "customer", id],
  });

  return Response.json({ success: true });
}
