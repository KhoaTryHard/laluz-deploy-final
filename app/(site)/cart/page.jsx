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
            const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
            if (localCart.length > 0) {
                 // Giả lập gọi API details hoặc hiển thị luôn nếu đủ data
                 // Để đơn giản test nút bấm, ta hiển thị localCart luôn (lưu ý localCart cần đủ trường name, price)
                 const ids = localCart.map(i => i.id || i.product_id);
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
    console.log("--> CartPage nhận lệnh update:", id, "SL mới:", newQty); // DEBUG LOG

    if (newQty < 1) return;

    // A. Cập nhật giao diện NGAY LẬP TỨC (Optimistic UI)
    const oldItems = [...cartItems];
    setCartItems(prev => prev.map(item => 
        (item.product_id || item.id) === id ? { ...item, quantity: newQty } : item
    ));

    // B. Gọi API hoặc LocalStorage
    if (isLoggedIn) {
        try {
            const res = await fetch("/api/cart/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: id, quantity: newQty })
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
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const updatedLocal = localCart.map(item => 
            (item.id || item.product_id) === id ? { ...item, quantity: newQty } : item
        );
        localStorage.setItem("cart", JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event("storage"));
    }
  };

  const handleRemove = async (id) => {
      console.log("--> CartPage nhận lệnh xóa:", id);
      setCartItems(prev => prev.filter(p => (p.product_id || p.id) !== id));
      if (isLoggedIn) {
          await fetch("/api/cart/remove", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product_id: id })
          });
      } else {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const updated = localCart.filter(i => (i.id || i.product_id) !== id);
          localStorage.setItem("cart", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
      }
  };

  // Tính tổng tiền
  const subtotal = cartItems.reduce((total, p) => total + (Number(p.price) * (p.quantity || 1)), 0);

  return (
    <main className="main spc-hd">
      {/* ... Breadcrumb, Title ... */}
      
      <div className="container" style={{padding: '40px 0'}}>
        {/* ... Loading check ... */}

        {!loading && cartItems.length > 0 && (
            <div className="cart-wrapper">
                {/* --- SỬ DỤNG COMPONENT CARTTABLE --- */}
                {/* Truyền dữ liệu và hàm xử lý vào đây */}
                <CartTable 
                    cartItems={cartItems} 
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                />
                
                {/* Tổng tiền và nút thanh toán (Giữ nguyên hoặc tách ra CartSidebar nếu muốn) */}
                <div style={{marginTop: '30px', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '20px'}}>
                    <h3>Tổng cộng: <span style={{color: '#d40404'}}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}</span></h3>
                    <Link href="/checkout" className="btn btn-pri" style={{display:'inline-block', marginTop:'15px', padding:'10px 30px', background:'#000', color:'#fff'}}>
                        Thanh toán ngay
                    </Link>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}