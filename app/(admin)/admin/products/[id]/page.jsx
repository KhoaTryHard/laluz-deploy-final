import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm"; // Import form vừa tạo

// Hàm lấy 1 sản phẩm theo ID
async function getProduct(id) {
  // 1. Lấy thông tin product
  const products = await query({
    query: "SELECT * FROM PRODUCTS WHERE product_id = ?",
    values: [id],
  });

  if (products.length === 0) return null;
  const product = products[0];

  // 2. Lấy danh sách ảnh
  const images = await query({
    query: `
      SELECT image_url 
      FROM PRODUCT_IMAGES 
      WHERE product_id = ?
      ORDER BY is_thumbnail DESC, image_id ASC
    `,
    values: [id],
  });

  const image_urls = images.map((i) => i.image_url).join(", ");

  // 3. Lấy notes theo từng tầng
  const notes = await query({
    query: `
      SELECT n.name, pn.note_type
      FROM PRODUCT_NOTES pn
      JOIN NOTES n ON pn.note_id = n.note_id
      WHERE pn.product_id = ?
    `,
    values: [id],
  });

  const top_notes = notes
    .filter((n) => n.note_type === "Top")
    .map((n) => n.name)
    .join(", ");

  const middle_notes = notes
    .filter((n) => n.note_type === "Middle")
    .map((n) => n.name)
    .join(", ");

  const base_notes = notes
    .filter((n) => n.note_type === "Base")
    .map((n) => n.name)
    .join(", ");

  // 4. Trả về object hoàn chỉnh cho form
  return {
    ...product,
    price: Number(product.price),
    image_urls,
    top_notes,
    middle_notes,
    base_notes,
  };
}

export default async function EditProductPage({ params }) {
  // Next.js 15 bắt buộc await params
  const { id } = await params;

  // Lấy dữ liệu từ SQL
  const product = await getProduct(id);

  // Nếu không thấy sản phẩm -> trang 404
  if (!product) {
    notFound();
  }

  // Chuyển đổi dữ liệu Decimal/JSON nếu cần trước khi truyền qua Client Component
  // (Với thư viện mysql2 thì số thường tự convert, nhưng để chắc chắn ta spread object)
  const productPlain = {
    ...product,
    price: Number(product.price), // Chuyển Decimal sang Number để không lỗi React
  };

  return (
    <div className="container-laluz">
      <h2 className="tt-sec">Sửa Sản Phẩm {product.name}</h2>

      {/* Gọi Component Form và truyền dữ liệu vào */}
      <EditProductForm product={productPlain} />
    </div>
  );
}
