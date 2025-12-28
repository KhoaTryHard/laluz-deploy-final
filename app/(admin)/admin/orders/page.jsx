import Link from "next/link";

async function getOrders() {
  const res = await fetch("http://localhost:3000/api/admin/orders", {
    cache: "no-store",
  });
  return res.json();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const formatMoney = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);
  console.log(orders);

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
