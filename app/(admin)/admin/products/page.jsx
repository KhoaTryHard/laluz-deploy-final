// app/(admin)/admin/products/page.jsx
import { query } from "@/lib/db";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton"; // Import nút xóa vừa tạo
import ProductFilterBar from "../components/ProductFilterBar";

// Hàm lấy danh sách sản phẩm từ SQL
async function getProducts({ search = "", category = "" }) {
  let sql = `
    SELECT 
      p.product_id,
      p.name,
      p.price,
      p.stock_quantity,
      p.category_id
    FROM products p
    WHERE p.is_deleted = 0
  `;

  const values = [];

  // 🔍 Tìm theo tên
  if (search) {
    sql += " AND p.name LIKE ?";
    values.push(`%${search}%`);
  }

  // 🗂 Lọc theo category
  if (category === "null") {
    sql += " AND p.category_id IS NULL";
  } else if (category) {
    sql += " AND p.category_id = ?";
    values.push(category);
  }

  sql += " ORDER BY p.product_id DESC";

  return query({ query: sql, values });
}
async function getCategories() {
  return query({
    query: `
      SELECT category_id, name
      FROM categories
      ORDER BY name ASC
    `,
  });
}

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;

  const products = await getProducts({
    search: params.q || "",
    category: params.category || "",
  });

  const categories = await getCategories();

  // Hàm format tiền tệ (VND)
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="container-laluz">
      {/* HEADER */}
      <div className="row">
        <div className="col-xg-6">
          <h2 className="tt-sec">Quản Lý Sản Phẩm</h2>
        </div>
        <div className="col-xg-6" style={{ textAlign: "right" }}>
          {/* Link dẫn tới trang Thêm mới chúng ta đã làm */}
          <Link href="/admin/products/new" className="btn btn-pri">
            <i className="fas fa-plus-circle"></i> Thêm sản phẩm
          </Link>
        </div>
      </div>
      {/* FILTER BAR */}
      <ProductFilterBar categories={categories} />
      {/* TABLE */}
      <div className="box-white">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.product_id}>
                  <td>#{p.product_id}</td>

                  {/* Tên sản phẩm */}
                  <td>
                    <strong>{p.name}</strong>
                  </td>

                  {/* Giá bán */}
                  <td style={{ color: "#d33", fontWeight: "bold" }}>
                    {formatPrice(p.price)}
                  </td>

                  {/* Tồn kho */}
                  <td>{p.stock_quantity}</td>

                  {/* Trạng thái (Logic: Còn hàng > 0 là Active) */}
                  <td>
                    {p.stock_quantity > 0 ? (
                      <span className="status success">Đang bán</span>
                    ) : (
                      <span className="status danger">Hết hàng</span>
                    )}
                  </td>

                  {/* Hành động */}
                  <td className="admin-actions">
                    {/* Nút Sửa: Dẫn tới trang [id] */}
                    <Link
                      href={`/admin/products/${p.product_id}`}
                      className="btn btn-second btn-sm"
                      style={{ marginRight: "5px" }}
                    >
                      Sửa
                    </Link>

                    {/* Nút Xóa: Component Client */}
                    <DeleteProductButton id={p.product_id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Chưa có sản phẩm nào. Hãy thêm mới!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
