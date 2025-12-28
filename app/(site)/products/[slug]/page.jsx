// app/(site)/products/[slug]/page.jsx

import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import Breadcrumb from "@/components/UI/Breadcrumb";
import ProductDetailLayout from "@/components/Products/Detail/ProductDetailLayout";
import ProductGallery from "@/components/Products/Detail/ProductGallery";
import ProductSummary from "@/components/Products/Detail/ProductSummary";
import ProductInfoTabs from "@/components/Products/Detail/ProductInfoTabs";
import ProductReviews from "@/components/Products/Detail/ProductReviews";
import ProductRelatedSlider from "@/components/Products/Detail/ProductRelatedSlider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* =========================
   LẤY NOTES AN TOÀN
   ❌ KHÔNG JOIN NOTES
========================= */
async function getProductNotes(productId) {
  try {
    return await query({
      query: `
        SELECT note_name AS name, note_type
        FROM product_notes
        WHERE product_id = ?
      `,
      values: [productId],
    });
  } catch (err) {
    console.warn("Skip product notes:", err.message);
    return [];
  }
}

/* =========================
   LẤY DATA SẢN PHẨM
========================= */
async function getProductData(slug) {
  // 1. Lấy sản phẩm chính
  const products = await query({
    query: `
      SELECT p.*, b.name AS brand_name, c.name AS category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.slug = ?
    `,
    values: [slug],
  });

  if (products.length === 0) return null;
  const product = products[0];

  // 2. Chạy song song các query phụ
  const [images, notes, related] = await Promise.all([
    // Ảnh
    query({
      query: "SELECT image_url FROM product_images WHERE product_id = ?",
      values: [product.product_id],
    }),

    // Notes (AN TOÀN)
    getProductNotes(product.product_id),

    // Sản phẩm liên quan
    query({
      query: `
        SELECT p.product_id, p.name, p.slug, p.price,
               b.name AS brand_name, pi.image_url
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN product_images pi
          ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
        WHERE p.brand_id = ? AND p.product_id != ?
        LIMIT 4
      `,
      values: [product.brand_id, product.product_id],
    }),
  ]);

  return { product, images, notes, related };
}

/* =========================
   SẢN PHẨM GỢI Ý
========================= */
async function getRecommendedProducts(category_id, current_product_id) {
  const products = await query({
    query: `
      SELECT p.product_id, p.name, p.slug, p.price,
             b.name AS brand_name, pi.image_url
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_images pi
        ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      WHERE p.category_id = ? AND p.product_id != ?
      ORDER BY RAND()
      LIMIT 10
    `,
    values: [category_id, current_product_id],
  });

  return products.map((p) => ({
    name: p.name,
    brand: p.brand_name || "Laluz Parfums",
    brandLink: {
      pathname: "/collections/all",
      query: { brand: p.brand_name },
    },
    link: `/products/${p.slug}`,
    image: p.image_url || "/images/products/default.webp",
    price: Number(p.price),
  }));
}

/* =========================
   PAGE
========================= */
export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) notFound();

  const { product, images, notes, related } = data;

  const recommendedProducts = await getRecommendedProducts(
    product.category_id,
    product.product_id
  );

  /* ---------- XỬ LÝ DỮ LIỆU ---------- */

  // Ảnh
  const imageList =
    images.length > 0
      ? images.map((img) => img.image_url)
      : ["/images/products/default.webp"];

  // ProductSummary
  const formattedProduct = {
    product_id: product.product_id,
    name: product.name,
    stock_quantity: product.stock_quantity,
    price: Number(product.price),
    image_url: imageList[0],
    variations: [
      {
        id: product.volume_ml + "ml",
        label: `${product.volume_ml}ML`,
        price: Number(product.price),
        inStock: product.stock_quantity > 0,
      },
    ],
    images: imageList,
  };

  // Info box
  const productInfo = [
    {
      label: "Thương hiệu:",
      value: product.brand_name || "Unknown",
      href: {
        pathname: "/collections/all",
        query: { brand: product.brand_name },
      },
      icon: "/images/ic/ic-info-1.svg",
    },
    {
      label: "Dung tích:",
      value: `${product.volume_ml} ml`,
      icon: "/images/ic/ic-info-3.svg",
    },
    {
      label: "Giới tính:",
      value: product.category_name || "Unisex",
      href: {
        pathname: "/collections/all",
        query: { gender: product.category_name },
      },
      icon: "/images/ic/ic-info-5.svg",
    },
  ];

  // Notes
  const topNotes = notes
    .filter((n) => n.note_type === "Top")
    .map((n) => n.name)
    .join(", ");

  const midNotes = notes
    .filter((n) => n.note_type === "Middle")
    .map((n) => n.name)
    .join(", ");

  const baseNotes = notes
    .filter((n) => n.note_type === "Base")
    .map((n) => n.name)
    .join(", ");

  const descriptionContent = `
    <p>${product.description || ""}</p>
    ${topNotes ? `<p><strong>Hương đầu:</strong> ${topNotes}.</p>` : ""}
    ${midNotes ? `<p><strong>Hương giữa:</strong> ${midNotes}.</p>` : ""}
    ${baseNotes ? `<p><strong>Hương cuối:</strong> ${baseNotes}.</p>` : ""}
  `;

  const tabs = [
    { title: "Mô tả sản phẩm", content: descriptionContent },
    {
      title: "Sử dụng và bảo quản",
      content: `<p>– Xịt ở cổ tay, sau tai, gáy.</p><p>– Không chà xát sau khi xịt.</p>`,
    },
    {
      title: "Vận chuyển và đổi trả",
      content: `<p>Miễn phí vận chuyển cho đơn hàng trên 1 triệu đồng.</p>`,
    },
  ];

  const relatedProducts = related.map((item) => ({
    name: item.name,
    brand: item.brand_name,
    brandLink: "#",
    link: `/products/${item.slug}`,
    image: item.image_url || "/images/no-image.jpg",
    price: Number(item.price),
  }));

  const benefits = [
    { icon: "/images/ic/ic-benefit-1.svg", text: "Cam kết chính hãng 100%" },
    { icon: "/images/ic/ic-benefit-2.svg", text: "Chính sách đổi hàng" },
    { icon: "/images/ic/ic-benefit-3.svg", text: "Tư vấn miễn phí" },
    { icon: "/images/ic/ic-benefit-4.svg", text: "Free ship đơn từ 1 triệu" },
  ];

  /* ---------- RENDER ---------- */
  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name, active: true },
        ]}
      />

      <ProductDetailLayout
        gallery={<ProductGallery images={formattedProduct.images} />}
        summary={<ProductSummary product={formattedProduct} />}
        info={productInfo}
      />

      <ProductInfoTabs tabs={tabs} benefits={benefits} />

      <ProductReviews
        productId={product.product_id}
        productName={product.name}
      />

      <ProductRelatedSlider products={recommendedProducts} />
    </main>
  );
}
