"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LOCAL_CART_KEY = "laluz_cart";

/** Tính tổng quantity từ local cart */
function getLocalCartCount() {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  } catch {
    return 0;
  }
}

/** Đọc cart từ server */
async function fetchServerCartCount() {
  const res = await fetch("/api/cart/my-cart", {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error("Server error");
  }

  const data = await res.json();

  if (!Array.isArray(data.items)) return 0;

  return data.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
}

export default function HeaderMid() {
  const router = useRouter();
  const sp = useSearchParams();

  const [keyword, setKeyword] = useState("");

  const onSubmitSearch = (e) => {
    e.preventDefault();

    if (!keyword.trim()) return;

    router.push(`/collections/all?s=${encodeURIComponent(keyword.trim())}`);
  };
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = async () => {
    try {
      const serverCount = await fetchServerCartCount();
      setCartCount(serverCount);
    } catch {
      // fallback localStorage
      setCartCount(getLocalCartCount());
    }
  };

  useEffect(() => {
    // Lần đầu
    loadCartCount();

    // Khi add/remove cart nơi khác
    const onCartUpdated = () => loadCartCount();
    window.addEventListener("cartUpdated", onCartUpdated);

    // Khi localStorage đổi (đa tab)
    const onStorage = (e) => {
      if (e.key === LOCAL_CART_KEY) loadCartCount();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cartUpdated", onCartUpdated);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hd-mid">
      <div className="container">
        <div className="hd-mid-inner">
          {/* Hamburger mobile */}
          <div
            className="btn-ham-wr"
            onClick={() => {
              document.body.classList.add("mobile-menu-open");
            }}
          >
            <div className="btn-ham">
              <span className="line-ham" />
              <span className="line-ham" />
              <span className="line-ham" />
            </div>
          </div>

          {/* Logo */}
          <div className="logo">
            <div className="logo-link">
              <a href="/" className="custom-logo-link" rel="home">
                <img
                  width={300}
                  height={96}
                  src="/images/cropped-logo-laluz-new.png"
                  className="custom-logo"
                  alt="LALUZ Parfums"
                  decoding="async"
                />
              </a>
            </div>
          </div>

          {/* Search + icons bên phải */}
          <div className="hd-mid-right">
            {/* search desktop */}
            <form
              id="searchform"
              className="searchform"
              autoComplete="off"
              onSubmit={onSubmitSearch}
            >
              <div className="box-search boxSearch">
                <button className="btn-search" type="submit">
                  <img src="/images/ic-search.svg" alt="Tìm kiếm" />
                </button>

                <input
                  type="search"
                  placeholder="Tìm sản phẩm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />

                {/* Box kết quả */}
                <div className="box-result boxResult">
                  <div className="inner">
                    <div id="search-product" className="is-loading-group">
                      <div className="mona-empty-message-large">
                        <p>Vui lòng nhập từ khóa tìm kiếm.</p>
                      </div>
                    </div>

                    <a className="btn live-search-btn" href="/collections/all">
                      Xem tất cả
                    </a>
                  </div>
                </div>
              </div>
            </form>

            {/* Icon nhóm bên phải */}
            <div className="hd-mid-right-it">
              {/* Wishlist */}
              <div className="ic-heart">
                <a className="ic-heart-inner" href="/login">
                  <img src="/images/ic-heart-2.svg" alt="Yêu thích" />
                </a>
              </div>

              {/* Cart */}
              <div className="hd-cart">
                <a className="hd-cart-inner" href="/cart">
                  <img src="/images/ic-cart.svg" alt="Giỏ hàng" />
                  <span className="quantity" id="mona-cart-qty">
                    {cartCount}
                  </span>
                </a>
              </div>

              {/* Login icon */}
              <div className="hd-login">
                <a className="hd-login-inner" href="/login">
                  <div className="ic-login">
                    <img src="/images/ic-user.svg" alt="User" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
