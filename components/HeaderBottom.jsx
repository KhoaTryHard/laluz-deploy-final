"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const LETTERS = [
  "All",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export default function HeaderBottom() {
  const [fragrances, setFragrances] = useState([]);
  const [concentrations, setConcentrations] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeLetter, setActiveLetter] = useState("All");
  const [topBrands, setTopBrands] = useState([]);

  // 1️⃣ Fetch brands từ API
  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        setBrands(Array.isArray(data) ? data : []);
      })
      .catch(console.error);

    fetch("/api/brands/top-selling")
      .then((res) => res.json())
      .then((data) => setTopBrands(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("/api/menu/fragrances")
      .then((r) => r.json())
      .then(setFragrances)
      .catch(console.error);

    fetch("/api/menu/concentrations")
      .then((r) => r.json())
      .then(setConcentrations)
      .catch(console.error);
  }, []);

  // 2️⃣ Lọc brand theo chữ cái
  const filteredBrands = useMemo(() => {
    if (activeLetter === "All") return brands;
    return brands.filter((b) => b.name?.toUpperCase().startsWith(activeLetter));
  }, [brands, activeLetter]);

  return (
    <div className="hd-down">
      <div className="container">
        <div className="hd-down-inner">
          <div className="nav-menu">
            <ul id="menu-primary-menu" className="menu-list">
              {/* Trang chủ */}
              <li className="menu-item parent fz16 fw6 dropdown">
                <a className="menu-link txt-mn" href="/">
                  Trang Chủ
                </a>
              </li>

              {/* About */}
              <li className="menu-item parent fz16 fw6 dropdown">
                <Link href="/about-laluz" className="menu-link txt-mn">
                  About LALUZ
                </Link>
              </li>

              {/* Thương hiệu */}
              <li className="menu-item parent fz16 fw6 dropdown">
                <Link href="/brand" className="menu-link txt-mn">
                  Thương hiệu
                  <span className="ic-angle">
                    <i className="fa-solid fa-caret-down"></i>
                  </span>
                </Link>

                <div className="menu-mega">
                  {/* Cột trái – giữ nguyên */}
                  <div className="menu-mega-left">
                    <div className="menu-mega-item">
                      <div className="tt-mg">Thương hiệu bán chạy</div>
                      <ul className="menu-list">
                        {topBrands.map((brand) => (
                          <li className="menu-item" key={brand.brand_id}>
                            <Link
                              className="menu-link"
                              href={{
                                pathname: "/collections/all",
                                query: { brand: brand.name },
                              }}
                              onClick={() => {
                                router.refresh();
                              }}
                            >
                              {brand.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cột phải */}
                  <div className="menu-mega-right">
                    <div className="tt-mg">Thương hiệu nước hoa</div>

                    {/* A–Z filter */}
                    <div className="word-nav">
                      <ul className="word-list">
                        {LETTERS.map((letter) => (
                          <li className="word-it" key={letter}>
                            <label>
                              <input
                                type="radio"
                                name="brand-letter"
                                checked={activeLetter === letter}
                                onChange={() => setActiveLetter(letter)}
                              />
                              <div className="box">
                                <span className="txt">{letter}</span>
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <ul className="brand-list row">
                      {filteredBrands.length === 0 ? (
                        <li className="brand-it col-12">
                          <span className="brand-link">
                            Không có thương hiệu
                          </span>
                        </li>
                      ) : (
                        filteredBrands.map((brand) => (
                          <li key={brand.brand_id} className="brand-it col-4">
                            <Link
                              href={{
                                pathname: "/collections/all",
                                query: { brand: brand.name },
                              }}
                              onClick={() => {
                                router.refresh();
                              }}
                              className="brand-link"
                            >
                              {brand.name}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </li>

              {/* Nước hoa */}
              <li className="menu-item parent fz16 fw6 dropdown menu-item menu-item-type-taxonomy menu-item-object-product_cat current-product-ancestor current-menu-parent current-product-parent">
                <a className="menu-link txt-mn" href="/collections/all">
                  Nước hoa
                  <span className="ic-angle">
                    <i className="fa-solid fa-caret-down"></i>
                  </span>
                </a>

                <div className="menu-mega">
                  {/* Nhóm nước hoa */}
                  <div className="menu-mega-item">
                    <div className="tt-mg">Nước Hoa</div>
                    <ul className="menu-list">
                      <li className="menu-item">
                        <Link
                          href={{
                            pathname: "/collections/all",
                            query: { gender: "Unisex" },
                          }}
                          onClick={() => {
                            router.refresh();
                          }}
                          className="menu-link"
                        >
                          Nước hoa Unisex
                        </Link>
                      </li>
                      <li className="menu-item">
                        <Link
                          href={{
                            pathname: "/collections/all",
                            query: { gender: "Nữ" },
                          }}
                          onClick={() => {
                            router.refresh();
                          }}
                          className="menu-link"
                        >
                          Nước hoa Nữ
                        </Link>
                      </li>
                      <li className="menu-item">
                        <Link
                          href={{
                            pathname: "/collections/all",
                            query: { gender: "Nam" },
                          }}
                          onClick={() => {
                            router.refresh();
                          }}
                          className="menu-link"
                        >
                          Nước hoa Nam
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Nhóm hương */}
                  <div className="menu-mega-item">
                    <div className="tt-mg">Nhóm hương</div>
                    <ul className="menu-list">
                      {fragrances.map((name) => (
                        <li className="menu-item" key={name}>
                          <Link
                            href={{
                              pathname: "/collections/all",
                              query: { note: name },
                            }}
                            onClick={() => {
                              router.refresh();
                            }}
                            className="menu-link"
                          >
                            {name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nồng độ */}
                  <div className="menu-mega-item">
                    <div className="tt-mg">Nồng độ</div>
                    <ul className="menu-list">
                      {concentrations.map((c) => (
                        <li className="menu-item" key={c}>
                          <Link
                            href={{
                              pathname: "/collections/all",
                              query: { concentration: c },
                            }}
                            onClick={() => {
                              router.refresh();
                            }}
                            className="menu-link"
                          >
                            {c}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>

              {/* Tin tức */}
              <li className="menu-item parent fz16 fw6 dropdown menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children dropdown">
                <a className="menu-link txt-mn" href="/about-laluz">
                  Tin tức
                  <span className="ic-angle">
                    <i className="fa-solid fa-caret-down"></i>
                  </span>
                </a>

                <ul className="menu-list">
                  <li className="menu-item parent fz16 fw6 dropdown menu-item menu-item-type-taxonomy menu-item-object-category">
                    <a className="menu-link" href="/about-laluz">
                      Review nước hoa
                    </a>
                  </li>
                  <li className="menu-item parent fz16 fw6 dropdown menu-item menu-item-type-taxonomy menu-item-object-category">
                    <a className="menu-link" href="/about-laluz">
                      Kinh nghiệm chọn nước hoa
                    </a>
                  </li>
                </ul>
              </li>

              {/* Liên hệ */}
              <li className="menu-item parent fz16 fw6 dropdown menu-item menu-item-type-post_type menu-item-object-page">
                <a className="menu-link txt-mn" href="/about-laluz">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
