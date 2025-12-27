"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/UI/Breadcrumb";
import AccountSidebar from "@/components/Account/AccountSidebar";

// --- CÁC HÀM FORMAT ---
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
  );
};

const translateStatus = (status) => {
  const map = {
    pending: "Đang xử lý",
    processing: "Đang giao hàng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};

// Style Badge trạng thái (Giống trang danh sách)
const getStatusBadge = (status) => {
  let color = "#666";
  let bg = "#eee";

  if (status === "completed") {
    color = "#0f5132";
    bg = "#d1e7dd";
  }
  if (status === "cancelled") {
    color = "#842029";
    bg = "#f8d7da";
  }
  if (status === "processing") {
    color = "#664d03";
    bg = "#fff3cd";
  }
  if (status === "pending") {
    color = "#055160";
    bg = "#cff4fc";
  }

  return {
    color: color,
    backgroundColor: bg,
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: "600",
    fontSize: "0.9rem",
    display: "inline-block",
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const cancelBtnStyle = {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "15px",
  };

  useEffect(() => {
    if (!params?.id) return;

    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Lỗi tải đơn hàng");
        }
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [params?.id]);

  if (loading)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Đang tải chi tiết đơn hàng...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "50px", color: "red", textAlign: "center" }}>
        Lỗi: {error}
      </div>
    );
  if (!data)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Không tìm thấy dữ liệu
      </div>
    );

  const { orderInfo, items } = data || {};

  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tài khoản", href: "/account" },
          { label: "Lịch sử đơn hàng", href: "/account/orders" },
          { label: `#${orderInfo?.order_id}`, active: true },
        ]}
      />

      <section className="info-acount">
        <div className="container">
          <div className="info-acount-flex row">
            {/* Sidebar bên trái */}
            <AccountSidebar />

            <div className="info-acount-col-right col col-md-9 col-12">
              <div className="woocommerce">
                <div className="woocommerce-MyAccount-content">
                  {/* --- HEADER: Tiêu đề + Trạng thái --- */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                      paddingBottom: "15px",
                      borderBottom: "2px solid #eee",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          margin: 0,
                          textTransform: "uppercase",
                        }}
                      >
                        CHI TIẾT ĐƠN HÀNG #{orderInfo.order_id}
                      </h2>
                      <p
                        style={{
                          color: "#777",
                          fontSize: "0.9rem",
                          marginTop: "5px",
                        }}
                      >
                        Ngày đặt: {formatDate(orderInfo.created_at)}
                      </p>
                    </div>
                    <div>
                      <span style={getStatusBadge(orderInfo.status)}>
                        {translateStatus(orderInfo.status)}
                      </span>
                    </div>
                  </div>

                  {/* --- TABLE SẢN PHẨM (Dùng class wc-block-cart-items giống trang List) --- */}
                  <div className="cart-left-section" style={{ width: "100%" }}>
                    <table
                      className="wc-block-cart-items"
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "10px 0",
                              textTransform: "uppercase",
                              fontSize: "0.85rem",
                              color: "#555",
                            }}
                          >
                            Sản phẩm
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "10px 0",
                              textTransform: "uppercase",
                              fontSize: "0.85rem",
                              color: "#555",
                            }}
                          >
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items && items.length > 0 ? (
                          items.map((item, index) => (
                            <tr
                              key={index}
                              className="wc-block-cart-items__row"
                              style={{ borderBottom: "1px solid #eee" }}
                            >
                              {/* Cột thông tin sản phẩm */}
                              <td style={{ padding: "20px 0" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "20px",
                                  }}
                                >
                                  {/* Ảnh sản phẩm */}
                                  <div
                                    style={{
                                      width: "70px",
                                      height: "70px",
                                      flexShrink: 0,
                                      border: "1px solid #eee",
                                      borderRadius: "4px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <img
                                      src={
                                        item.image_url ||
                                        "/images/products/default.webp"
                                      }
                                      alt={item.name}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>

                                  {/* Tên & Số lượng */}
                                  <div>
                                    <Link
                                      href={`/products/${item.slug}`}
                                      style={{
                                        fontWeight: "bold",
                                        color: "#333",
                                        display: "block",
                                        marginBottom: "5px",
                                      }}
                                    >
                                      {item.name}
                                    </Link>
                                    <div
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "#555",
                                      }}
                                    >
                                      Giá:{" "}
                                      {formatCurrency(
                                        Number(item.price_at_purchase)
                                      )}
                                      <span
                                        style={{
                                          margin: "0 8px",
                                          color: "#ccc",
                                        }}
                                      >
                                        |
                                      </span>
                                      Số lượng:{" "}
                                      <strong style={{ color: "#000" }}>
                                        x{item.quantity}
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Cột tổng tiền item */}
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "20px 0",
                                }}
                              >
                                <span
                                  style={{ fontWeight: "bold", color: "#000" }}
                                >
                                  {formatCurrency(
                                    item.price_at_purchase * item.quantity
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="2"
                              style={{ padding: "20px", textAlign: "center" }}
                            >
                              Không có sản phẩm nào.
                            </td>
                          </tr>
                        )}
                      </tbody>

                      {/* --- FOOTER TỔNG KẾT --- */}
                      <tfoot>
                        <tr>
                          <td
                            style={{
                              padding: "15px 0",
                              textAlign: "right",
                              fontWeight: "bold",
                              color: "#555",
                            }}
                          >
                            Tạm tính:
                          </td>
                          <td
                            style={{
                              padding: "15px 0",
                              textAlign: "right",
                              fontWeight: "bold",
                            }}
                          >
                            {formatCurrency(Number(orderInfo.total_amount))}
                          </td>
                        </tr>
                        <tr style={{ borderTop: "1px solid #eee" }}>
                          <td
                            style={{
                              padding: "15px 0",
                              textAlign: "right",
                              fontSize: "1.1rem",
                              fontWeight: "bold",
                              color: "#000",
                            }}
                          >
                            TỔNG CỘNG:
                          </td>
                          <td
                            style={{
                              padding: "15px 0",
                              textAlign: "right",
                              fontSize: "1.2rem",
                              fontWeight: "bold",
                              color: "#d33",
                            }}
                          >
                            {formatCurrency(Number(orderInfo.total_amount))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Nút Quay lại & Hủy đơn hàng */}
                  <div
                    style={{
                      marginTop: "30px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #eee",
                      paddingTop: "20px",
                    }}
                  >
                    <Link
                      href="/account/orders"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#666",
                        fontWeight: "600",
                        textDecoration: "none",
                      }}
                    >
                      Quay lại danh sách
                    </Link>

                    {orderInfo?.status?.toLowerCase() === "pending" && (
                      <button
                        disabled={cancelLoading}
                        style={{
                          ...cancelBtnStyle,
                          opacity: cancelLoading ? 0.7 : 1,
                          cursor: cancelLoading ? "not-allowed" : "pointer",
                        }}
                        onClick={async () => {
                          if (
                            !confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")
                          )
                            return;

                          try {
                            setCancelLoading(true);
                            const res = await fetch("/api/orders/cancel", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                order_id: orderInfo.order_id,
                                reason: "Khách hàng tự hủy",
                              }),
                            });

                            const result = await res.json();

                            if (res.ok) {
                              alert("Hủy đơn hàng thành công!");
                              // Cập nhật state tại chỗ thay vì reload trang
                              setData((prev) => ({
                                ...prev,
                                orderInfo: {
                                  ...prev.orderInfo,
                                  status: "cancelled",
                                },
                              }));
                            } else {
                              alert(result.message || "Không thể hủy đơn hàng");
                            }
                          } catch (err) {
                            alert("Có lỗi kết nối khi hủy đơn hàng");
                          } finally {
                            setCancelLoading(false);
                          }
                        }}
                      >
                        {cancelLoading ? (
                          <>
                            <span style={{ marginRight: "8px" }}>⌛</span> Đang
                            xử lý...
                          </>
                        ) : (
                          "Hủy đơn hàng"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
