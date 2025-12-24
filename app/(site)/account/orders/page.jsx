"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Thêm Link để bọc nút xem chi tiết
import Breadcrumb from "@/components/UI/Breadcrumb";
import AccountSidebar from "@/components/Account/AccountSidebar";

// --- CÁC HÀM HELPER ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN"); // VD: 20/12/2025
};

const translateStatus = (status) => {
  const map = {
    pending: "Đang chờ xử lý",
    processing: "Đang giao hàng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};

const getStatusStyle = (status) => {
  if (status === "completed") return { color: "#28a745", fontWeight: "600" }; // Xanh lá
  if (status === "cancelled") return { color: "#dc3545", fontWeight: "600" }; // Đỏ
  if (status === "processing") return { color: "#ffc107", fontWeight: "600" }; // Vàng cam
  return { color: "#6c757d" }; // Xám mặc định
};

// --- COMPONENT CHÍNH ---
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tài khoản", active: true },
          { label: "Lịch sử đơn hàng", active: true },
        ]}
      />

      <section className="info-acount">
        <div className="container">
          <div className="info-acount-flex row">
            
            {/* Sidebar bên trái */}
            <AccountSidebar />

            {/* Nội dung bên phải */}
            <div className="info-acount-col-right col col-md-9 col-12">
              <div className="woocommerce">
                <div className="woocommerce-MyAccount-content">
                  <h2 style={{ marginBottom: "20px", fontSize: "1.5rem", fontWeight: "bold" }}>
                    LỊCH SỬ ĐƠN HÀNG
                  </h2>

                  {loading ? (
                    <div style={{ textAlign: "center", padding: "30px" }}>Đang tải dữ liệu...</div>
                  ) : orders.length === 0 ? (
                    <div className="woocommerce-message woocommerce-message--info woocommerce-Message woocommerce-Message--info woocommerce-info">
                        Bạn chưa có đơn hàng nào.
                        <a className="woocommerce-Button button" href="/collections/all"><div></div>
                            Mua ngay
                        </a>
                    </div>
                  ) : (
                    // --- BẮT ĐẦU BẢNG ĐƠN HÀNG STYLE GIỐNG CART ---
                    <table className="shop_table shop_table_responsive account-orders-table" style={{ borderCollapse: "collapse", width: "100%" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #eee" }}>
                          <th style={{ textAlign: "left", padding: "15px 0", textTransform: "uppercase", fontSize: "0.9rem", color: "#eee" }}>
                            Mã đơn
                          </th>
                          <th style={{ textAlign: "left", padding: "15px 0", textTransform: "uppercase", fontSize: "0.9rem", color: "#eee" }}>
                            Ngày đặt
                          </th>
                          <th style={{ textAlign: "left", padding: "15px 0", textTransform: "uppercase", fontSize: "0.9rem", color: "#eee" }}>
                            Trạng thái
                          </th>
                          <th style={{ textAlign: "right", padding: "15px 0", textTransform: "uppercase", fontSize: "0.9rem", color: "#eee" }}>
                            Tổng tiền
                          </th>
                          {/* Cột thao tác (Xem chi tiết) */}
                          <th style={{ textAlign: "right", padding: "15px 0" }}></th> 
                        </tr>
                      </thead>
                      
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.order_id} style={{ borderBottom: "1px solid #eee" }}>
                            {/* Mã đơn */}
                            <td style={{ padding: "15px 0", fontWeight: "bold", color: "#333" }}>
                              #{order.order_id}
                            </td>

                            {/* Ngày đặt */}
                            <td style={{ padding: "15px 0", color: "#666" }}>
                              {formatDate(order.created_at)}
                            </td>

                            {/* Trạng thái */}
                            <td style={{ padding: "15px 0" }}>
                              <span style={getStatusStyle(order.status)}>
                                {translateStatus(order.status)}
                              </span>
                            </td>

                            {/* Tổng tiền - Căn phải giống Cart */}
                            <td style={{ padding: "15px 0", textAlign: "right", fontWeight: "bold", color: "#333" }}>
                              {formatCurrency(Number(order.total_amount))}
                            </td>
                            
                            {/* Nút Xem - Style giống nút nhỏ */}
                            <td style={{ padding: "15px 0", textAlign: "right" }}>
                                <Link 
                                    href={`/account/orders/${order.order_id}`} 
                                    className="woocommerce-button button view"
                                    style={{ 
                                        padding: "5px 15px", 
                                        fontSize: "0.85rem",
                                        backgroundColor: "#f5f5f5",
                                        color: "#333",
                                        borderRadius: "4px",
                                        textDecoration: "none"
                                    }}
                                >
                                    Chi tiết
                                </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}