"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/components/Cart/cart-utils";

export default function ProductAddToCart({ product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const stock = product.stock_quantity || 0;

  // ✅ NORMALIZE PRODUCT – CHỈ 1 LẦN
  const normalizedProduct = {
    id: product.product_id,
    product_id: product.product_id,
    name: product.name,
    price: Number(product.price),
    image: product.image_url,
    slug: product.slug || "",
    stock_quantity: product.stock_quantity,
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

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

    setLoading(true);
    await addToCart(normalizedProduct, qty, isLoggedIn);
    setLoading(false);

    return true;
  };

  const handleAddToCart = async () => {
    await handleAddToCartProcess();
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCartProcess();
    if (success) {
      router.push("/cart");
    }
  };

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
            disabled={loading}
            className="btn btn-pri mona-add-to-cart-detail"
            onClick={handleAddToCart}
          >
            <span className="txt">THÊM VÀO GIỎ HÀNG</span>
          </button>
        </div>

        <div className="btn-item m-buy-now">
          <button
            disabled={loading}
            className="btn btn-second"
            onClick={handleBuyNow}
          >
            <span className="txt">MUA NGAY</span>
          </button>
        </div>
      </div>

      {stock <= 0 && (
        <p style={{ color: "red", marginTop: 10 }}>
          Sản phẩm tạm thời hết hàng
        </p>
      )}
    </div>
  );
}
