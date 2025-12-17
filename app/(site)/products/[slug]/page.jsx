import Breadcrumb from "@/components/UI/Breadcrumb";
import ProductDetailLayout from "@/components/Products/Detail/ProductDetailLayout";
import ProductGallery from "@/components/Products/Detail/ProductGallery";
import ProductSummary from "@/components/Products/Detail/ProductSummary";
import ProductInfoTabs from "@/components/Products/Detail/ProductInfoTabs";
import ProductReviews from "@/components/Products/Detail/ProductReviews";
import ProductRelatedSlider from "@/components/Products/Detail/ProductRelatedSlider";

export default function ProductDetailPage({ params }) {
  const product = {
    id: 18100,
    name: "parfums-de-marly-castley-edp",
    price: 3350000,
    variations: [
      { id: "80ml", label: "80ML", price: 3350000, inStock: true },
      { id: "10ml", label: "MẪU THỬ 10ML", price: 450000, inStock: true },
    ],
    images: [
      "/images/products/imgi_8_variant_images-size-42floz-3700578506757-2.webp",
      "/images/products/imgi_7_parfums-de-marly-castley-2025-edp.webp",
    ],
  };

  const productInfo = [
    {
      label: "Thương hiệu: ",
      value: "Jean Paul Gaultier",
      href: "/jean-paul-gaultier",
      icon: "/images/ic/ic-info-1.svg",
    },
    {
      label: "Nồng độ: ",
      value: "Eau De Parfum",
      icon: "/images/ic/ic-info-2.svg",
    },
    {
      label: "Độ lưu mùi: ",
      value: "6–8h",
      icon: "/images/ic/ic-info-3.svg",
    },
    {
      label: "Độ tỏa hương: ",
      value: "Xa",
      icon: "/images/ic/ic-info-4.svg",
    },
    {
      label: "Giới tính: ",
      value: "Nữ",
      icon: "/images/ic/ic-info-5.svg",
    },
  ];
  const tabs = [
    {
      title: "Mô tả sản phẩm",
      content: `
      <p><strong>Hương đầu (Top notes):</strong> Cam Bergamot, Gừng, Hạt tiêu đen.</p>
      <p><strong>Hương giữa (Heart notes):</strong> Cam đắng, Trà Maté, Timur.</p>
      <p><strong>Hương cuối (Base notes):</strong> Benzoin, Gỗ Akigala, Labdanum.</p>
    `,
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
      content: ``,
      showMore: true,
    },
  ];

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
  const relatedProducts = [
    {
      name: "Parfums De Marly Perseus EDP",
      brand: "Parfums de Marly",
      brandLink: "/parfums-de-marly",
      link: "/parfums-de-marly-perseus-edp",
      image: "/images/products/imgi_7_parfums-de-marly-castley-2025-edp.webp",
      price: 5950000,
    },
    {
      name: "Parfums De Marly Althair",
      brand: "Parfums de Marly",
      brandLink: "/parfums-de-marly",
      link: "/parfums-de-marly-althair",
      image: "/images/products/imgi_7_parfums-de-marly-castley-2025-edp.webp",
      price: 5950000,
    },
  ];

  return (
    <main className="main spc-hd spc-hd-2">
      {/* Breadcrumb – đã đúng structure */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.name, active: true },
        ]}
      />

      {/* Product Detail Layout */}
      <ProductDetailLayout
        gallery={<ProductGallery images={product.images} />}
        summary={<ProductSummary product={product} />}
        info={productInfo}
      />
      <ProductInfoTabs tabs={tabs} benefits={benefits} />
      <ProductReviews
        productId={18112}
        productName="Parfums De Marly Castley EDP"
      />
      <ProductRelatedSlider products={relatedProducts} />
    </main>
  );
}
