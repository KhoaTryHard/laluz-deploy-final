import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm"; // Import form vừa tạo

// Hàm lấy 1 sản phẩm theo ID
async function getProduct(id) {
  const products = await query({
    query: "SELECT * FROM PRODUCTS WHERE product_id = ?",
    values: [id],
  });
  if (products.length === 0) return null;
  return products[0];
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
      <h2 className="tt-sec">Sửa Sản Phẩm #{id}</h2>
      
      {/* Gọi Component Form và truyền dữ liệu vào */}
      <EditProductForm product={productPlain} />
    </div>
  );
}