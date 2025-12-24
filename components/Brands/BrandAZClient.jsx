"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/UI/Breadcrumb";

const LETTERS = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

export default function BrandAZClient({ brands }) {
  const [activeLetter, setActiveLetter] = useState("All");

  const grouped = useMemo(() => {
    const map = {};
    brands.forEach((b) => {
      const letter = b.name.charAt(0).toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(b);
    });
    return map;
  }, [brands]);

  const displayBrands =
    activeLetter === "All" ? brands : grouped[activeLetter] || [];

  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Thương hiệu", href: "/brand" },
        ]}
      />

      <div className="container">
        <div className="tt-mg">Thương hiệu</div>

        {/* A–Z FILTER */}
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

        {/* BRAND LIST */}
        <ul className="brand-list row">
          {displayBrands.map((b) => (
            <li className="brand-it col-3" key={b.brand_id}>
              <Link
                className="brand-link"
                href={{
                  pathname: "/collections/all",
                  query: { brand: b.name },
                }}
              >
                {b.logo && (
                  <span className="brand-thumb">
                    <img src={b.logo} alt={b.name} loading="lazy" />
                  </span>
                )}

                <span className="brand-inner">
                  <span className="brand-name">{b.name}</span>
                  {b.origin_country && (
                    <span className="brand-country">{b.origin_country}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
