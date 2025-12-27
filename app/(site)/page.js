import { cookies } from "next/headers"; // Dùng để lấy giới tính người dùng
import HomeBanner from "@/components/Home/HomeBanner";
import WhyChoose from "@/components/Home/WhyChoose";
import ProductSlider from "@/components/Products/Slider/ProductSlider";
import { query } from "@/lib/db";

// --- 1. Helper Format tiền ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- 2. Các hàm truy vấn SQL ---

// A. Lấy sản phẩm MỚI NHẤT (New Arrivals)
async function getNewArrivals() {
  try {
    const sql = `
      SELECT 
        p.product_id, p.name, p.slug, p.price, 
        b.name as brand_name,
        pi.image_url
      FROM productsp
      LEFT JOIN BRANDS b ON p.brand_id = b.brand_id
      LEFT JOIN PRODUCT_IMAGES pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      ORDER BY p.created_at DESC 
      LIMIT 10
    `;
    const products = await query({ query: sql, values: [] });
    return mapData(products);
  } catch (e) {
    console.error("Lỗi lấy New Arrivals:", e);
    return [];
  }
}

// B. Lấy sản phẩm BÁN CHẠY (Best Sellers)
async function getBestSellers() {
  try {
    const sql = `
      SELECT 
        p.product_id, p.name, p.slug, p.price, 
        b.name as brand_name,
        pi.image_url,
        SUM(oi.quantity) as total_sold
      FROM products p
      JOIN order_items oi ON p.product_id = oi.product_id
      JOIN orders o ON oi.order_id = o.order_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      GROUP BY p.product_id
      ORDER BY total_sold DESC 
      LIMIT 10
    `;
    const products = await query({ query: sql, values: [] });

    // Nếu chưa có đơn hàng nào, trả về danh sách trống hoặc fallback về sản phẩm giá cao
    if (products.length === 0) return getFallbackProducts();

    return mapData(products);
  } catch (e) {
    console.error("Lỗi lấy Best Sellers:", e);
    return [];
  }
}

// C. Lấy sản phẩm GỢI Ý (Theo giới tính User)
async function getRecommendations(genderSlug) {
  try {
    // Nếu genderSlug không hợp lệ, mặc định về 'unisex'
    const validSlugs = ["unisex", "nuoc-hoa-nam", "nuoc-hoa-nu"];
    const safeSlug = validSlugs.includes(genderSlug) ? genderSlug : "unisex";

    const sql = `
      SELECT 
        p.product_id, p.name, p.slug, p.price, 
        b.name as brand_name,
        pi.image_url
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      WHERE c.slug = ?
      ORDER BY RAND() 
      LIMIT 10
    `;
    // ORDER BY RAND(): Mỗi lần F5 sẽ gợi ý các sản phẩm khác nhau trong cùng giới tính
    const products = await query({ query: sql, values: [safeSlug] });
    return mapData(products);
  } catch (e) {
    console.error("Lỗi lấy Recommendations:", e);
    return [];
  }
}

// Helper: Map dữ liệu SQL sang format chuẩn
function mapData(products) {
  return products.map((p) => ({
    id: p.product_id,
    name: p.name,
    slug: p.slug,
    price: p.price ? formatCurrency(Number(p.price)) : "Liên hệ",
    brand: p.brand_name || "Laluz Parfums",
    image_url: p.image_url || "/images/products/default.webp",
  }));
}

// --- 3. Component Trang Chủ ---
export default async function Home() {
  // Lấy Cookie để xem giới tính người dùng (nếu bạn có lưu)
  // Nếu chưa có cookie, mặc định là 'unisex'
  const cookieStore = await cookies();
  const userGender = cookieStore.get("user_gender")?.value || "Unisex";

  // Gọi dữ liệu song song
  const [newArrivals, bestSellers, recommended] = await Promise.all([
    getNewArrivals(),
    getBestSellers(),
    getRecommendations(userGender),
  ]);

  return (
    <main className="main spc-hd">
      <h1 className="mona-hidden-tt">
        LALUZ PARFUMS - Địa chỉ bán nước hoa chính hãng giá tốt
      </h1>

      <div className="has-banner">
        <HomeBanner />

        {/* 1. SẢN PHẨM MỚI */}
        {newArrivals.length > 0 && (
          <ProductSlider
            name="SẢN PHẨM MỚI VỀ"
            link="/collections/all"
            products={newArrivals}
          />
        )}

        <HomeBanner />

        {/* 2. SẢN PHẨM BÁN CHẠY */}
        {bestSellers.length > 0 && (
          <ProductSlider
            name="SẢN PHẨM BÁN CHẠY"
            link="/collections/all"
            products={bestSellers}
          />
        )}

        <HomeBanner />

        {/* 3. GỢI Ý THEO GIỚI TÍNH (Mặc định Unisex) */}
        {recommended.length > 0 && (
          <ProductSlider
            name="SẢN PHẨM ĐƯỢC GỢI Ý"
            link={`/collections/all?gender=${userGender}`}
            products={recommended}
          />
        )}

        <WhyChoose />
      </div>
    </main>
  );
}
