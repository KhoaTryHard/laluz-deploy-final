import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

// Lấy thông tin user (KHÔNG password)
async function getUser(id) {
  const users = await query({
    query: `
      SELECT user_id, email, role, created_at
      FROM users
      WHERE user_id = ?
    `,
    values: [id],
  });

  return users[0] || null;
}

// Lấy danh sách đơn hàng của user
async function getOrdersByUser(userId) {
  return query({
    query: `
      SELECT 
        order_id,
        total_amount,
        status,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
    values: [userId],
  });
}

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;

  const user = await getUser(id);
  if (!user) notFound();

  const orders = await getOrdersByUser(id);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="container-laluz">
      <div className="admin-header-row">
        <h2 className="tt-sec">Thông tin người dùng</h2>

        <Link href="/admin/users" className="btn btn-four">
          ← Quay lại
        </Link>
      </div>

      {/* ===== THÔNG TIN USER ===== */}
      <div
        className="box-white user-detail-card"
        style={{ marginBottom: "24px" }}
      >
        <h3 className="tt-bl">Thông tin cá nhân</h3>

        <table className="info-table">
          <tbody>
            <tr>
              <td>ID</td>
              <td>#{user.user_id}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td>Vai trò</td>
              <td>
                <span className="badge">{user.role}</span>
              </td>
            </tr>
            <tr>
              <td>Ngày tạo</td>
              <td>{new Date(user.created_at).toLocaleString("vi-VN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== ĐƠN HÀNG ===== */}
      <div className="box-white">
        <h3 className="tt-bl">Đơn hàng của người dùng</h3>

        {orders.length === 0 ? (
          <div className="empty-orders">Người dùng chưa có đơn hàng nào.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.order_id}>
                  <td>#{o.order_id}</td>
                  <td style={{ color: "#d33", fontWeight: "bold" }}>
                    {formatPrice(o.total_amount)}
                  </td>
                  <td>
                    <span className="status">{o.status}</span>
                  </td>
                  <td>{new Date(o.created_at).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
