import { adminProducts } from "@/data/admin-products";

export default function AdminProductsPage() {
  const products = adminProducts;

  return (
    <div className="container-laluz">
      {/* HEADER */}
      <div className="admin-header">
        <h2 className="tt-sec">Quản Lý Sản Phẩm</h2>

        <a href="/admin/products/create" className="btn btn-pri">
          + Thêm sản phẩm
        </a>
      </div>

      {/* TABLE */}
      <div className="box-white">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
