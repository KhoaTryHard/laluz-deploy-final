import CollectionPage from "@/components/Products/Collection/CollectionPage";
import { query } from "@/lib/db";

// Format tiền
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

// Lấy sản phẩm (có search keyword)
async function getProductsBySlug(slug, keyword) {
  let values = [];
  // let sql = `
  //   SELECT
  //     p.product_id,
  //     p.name,
  //     p.slug,
  //     p.price,
  //     p.stock_quantity,
  //     p.concentration,
  //     p.created_at,
  //     pi.image_url,
  //     c.name as category_name,
  //     b.name as brand_name,
  //     GROUP_CONCAT(DISTINCT n.family) AS note_families
  //   FROM products p
  //   LEFT JOIN product_images pi
  //     ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
  //   LEFT JOIN brands b
  //     ON p.brand_id = b.brand_id
  //   LEFT JOIN categories c
  //     ON p.category_id = c.category_id
  //   LEFT JOIN product_notes pn
  //     ON p.product_id = pn.product_id
  //   LEFT JOIN notes n
  //     ON pn.note_id = n.note_id
  // `;
  let sql = `
  SELECT 
    p.product_id, 
    MAX(p.name) AS name, 
    MAX(p.slug) AS slug, 
    MAX(p.price) AS price, 
    MAX(p.stock_quantity) AS stock_quantity,
    MAX(p.concentration) AS concentration,
    MAX(p.created_at) AS created_at,
    MAX(pi.image_url) AS image_url,
    MAX(c.name) AS category_name,
    MAX(b.name) AS brand_name,
    GROUP_CONCAT(DISTINCT n.family) AS note_families
  FROM products p
  LEFT JOIN product_images pi 
    ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
  LEFT JOIN brands b 
    ON p.brand_id = b.brand_id
  LEFT JOIN categories c 
    ON p.category_id = c.category_id
  LEFT JOIN product_notes pn 
    ON p.product_id = pn.product_id
  LEFT JOIN notes n 
    ON pn.note_id = n.note_id
`;

  // Category filter
  if (slug !== "all") {
    sql += ` WHERE c.slug = ?`;
    values.push(slug);
  }

  // Search keyword
  if (keyword) {
    sql += slug === "all" ? " WHERE" : " AND";
    sql += ` (p.name LIKE ? OR b.name LIKE ?)`;
    values.push(`%${keyword}%`, `%${keyword}%`);
  }

  sql += `
    GROUP BY p.product_id
    ORDER BY MAX(p.created_at) DESC
  `;

  return await query({ query: sql, values });
}

// Lấy tên danh mục
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
  const { slug } = await params;
  const sp = (await searchParams) || {};

  const currentSlug = slug ?? "all";
  const keyword = sp.s?.trim() || null;

  // Filters khác
  const initialGender = sp.gender || null;
  const initialBrand = sp.brand || null;
  const initialNote = sp.note || null;
  const initialConcentration = sp.concentration || null;

  // Lấy sản phẩm (đã search)
  const rawProducts = await getProductsBySlug(currentSlug, keyword);
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
    createdAt: p.created_at,
    concentration: p.concentration || "",
    notes: p.note_families ? p.note_families.split(",") : [],
  }));

  return (
    <CollectionPage
      slug={currentSlug}
      title={keyword ? `Kết quả tìm kiếm cho "${keyword}"` : categoryName}
      products={formattedProducts}
      initialGender={initialGender}
      initialBrand={initialBrand}
      initialNote={initialNote}
      initialConcentration={initialConcentration}
    />
  );
}
