"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(null); // Quản lý mục đang mở (accordion)
  const [brands, setBrands] = useState([]);
  const [keyword, setKeyword] = useState("");

  // Lấy dữ liệu thương hiệu để hiển thị trong menu con
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => setBrands(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  // Hàm đóng menu
  const closeMenu = () => {
    document.body.classList.remove("mobile-menu-open");
    setOpen(null);
  };

  // Hàm chuyển trang và đóng menu
  const goto = (url) => {
    router.push(url);
    closeMenu();
  };

  // Toggle accordion
  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    router.push(`/collections/all?s=${encodeURIComponent(keyword.trim())}`);
    closeMenu();
  };

  return (
    <>
      {/* Lớp phủ mờ phía sau */}
      <div className="overlay" onClick={closeMenu}></div>

      <div className="mobile-drawer">
        {/* Nút đóng và Logo nhỏ (nếu cần) */}
        <div className="mobile-head">
          <button className="btn-close-mb" onClick={closeMenu}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <ul className="mobile-menu-list">
          <li className="menu-item-mb">
            <Link href="/" onClick={closeMenu}>
              Trang chủ
            </Link>
          </li>

          {/* Search mobile */}
          <form className="mobile-search" onSubmit={onSearch}>
            <input
              type="search"
              placeholder="Tìm sản phẩm của bạn"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          <li className="menu-item-mb">
            <Link href="/about-laluz" onClick={closeMenu}>
              About LALUZ
            </Link>
          </li>

          {/* Accordion Thương hiệu */}
          <li
            className={`menu-item-mb has-sub ${
              open === "brand" ? "active" : ""
            }`}
          >
            <div className="flex-mn-mb" onClick={() => toggle("brand")}>
              <span>Thương hiệu</span>
              <i
                className={`fa-solid fa-chevron-${
                  open === "brand" ? "up" : "down"
                }`}
              />
            </div>
            <ul className="sub-menu-mb">
              <li>
                <button onClick={() => goto("/collections/all")}>
                  Tất cả thương hiệu
                </button>
              </li>
              {brands.slice(0, 10).map((b) => (
                <li key={b.brand_id}>
                  <button
                    onClick={() => goto(`/collections/all?brand=${b.name}`)}
                  >
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          </li>

          {/* Accordion Nước hoa */}
          <li
            className={`menu-item-mb has-sub ${
              open === "perfume" ? "active" : ""
            }`}
          >
            <div className="flex-mn-mb" onClick={() => toggle("perfume")}>
              <span>Nước hoa</span>
              <i
                className={`fa-solid fa-chevron-${
                  open === "perfume" ? "up" : "down"
                }`}
              />
            </div>
            <ul className="sub-menu-mb">
              <li>
                <button onClick={() => goto("/collections/all?gender=Nam")}>
                  Nước hoa Nam
                </button>
              </li>
              <li>
                <button onClick={() => goto("/collections/all?gender=Nữ")}>
                  Nước hoa Nữ
                </button>
              </li>
              <li>
                <button onClick={() => goto("/collections/all?gender=Unisex")}>
                  Nước hoa Unisex
                </button>
              </li>
            </ul>
          </li>

          <li className="menu-item-mb">
            <Link href="/about-laluz" onClick={closeMenu}>
              Tin tức
            </Link>
          </li>

          <li className="menu-item-mb">
            <Link href="/about-laluz" onClick={closeMenu}>
              Liên hệ
            </Link>
          </li>

          <li className="divider" />

          {/* Các mục bổ sung giống laluz.vn */}
          <li className="menu-item-mb secondary">
            <Link href="/login" onClick={closeMenu}>
              <i className="fa-regular fa-user" /> Đăng nhập / Đăng ký
            </Link>
          </li>
          <li className="menu-item-mb secondary">
            <Link href="/cart" onClick={closeMenu}>
              <i className="fa-solid fa-cart-shopping" /> Giỏ hàng
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
