"use client";

export default function ProductFilter({
  brandOptions = [],
  genderOptions = [],
  priceOptions = [], // Nhận thêm danh sách khoảng giá
  selectedBrands,
  setSelectedBrands,
  selectedGenders,
  setSelectedGenders,
  selectedPrices,   // State chọn giá
  setSelectedPrices // Hàm set state giá
}) {
  const toggleSet = (set, value) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  return (
    <aside className="filter-prod">
      
      {/* ===== BRAND ===== */}
      <div className="filter-box">
        <div className="tt-filter">Tìm theo thương hiệu</div>
        <div className="filter-scroll">
          <ul className="filter-list">
            {brandOptions.map((b) => (
              <li key={b}>
                <label className="filter-item">
                  <input
                    type="checkbox"
                    checked={selectedBrands?.has(b) || false}
                    onChange={() =>
                      setSelectedBrands?.(toggleSet(selectedBrands, b))
                    }
                  />
                  <span className="filter-box-ui"></span>
                  <span className="filter-text">{b}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== GENDER ===== */}
      <div className="filter-box">
        <div className="tt-filter">Giới tính</div>
        <ul className="filter-list">
          {genderOptions.map((g) => (
            <li key={g}>
              <label className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedGenders?.has(g) || false}
                  onChange={() =>
                    setSelectedGenders?.(toggleSet(selectedGenders, g))
                  }
                />
                <span className="filter-box-ui"></span>
                <span className="filter-text">{g}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* ===== KHOẢNG GIÁ  ===== */}
      <div className="filter-box">
        <div className="tt-filter">Khoảng giá</div>
        <ul className="filter-list">
          {priceOptions.map((p) => (
            <li key={p.label}>
              <label className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedPrices?.has(p.label) || false}
                  onChange={() =>
                    setSelectedPrices?.(toggleSet(selectedPrices, p.label))
                  }
                />
                <span className="filter-box-ui"></span>
                <span className="filter-text">{p.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

    </aside>
  );
}