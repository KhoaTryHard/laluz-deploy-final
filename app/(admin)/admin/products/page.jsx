<<<<<<< HEAD
import { adminProducts } from "@/data/admin-products";

export default function AdminProductsPage() {
  const products = adminProducts;
=======
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
>>>>>>> 2712

  return (
    <div className="container-laluz">
      {/* HEADER */}
<<<<<<< HEAD
      <div className="admin-header">
        <h2 className="tt-sec">Quản Lý Sản Phẩm</h2>

        <a href="/admin/products/create" className="btn btn-pri">
          + Thêm sản phẩm
        </a>
=======
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
>>>>>>> 2712
      </div>
      {/* FILTER BAR */}
      <ProductFilterBar categories={categories} />
      {/* TABLE */}
      <div className="box-white">
        <table className="admin-table">
          <thead>
            <tr>
<<<<<<< HEAD
              <th>#</th>
              <th>Ảnh</th>
=======
              <th>ID</th>
>>>>>>> 2712
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
<<<<<<< HEAD
            {products.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>

                {/* IMAGE */}
                <td>
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="admin-thumb"
                  />
                </td>

                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>

                <td>
                  {p.status === "active" ? (
                    <span className="status success">Đang bán</span>
                  ) : (
                    <span className="status danger">Hết hàng</span>
                  )}
                </td>

                <td className="admin-actions">
                  <a
                    href={`/admin/products/${p.id}`}
                    className="btn btn-second btn-sm"
                  >
                    Sửa
                  </a>
                  <button className="btn btn-four btn-sm">Xóa</button>
=======
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
>>>>>>> 2712
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
