import CollectionPage from "@/components/Products/Collection/CollectionPage";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";

// Hàm format tiền tệ (VND)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Hàm lấy sản phẩm từ SQL
async function getProductsBySlug(slug) {
  let sql = "";
  let values = [];

  // [QUAN TRỌNG] Thêm dấu cách ở cuối mỗi dòng để tránh lỗi dính chữ
  const baseQuery = `
    SELECT 
      p.product_id, 
      p.name, 
      p.slug, 
      p.price, 
      p.stock_quantity, 
      pi.image_url,
      b.name as brand_name 
    FROM PRODUCTS p
    LEFT JOIN PRODUCT_IMAGES pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1 
    LEFT JOIN BRANDS b ON p.brand_id = b.brand_id 
  `; // Đã thêm dấu cách cuối dòng JOIN

  if (slug === "all") {
    // Sắp xếp mới nhất
    sql = `${baseQuery} ORDER BY p.created_at DESC`;
  } else {
    // Lọc theo danh mục
    sql = `
      ${baseQuery} 
      JOIN CATEGORIES c ON p.category_id = c.category_id 
      WHERE c.slug = ? 
      ORDER BY p.created_at DESC
    `;
    values = [slug];
  }

  const products = await query({ query: sql, values: values });
  return products;
}

// Hàm lấy tên danh mục để hiển thị tiêu đề
async function getCategoryName(slug) {
  if (slug === "all") return "Tất cả sản phẩm";
  
  try {
    const res = await query({
      query: "SELECT name FROM CATEGORIES WHERE slug = ?",
      values: [slug]
    });
    return res.length > 0 ? res[0].name : slug;
  } catch (e) {
    return slug;
  }
}

export default async function Page({ params }) {
  // Next.js 15 bắt buộc await params
  const { slug } = await params; 
  const currentSlug = slug ?? "all";

  // 1. Gọi hàm lấy dữ liệu
  const rawProducts = await getProductsBySlug(currentSlug);
  const categoryName = await getCategoryName(currentSlug);

  // 2. Map dữ liệu SQL sang format chuẩn cho giao diện
  const formattedProducts = rawProducts.map((p) => ({
    id: p.product_id,
    name: p.name,
    slug: p.slug,
    
    // Format giá tiền đẹp (8.900.000 ₫)
    price: p.price ? formatCurrency(Number(p.price)) : "Liên hệ", 
    
    // Lấy tên thương hiệu
    brand: p.brand_name || "Laluz Parfums", 

    // Ảnh sản phẩm (Lấy từ bảng PRODUCT_IMAGES)
    image: p.image_url || "/images/products/default.webp",
    
    inStock: p.stock_quantity > 0,
    category: currentSlug,
  }));

  return (
    <CollectionPage 
      slug={currentSlug} 
      title={categoryName} 
      products={formattedProducts} 
    />
  );
}