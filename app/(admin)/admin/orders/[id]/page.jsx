"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "../../components/Toast";

export default function AdminOrderDetailPage() {
  const { id } = useParams(); // 👈 dùng id
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);

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
        setToast({ type: "error", message: "Cập nhật thất bại" });
        return;
      }

      setToast({ type: "success", message: "Đã cập nhật trạng thái" });
    } catch (err) {
      setToast({ type: "error", message: "Lỗi server" });
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
    <div className="container-laluz">
      <div className="admin-header-row">
        <h2 className="tt-sec">Chi tiết đơn hàng #{order.order_id}</h2>
        <Link href="/admin/orders" className="btn btn-four">
          ← Quay lại
        </Link>
      </div>

      {/* Thông tin đơn hàng */}
      <div
        className="box-white user-detail-card"
        style={{ marginBottom: "24px" }}
      >
        <table className="info-table">
          <tbody>
            <tr>
              <td>Email</td>
              <td>{order.email}</td>
            </tr>
            <tr>
              <td>Địa chỉ</td>
              <td>{order.shipping_address}</td>
            </tr>
            <tr>
              <td>SĐT</td>
              <td>{order.phone_number}</td>
            </tr>

            <tr>
              <td>Trạng thái</td>
              <td>
                <div className="order-status-control">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="box-white order-products">
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

        <h3 className="order-total">
          Tổng tiền: <span>{formatMoney(order.total_amount)}</span>
        </h3>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
