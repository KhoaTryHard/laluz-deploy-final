"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminOrderDetailPage() {
  const { id } = useParams(); // 👈 dùng id
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);

        if (!res.ok) {
          setOrder(null);
          setItems([]);
          setLoading(false);
          return;
        }

        const data = await res.json();

        setOrder(data.order);
        setItems(data.items || []);
        setStatus(data.order.status);
      } catch (err) {
        console.error("Fetch order error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const updateStatus = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Cập nhật thất bại");
        return;
      }

      alert("Đã cập nhật trạng thái");
    } catch (err) {
      alert("Lỗi server");
    }
  };

  const formatMoney = (v) =>
    new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + " đ";

  if (loading) return <p>Đang tải dữ liệu...</p>;

  if (!order) {
    return (
      <div>
        <h2>Không tìm thấy đơn hàng</h2>
        <button onClick={() => router.push("/admin/orders")}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="box-white">
      <div className="admin-header-row">
        <h2>Chi tiết đơn hàng #{order.order_id}</h2>
        <button
          className="btn btn-second"
          onClick={() => router.push("/admin/orders")}
        >
          ← Quay lại
        </button>
      </div>

      <p>
        <b>Email:</b> {order.email}
      </p>
      <p>
        <b>Địa chỉ:</b> {order.shipping_address}
      </p>
      <p>
        <b>SĐT:</b> {order.phone_number}
      </p>

      <div style={{ margin: "16px 0" }}>
        <select
          className="admin-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Chờ xác nhận</option>
          <option value="preparing">Đang chuẩn bị</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Huỷ</option>
        </select>

        <button className="btn btn-pri" onClick={updateStatus}>
          Lưu
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>SL</th>
            <th>Tạm tính</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td>{it.name}</td>
              <td>{formatMoney(it.price_at_purchase)}</td>
              <td>{it.quantity}</td>
              <td>
                {formatMoney(
                  Number(it.price_at_purchase) * Number(it.quantity)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ textAlign: "right", marginTop: 20 }}>
        Tổng tiền: {formatMoney(order.total_amount)}
      </h3>
    </div>
  );
}
