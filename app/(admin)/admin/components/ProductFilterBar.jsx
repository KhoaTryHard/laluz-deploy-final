"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ProductFilterBar({ categories }) {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");

  const applyFilter = () => {
    const q = new URLSearchParams();

    if (search) q.set("q", search);
    if (category) q.set("category", category);

    router.push(`/admin/products?${q.toString()}`);
  };

  const resetFilter = () => {
    router.push("/admin/products");
  };

  return (
    <div className="filter-bar">
      <input
        className="filter-input"
        placeholder="🔍 Tìm theo tên sản phẩm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="filter-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">-- Tất cả danh mục --</option>

        {/* ⚠️ category_id NULL */}
        <option value="null">Chưa phân loại</option>

        {categories.map((c) => (
          <option key={c.category_id} value={c.category_id}>
            {c.name}
          </option>
        ))}
      </select>

      <button className="btn btn-second" onClick={applyFilter}>
        Lọc
      </button>

      <button className="btn btn-four" onClick={resetFilter}>
        Reset
      </button>
    </div>
  );
}
