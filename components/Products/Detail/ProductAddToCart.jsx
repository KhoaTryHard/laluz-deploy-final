"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/components/Cart/cart-utils";

// 1. NHẬN PROPS "product" TỪ COMPONENT CHA
export default function ProductAddToCart({ product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Thêm state check login
  const [loading, setLoading] = useState(false);

  // Kiểm tra dữ liệu an toàn
  if (!product) return null;

  // Lấy tồn kho (đã được truyền từ cha xuống)
  const stock = product.stock_quantity || 0;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // --- LOGIC XỬ LÝ (GIỮ LẠI ĐỂ NÚT BẤM HOẠT ĐỘNG) ---
  const handleQuantityChange = (amount) => {
    const newQty = qty + amount;
    const maxLimit = stock > 0 ? stock : 1; 
    if (newQty >= 1 && newQty <= maxLimit) {
      setQty(newQty);
    }
  };

  const handleAddToCartProcess = async () => {
    if (stock <= 0) {
      alert("Sản phẩm này hiện đang hết hàng!");
      return false;
    }

    setLoading(true); // Bật loading

    // --- GỌI HÀM XỬ LÝ CHUNG ---
    // Hàm này sẽ tự quyết định lưu vào DB hay LocalStorage
    await addToCart(product, qty, isLoggedIn);
    
    setLoading(false); // Tắt loading
    return true;
  };

  const handleAddToCart = async () => {
    await handleAddToCartProcess();
    // Không cần alert ở đây nữa vì hàm addToCart trong utils đã alert rồi
  };

  const handleBuyNow = () => {
    if (addToCartLogic()) {
      router.push("/cart");
    }
  };

  // --- PHẦN GIAO DIỆN (RENDER) ---
  return (
    <div className="btn-list-variable">
      <div className="quantity-prod">
        <span className="txt">Số lượng:</span>

        <div className="box-quantity">
          {/* Nút Giảm */}
          <button
            type="button"
            className="minus"
            onClick={() => handleQuantityChange(-1)}
          >
            -
          </button>

          {/* Input hiển thị */}
          <input type="text" className="ip-value" value={qty} readOnly />
          <p className="count-number number-change">{qty}</p>

          {/* Nút Tăng */}
          <button
            type="button"
            className="plus"
            onClick={() => handleQuantityChange(1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="btn-list">
        <div className="btn-item">
          <button 
            className="btn btn-pri mona-add-to-cart-detail"
            onClick={handleAddToCart} // Gắn sự kiện click
          >
            <span className="txt">THÊM VÀO GIỎ HÀNG</span>
          </button>
        </div>

        <div className="btn-item m-buy-now">
          <button 
            className="btn btn-second"
            onClick={handleBuyNow} // Gắn sự kiện click
          >
            <span className="txt">MUA NGAY</span>
          </button>
        </div>
      </div>
      
      {/* Hiển thị thông báo nếu hết hàng (Optional) */}
      {stock <= 0 && (
          <p style={{ color: 'red', marginTop: '10px' }}>Sản phẩm tạm thời hết hàng</p>
      )}
    </div>
  );
}