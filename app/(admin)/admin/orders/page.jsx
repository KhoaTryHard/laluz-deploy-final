import Link from "next/link";
import { headers } from "next/headers";

async function getOrders() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_BASE_URL");
  }

  const res = await fetch(
    `${baseUrl}/api/admin/orders`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const formatMoney = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  if (!Array.isArray(orders)) {
    return <p>Không thể tải danh sách đơn hàng</p>;
  }

  return (
    <div className="box-white">
      <div className="admin-header-row">
        <h2 className="tt-sec">Quản lý đơn hàng</h2>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Giảm giá</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o.order_id}>
                <td>{o.order_id}</td>
                <td>{o.email || "Guest"}</td>
                <td>{formatMoney(o.total_amount)}</td>
                <td>{formatMoney(o.coupon_discount)}</td>
                <td>
                  <span
                    className={`status ${
                      o.status === "completed" ? "success" : "danger"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <Link
                    href={`/admin/orders/${o.order_id}`}
                    className="btn btn-sm btn-second"
                  >
                    Xem
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                Chưa có đơn hàng
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
