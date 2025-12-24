"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProductFilter from "@/components/Products/Filter/ProductFilter";
import ProductToolbar from "@/components/Products/Toolbar/ProductToolbar";
import ProductGrid from "@/components/Products/Grid/ProductGrid";
import ProductPagination from "@/components/Products/Pagination/ProductPagination";
import CollectionBanner from "@/components/UI/CollectionBanner";
import { getCategoryLabel } from "@/data/categories";

const SORTS = {
  newest: "newest",
  priceAsc: "priceAsc",
  priceDesc: "priceDesc",
};

const PRICE_RANGES = [
  { label: "Dưới 2 triệu", min: 0, max: 2000000 },
  { label: "2 triệu - 5 triệu", min: 2000000, max: 5000000 },
  { label: "5 triệu - 10 triệu", min: 5000000, max: 10000000 },
  { label: "Trên 10 triệu", min: 10000000, max: Infinity },
];

function parsePrice(v) {
  if (v == null) return 0;
  const s = String(v).replace(/[^\d]/g, "");
  return s ? Number(s) : 0;
}

export default function CollectionClient({
  slug,
  products = [],
  initialGender = null,
  initialBrand = null,
  initialNote = null,
  initialConcentration = null,
}) {
  const searchParams = useSearchParams();

  const [sortKey, setSortKey] = useState(SORTS.newest);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selectedBrands, setSelectedBrands] = useState(
    initialBrand ? new Set([initialBrand]) : new Set()
  );
  const [selectedGenders, setSelectedGenders] = useState(
    initialGender ? new Set([initialGender]) : new Set()
  );
  const [selectedPrices, setSelectedPrices] = useState(new Set());

  // nếu bạn chưa có notes/concentration trong data thì vẫn OK
  const [selectedNotes, setSelectedNotes] = useState(
    initialNote ? new Set([initialNote]) : new Set()
  );
  const [selectedConcentrations, setSelectedConcentrations] = useState(
    initialConcentration ? new Set([initialConcentration]) : new Set()
  );

  const appliedUrlFilterRef = useRef(false);

  // Đồng bộ filter theo URL khi user click từ menu (gender/brand/note/concentration)
  useEffect(() => {
    if (appliedUrlFilterRef.current) return;

    const genderFromUrl = searchParams.get("gender");
    const brandFromUrl = searchParams.get("brand");
    const noteFromUrl = searchParams.get("note");
    const concentrationFromUrl = searchParams.get("concentration");

    if (genderFromUrl) setSelectedGenders(new Set([genderFromUrl]));
    if (brandFromUrl) setSelectedBrands(new Set([brandFromUrl]));
    if (noteFromUrl) setSelectedNotes(new Set([noteFromUrl]));
    if (concentrationFromUrl)
      setSelectedConcentrations(new Set([concentrationFromUrl]));

    if (genderFromUrl || brandFromUrl || noteFromUrl || concentrationFromUrl) {
      setPage(1);
    }

    appliedUrlFilterRef.current = true;
  }, [searchParams]);

  const label = getCategoryLabel(slug);

  const brandOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p?.brand && set.add(p.brand));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const genderOptions = ["Nam", "Nữ", "Unisex"];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okBrand =
        selectedBrands.size === 0 || (p?.brand && selectedBrands.has(p.brand));

      const okGender =
        selectedGenders.size === 0 ||
        (p?.gender && selectedGenders.has(p.gender));

      let okPrice = true;
      if (selectedPrices.size > 0) {
        const priceNum = parsePrice(p.price);
        okPrice = Array.from(selectedPrices).some((rangeLabel) => {
          const range = PRICE_RANGES.find((r) => r.label === rangeLabel);
          return range && priceNum >= range.min && priceNum < range.max;
        });
      }

      // note/concentration: nếu data chưa có thì tự pass qua
      const okNote =
        selectedNotes.size === 0 ||
        (Array.isArray(p?.notes) && p.notes.some((n) => selectedNotes.has(n)));

      const okConcentration =
        selectedConcentrations.size === 0 ||
        (p?.concentration && selectedConcentrations.has(p.concentration));

      return okBrand && okGender && okPrice && okNote && okConcentration;
    });
  }, [
    products,
    selectedBrands,
    selectedGenders,
    selectedPrices,
    selectedNotes,
    selectedConcentrations,
  ]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === SORTS.priceAsc) {
      arr.sort((a, b) => parsePrice(a?.price) - parsePrice(b?.price));
    } else if (sortKey === SORTS.priceDesc) {
      arr.sort((a, b) => parsePrice(b?.price) - parsePrice(a?.price));
    } else {
      arr.sort((a, b) => {
        const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }
    return arr;
  }, [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paged = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, totalPages]);

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <section className="wrap-prod page-category">
      <div className="container">
        <div className="prod-wrap-flex">
          <aside className="prod-left">
            <ProductFilter
              brandOptions={brandOptions}
              genderOptions={genderOptions}
              selectedBrands={selectedBrands}
              setSelectedBrands={(next) => {
                setSelectedBrands(next);
                resetToFirstPage();
              }}
              selectedGenders={selectedGenders}
              setSelectedGenders={(next) => {
                setSelectedGenders(next);
                resetToFirstPage();
              }}
              priceOptions={PRICE_RANGES}
              selectedPrices={selectedPrices}
              setSelectedPrices={(next) => {
                setSelectedPrices(next);
                resetToFirstPage();
              }}
            />
          </aside>

          <div className="prod-right">
            <ProductToolbar
              title={label.toUpperCase()}
              sortKey={sortKey}
              setSortKey={(v) => {
                setSortKey(v);
                resetToFirstPage();
              }}
            />

            <ProductGrid products={paged} />

            <ProductPagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => setPage(p)}
            />
          </div>
        </div>
      </div>
      <CollectionBanner />
    </section>
  );
}
