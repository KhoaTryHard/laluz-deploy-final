// app/(site)/collections/[slug]/page.jsx
import CollectionPage from "@/components/Products/Collection/CollectionPage";
import { query } from "@/lib/db";

// Hàm format tiền tệ (VND)
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

// Hàm lấy sản phẩm từ SQL
async function getProductsBySlug(slug) {
  let sql = "";
  let values = [];

  const baseQuery = `
    SELECT 
      p.product_id, 
      p.name, 
      p.slug, 
      p.price, 
      p.stock_quantity,
      p.concentration,
      p.created_at,
      pi.image_url,
      c.name as category_name,
      b.name as brand_name
    FROM products p
    LEFT JOIN product_images pi 
      ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
    LEFT JOIN brands b 
      ON p.brand_id = b.brand_id
    LEFT JOIN categories c 
      ON p.category_id = c.category_id
  `;

  if (slug === "all") {
    sql = `${baseQuery} ORDER BY p.created_at DESC`;
  } else {
    sql = `
      ${baseQuery}
      WHERE c.slug = ?
      ORDER BY p.created_at DESC
    `;
    values = [slug];
  }

  return await query({ query: sql, values });
}

// Hàm lấy tên danh mục để hiển thị tiêu đề
async function getCategoryName(slug) {
  if (slug === "all") return "Tất cả sản phẩm";
  try {
    const res = await query({
      query: "SELECT name FROM categories WHERE slug = ?",
      values: [slug],
    });
    return res?.length ? res[0].name : slug;
  } catch {
    return slug;
  }
}

export default async function Page({ params, searchParams }) {
  // Next 16: params/searchParams có thể là Promise -> unwrap
  const { slug } = await params;
  const sp = (await searchParams) || {};

  const currentSlug = slug ?? "all";

  // URL filters (nếu không có thì null)
  const initialGender = sp.gender || null;
  const initialBrand = sp.brand || null;
  const initialNote = sp.note || null;
  const initialConcentration = sp.concentration || null;

  const rawProducts = await getProductsBySlug(currentSlug);
  const categoryName = await getCategoryName(currentSlug);

  const getGenderFromCategory = (catName) => {
    if (!catName) return "Unisex";
    const lower = catName.toLowerCase();
    if (lower.includes("nam")) return "Nam";
    if (lower.includes("nữ")) return "Nữ";
    return "Unisex";
  };

  const formattedProducts = rawProducts.map((p) => ({
    id: p.product_id,
    name: p.name,
    slug: p.slug,
    price: p.price ? formatCurrency(Number(p.price)) : "Liên hệ",
    brand: p.brand_name || "Laluz Parfums",
    image_url: p.image_url || "/images/products/default.webp",
    inStock: Number(p.stock_quantity) > 0,
    gender: getGenderFromCategory(p.category_name),
    category: currentSlug,
    createdAt: p.created_at,              // ✅ để sort newest chạy đúng
    concentration: p.concentration || "", // ✅ để filter nồng độ
    // notes: [] // nếu bạn có notes thì add ở đây sau
  }));

  return (
    <CollectionPage
      slug={currentSlug}
      title={categoryName}
      products={formattedProducts}
      initialGender={initialGender}
      initialBrand={initialBrand}
      initialNote={initialNote}
      initialConcentration={initialConcentration}
    />
  );
}
