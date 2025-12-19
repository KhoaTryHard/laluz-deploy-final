import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import Breadcrumb from "@/components/UI/Breadcrumb";
import ProductDetailLayout from "@/components/Products/Detail/ProductDetailLayout";
import ProductGallery from "@/components/Products/Detail/ProductGallery";
import ProductSummary from "@/components/Products/Detail/ProductSummary";
import ProductInfoTabs from "@/components/Products/Detail/ProductInfoTabs";
import ProductReviews from "@/components/Products/Detail/ProductReviews";
import ProductRelatedSlider from "@/components/Products/Detail/ProductRelatedSlider";


export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

// Hàm lấy dữ liệu từ SQL (Chạy trên Server)
async function getProductData(slug) {
  // 1. Lấy thông tin cơ bản sản phẩm + tên thương hiệu
  const products = await query({
    query: `
      SELECT p.*, b.name as brand_name 
      FROM PRODUCTS p 
      LEFT JOIN BRANDS b ON p.brand_id = b.brand_id 
      WHERE p.slug = ?
    `,
    values: [slug],
  });

  // Nếu không tìm thấy sản phẩm -> trả về null
  if (products.length === 0) return null;
  const product = products[0];

  // 2. Lấy hình ảnh
  const images = await query({
    query: "SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = ?",
    values: [product.product_id],
  });

  // 3. Lấy các nốt hương (Hương đầu, giữa, cuối)
  const notes = await query({
    query: `
      SELECT n.name, pn.note_type 
      FROM PRODUCT_NOTES pn 
      JOIN NOTES n ON pn.note_id = n.note_id 
      WHERE pn.product_id = ?
    `,
    values: [product.product_id],
  });

  // 4. Lấy sản phẩm liên quan (Ví dụ: cùng thương hiệu, trừ sản phẩm hiện tại)
  const related = await query({
    query: `
      SELECT p.product_id, p.name, p.slug, p.price, pi.image_url, b.name as brand_name, p.category_id, c.name as name 
      FROM PRODUCTS p
      LEFT JOIN BRANDS b ON p.brand_id = b.brand_id
      LEFT JOIN CATEGORIES c ON p.category_id = c.category_id 
      LEFT JOIN PRODUCT_IMAGES pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
      WHERE p.brand_id = ? AND p.product_id != ?
      LIMIT 4
    `,
    values: [product.brand_id, product.product_id],
  });

  return { product, images, notes, related };
}

// --- MAIN COMPONENT ---
export default async function ProductDetailPage({ params }) {
  // Lấy slug từ URL
  const { slug } = await params;

  // Gọi hàm lấy dữ liệu
  const data = await getProductData(slug);

  // Nếu không có data (nhập sai URL) -> Chuyển sang trang 404
  if (!data) {
    notFound();
  }

  const { product, images, notes, related } = data;

  // --- XỬ LÝ DỮ LIỆU TỪ DB SANG FORMAT CỦA COMPONENT ---

  // 1. Xử lý ảnh: Nếu DB không có ảnh, dùng ảnh mặc định
  const imageList = images.length > 0 
    ? images.map(img => img.image_url) 
    : ["/images/products/default.webp"];

  // 2. Format lại object "product" cho ProductSummary
  const formattedProduct = {
    id: product.product_id,
    name: product.name,
    price: parseFloat(product.price), // Chuyển Decimal sang Number
    // Giả lập variations từ stock và volume (Vì DB bạn đang lưu mỗi dòng là 1 dung tích)
    variations: [
      { 
        id: product.volume_ml + "ml", 
        label: `${product.volume_ml}ML`, 
        price: parseFloat(product.price), 
        inStock: product.stock_quantity > 0 
      }
    ],
    images: imageList,
  };

  // 3. Format thông tin chi tiết (Info)
  const productInfo = [
    {
      label: "Thương hiệu: ",
      value: product.brand_name || "Unknown",
      href: `/brands/${product.brand_id}`, // Link tạm
      icon: "/images/ic/ic-info-1.svg",
    },
    {
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
    // Giả sử giới tính lưu trong description hoặc cột riêng, tạm fix cứng hoặc lấy từ DB nếu có
    {
      label: "Giới tính: ",
      value: product.category_name || "Unisex",
      href: `/collections/${product.category_id}`, 
      icon: "/images/ic/ic-info-5.svg",
    },
  ];

  // 4. Xử lý Notes để tạo HTML cho tab "Mô tả"
  const topNotes = notes.filter(n => n.note_type === 'Top').map(n => n.name).join(", ");
  const midNotes = notes.filter(n => n.note_type === 'Middle').map(n => n.name).join(", ");
  const baseNotes = notes.filter(n => n.note_type === 'Base').map(n => n.name).join(", ");

  const descriptionContent = `
    <p>${product.description || ""}</p>
    <br/>
    ${topNotes ? `<p><strong>Hương đầu:</strong> ${topNotes}.</p>` : ""}
    ${midNotes ? `<p><strong>Hương giữa:</strong> ${midNotes}.</p>` : ""}
    ${baseNotes ? `<p><strong>Hương cuối:</strong> ${baseNotes}.</p>` : ""}
  `;

  const tabs = [
    {
      title: "Mô tả sản phẩm",
      content: descriptionContent,
    },
    {
      title: "Sử dụng và bảo quản",
      content: `
      <p>– Xịt ở cổ tay, sau tai, gáy.</p>
      <p>– Không chà xát sau khi xịt.</p>
    `,
      showMore: true,
    },
    {
      title: "Vận chuyển và đổi trả",
      content: `<p>Miễn phí vận chuyển cho đơn hàng trên 1 triệu đồng.</p>`,
      showMore: true,
    },
  ];

  // 5. Format sản phẩm liên quan
  const relatedProducts = related.map(item => ({
    name: item.name,
    brand: item.brand_name,
    brandLink: "#",
    link: `/products/${item.slug}`,
    image: item.image_url || "/images/no-image.jpg",
    price: parseFloat(item.price),
  }));

  const benefits = [
    {
      icon: "/images/ic/imgi_292_ic-benefit-1.svg",
      text: "Cam kết sản phẩm chính hãng 100% (đền 200% nếu phát hiện hàng giả)",
    },
    {
      icon: "/images/ic/imgi_293_ic-benefit-2-1.svg",
      text: "Chính sách đổi hàng và tích điểm thành viên",
    },
    {
      icon: "/images/ic/imgi_294_ic-benefit-3-1.svg",
      text: "Tư vấn & hỗ trợ gói quà miễn phí",
    },
    {
      icon: "/images/ic/imgi_295_ic-benefit-4-1.svg",
      text: "Miễn phí giao hàng cho hóa đơn từ 1 triệu",
    },
  ];

  return (
    <main className="main spc-hd spc-hd-2">
      {/* Breadcrumb Dynamic */}
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
      
      {/* Reviews - Có thể cần update logic fetch review sau */}
      <ProductReviews
        productId={product.product_id}
        productName={product.name}
      />
      
      <ProductRelatedSlider products={relatedProducts} />
    </main>
  );
}