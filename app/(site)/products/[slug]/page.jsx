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

// Hàm lấy dữ liệu từ SQL (Đã tối ưu chạy song song)
async function getProductData(slug) {
  // 1. Lấy thông tin cơ bản sản phẩm trước (Bắt buộc phải có ID để query các cái sau)
  const products = await query({
    query: `
      SELECT p.*, b.name as brand_name, c.name as category_name
      FROM products p 
      LEFT JOIN brands b ON p.brand_id = b.brand_id 
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.slug = ?
    `,
    values: [slug],
  });

  if (products.length === 0) return null;
  const product = products[0];

  // 2. Chạy song song 3 truy vấn phụ để tiết kiệm thời gian (Promise.all)
  const [images, notes, related] = await Promise.all([
    // Query Ảnh
    query({
      query: "SELECT image_url FROM product_images WHERE product_id = ?",
      values: [product.product_id],
    }),
    // Query Note hương
    query({
      query: `
        SELECT n.name, pn.note_type 
        FROM product_notes pn 
        JOIN NOTES n ON pn.note_id = n.note_id 
        WHERE pn.product_id = ?
      `,
      values: [product.product_id],
    }),
    // Query Sản phẩm liên quan
    query({
      query: `
        SELECT p.product_id, p.name, p.slug, p.price, pi.image_url, b.name as brand_name 
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
        WHERE p.brand_id = ? AND p.product_id != ?
        LIMIT 4
      `,
      values: [product.brand_id, product.product_id],
    }),
  ]);

  return { product, images, notes, related };
}

async function getRecommendedProducts(category_id, current_product_id) {
  const products = await query({
    query: `
      SELECT p.product_id, p.name, p.slug, p.price, 
             b.name as brand_name, pi.image_url
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      WHERE p.category_id = ? AND p.product_id != ?
      ORDER BY RAND() 
      LIMIT 10
    `,
    values: [category_id, current_product_id],
  });

  // Map dữ liệu sang format mà ProductRelatedSlider yêu cầu
  return products.map((p) => ({
    name: p.name,
    brand: p.brand_name || "Laluz Parfums",
    brandLink: {
      pathname: "/collections/all",
      query: { brand: p.brand_name },
    },
    link: `/products/${p.slug}`,
    image: p.image_url || "/images/products/default.webp",
    price: parseFloat(p.price),
  }));
}

// --- MAIN COMPONENT ---
export default async function ProductDetailPage({ params }) {
  const { slug } = await params; // Next.js 15 yêu cầu await params
  const data = await getProductData(slug);

  if (!data) {
    notFound();
  }

  const recommendedProducts = await getRecommendedProducts(
    data.product.category_id,
    data.product.product_id
  );

  const { product, images, notes, related } = data;

  // --- XỬ LÝ DỮ LIỆU ---

  // 1. Xử lý ảnh
  const imageList =
    images.length > 0
      ? images.map((img) => img.image_url)
      : ["/images/products/default.webp"];

  // 2. Format cho ProductSummary
  // Lưu ý: Đảm bảo ProductSummary là Client Component để xử lý nút "Thêm vào giỏ"
  const formattedProduct = {
    product_id: product.product_id, // Truyền đúng tên field để cartUtils dùng
    name: product.name,
    stock_quantity: product.stock_quantity,
    price: Number(product.price),
    image_url: imageList[0], // Truyền ảnh thumbnail để lưu vào cart
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

  // 3. Format thông tin chi tiết (Info Box)
  const productInfo = [
    {
      label: "Thương hiệu: ",
      value: product.brand_name || "Unknown",
      href: {
        pathname: "/collections/all",
        query: { brand: product.brand_name },
        icon: "/images/ic/ic-info-1.svg",
      },
      label: "Nồng độ: ",
      value: product.concentration || "EDP",
      icon: "/images/ic/ic-info-2.svg",
    },
    {
      label: "Dung tích: ",
      value: `${product.volume_ml} ml`,
      icon: "/images/ic/ic-info-3.svg",
    },
    {
      label: "Năm phát hành: ",
      value: product.release_year,
      icon: "/images/ic/ic-info-4.svg",
    },
    {
      label: "Giới tính: ",
      value: product.category_name || "Unisex",
      href: {
        pathname: "/collections/all",
        query: { gender: product.category_name },
      },
      icon: "/images/ic/ic-info-5.svg",
    },
  ];

  // 4. Tạo nội dung Tabs
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
    <br/>
    ${topNotes ? `<p><strong>Hương đầu:</strong> ${topNotes}.</p>` : ""}
    ${midNotes ? `<p><strong>Hương giữa:</strong> ${midNotes}.</p>` : ""}
    ${baseNotes ? `<p><strong>Hương cuối:</strong> ${baseNotes}.</p>` : ""}
  `;

  const tabs = [
    { title: "Mô tả sản phẩm", content: descriptionContent },
    {
      title: "Sử dụng và bảo quản",
      content: `<p>– Xịt ở cổ tay, sau tai, gáy.</p><p>– Không chà xát sau khi xịt.</p>`,
      showMore: true,
    },
    {
      title: "Vận chuyển và đổi trả",
      content: `<p>Miễn phí vận chuyển cho đơn hàng trên 1 triệu đồng.</p>`,
      showMore: true,
    },
  ];

  // 5. Format Related Products
  const relatedProducts = related.map((item) => ({
    name: item.name,
    brand: item.brand_name,
    brandLink: "#",
    link: `/products/${item.slug}`,
    image: item.image_url || "/images/no-image.jpg",
    price: Number(item.price),
  }));

  const benefits = [
    {
      icon: "/images/ic/imgi_292_ic-benefit-1.svg",
      text: "Cam kết chính hãng 100%",
    },
    {
      icon: "/images/ic/imgi_293_ic-benefit-2-1.svg",
      text: "Chính sách đổi hàng",
    },
    { icon: "/images/ic/imgi_294_ic-benefit-3-1.svg", text: "Tư vấn miễn phí" },
    {
      icon: "/images/ic/imgi_295_ic-benefit-4-1.svg",
      text: "Free ship đơn từ 1 triệu",
    },
  ];

  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name, active: true },
        ]}
      />

      {/* Product Detail Layout */}
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

      {/* ĐÃ XÓA: ProductSummary thừa ở đây */}

      <ProductRelatedSlider products={recommendedProducts} />
    </main>
  );
}
