"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/UI/Breadcrumb";
import CartTable from "@/components/Cart/CartTable/CartTable";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. Load Cart (Logic cũ của bạn vẫn ổn, giữ nguyên logic load)
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          setIsLoggedIn(true);
          const res = await fetch("/api/cart/my-cart");
          const data = await res.json();
          if (data.items) setCartItems(data.items);
        } else {
          setIsLoggedIn(false);
          const localCart = JSON.parse(
            localStorage.getItem("laluz_cart") || "[]"
          );
          if (localCart.length > 0) {
            // Giả lập gọi API details hoặc hiển thị luôn nếu đủ data
            // Để đơn giản test nút bấm, ta hiển thị localCart luôn (lưu ý localCart cần đủ trường name, price)
            const ids = localCart.map((i) => i.id || i.product_id);
            // Nếu cần fetch chi tiết thì fetch ở đây...
            setCartItems(localCart);
          }
        }
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  // 2. Hàm Xử Lý Cập Nhật (Cần log để biết nó có chạy không)
  const handleUpdateQuantity = async (id, newQty) => {
    if (newQty < 1) return;

    // A. Cập nhật giao diện NGAY LẬP TỨC (Optimistic UI)
    const oldItems = [...cartItems];
    setCartItems((prev) =>
      prev.map((item) =>
        (item.product_id || item.id) === id
          ? { ...item, quantity: newQty }
          : item
      )
    );

    // B. Gọi API hoặc LocalStorage
    if (isLoggedIn) {
      try {
        const res = await fetch("/api/cart/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: id, quantity: newQty }),
        });
        if (!res.ok) {
          console.error("API Update lỗi!");
          setCartItems(oldItems); // Hoàn tác nếu lỗi
        }
      } catch (err) {
        setCartItems(oldItems);
      }
    } else {
      // Update LocalStorage
      const localCart = JSON.parse(localStorage.getItem("laluz_cart") || "[]");
      const updatedLocal = localCart.map((item) =>
        (item.id || item.product_id) === id
          ? { ...item, quantity: newQty }
          : item
      );
      localStorage.setItem("laluz_cart", JSON.stringify(updatedLocal));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const handleRemove = async (id) => {
    console.log("--> CartPage nhận lệnh xóa:", id);
    setCartItems((prev) => prev.filter((p) => (p.product_id || p.id) !== id));
    if (isLoggedIn) {
      await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }),
      });
    } else {
      const localCart = JSON.parse(localStorage.getItem("laluz_cart") || "[]");
      const updated = localCart.filter((i) => (i.id || i.product_id) !== id);
      localStorage.setItem("laluz_cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (total, p) => total + Number(p.price) * (p.quantity || 1),
    0
  );

  return (
    <main className="main spc-hd">
      {/* ... Breadcrumb, Title ... */}

      <div className="container" style={{ padding: "40px 0" }}>
        {/* ... Loading check ... */}

        {!loading ? (
          cartItems.length > 0 ? (
            <div className="cart-wrapper">
              <CartTable
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />

              {/* Tổng tiền và nút thanh toán (Giữ nguyên hoặc tách ra CartSidebar nếu muốn) */}
              <div
                style={{
                  marginTop: "30px",
                  textAlign: "right",
                  borderTop: "1px solid #eee",
                  paddingTop: "20px",
                }}
              >
                <h3>
                  Tổng cộng:{" "}
                  <span style={{ color: "#d40404" }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(subtotal)}
                  </span>
                </h3>
                <Link
                  href="/checkout"
                  className="btn btn-pri"
                  style={{
                    display: "inline-block",
                    marginTop: "15px",
                    padding: "10px 30px",
                    background: "#000",
                    color: "#fff",
                  }}
                >
                  Thanh toán ngay
                </Link>
              </div>
            </div>
          ) : (
            /* --- GIAO DIỆN KHI GIỎ HÀNG TRỐNG --- */
            <div
              className="cart-empty"
              style={{
                textAlign: "center",
                padding: "40px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                className="empty-icon"
                style={{ fontSize: "80px", color: "#ccc" }}
              >
                <i className="fa-solid fa-cart-shopping"></i>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "500" }}>
                Giỏ hàng của bạn đang trống
              </h2>
              <p
                style={{ color: "#666", maxWidth: "400px", lineHeight: "1.6" }}
              >
                Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá
                các bộ sưu tập nước hoa mới nhất của LALUZ nhé!
              </p>
              <Link
                href="/collections/all"
                className="btn-back-to-shop"
                style={{
                  marginTop: "10px",
                  padding: "12px 30px",
                  background: "#9C8679",
                  color: "#fff",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  transition: "0.3s",
                }}
              >
                QUAY LẠI CỬA HÀNG
              </Link>
            </div>
          )
        ) : (
          <p style={{ textAlign: "center" }}>Đang tải giỏ hàng...</p>
        )}
      </div>
    </main>
  );
}
