"use client";
import CartItemRow from "./CartItemRow";

// NHẬN PROPS TỪ CARTPAGE
export default function CartTable({ cartItems, onUpdateQuantity, onRemove }) {
  return (
    <div className="table-responsive">
      <table className="shop_table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "10px" }}>Sản phẩm</th>
            <th style={{ textAlign: "right", padding: "10px" }}>Tổng</th>
          </tr>
        </thead>
        <tbody>
          {/* DUYỆT QUA DANH SÁCH VÀ TRUYỀN HÀM XUỐNG CHO CARTITEMROW */}
          {cartItems.map((product) => (
            <CartItemRow
              key={product.product_id || product.id}
              item={product}
              quantity={product.quantity || 1}
              // --- QUAN TRỌNG: Truyền tiếp 2 hàm này xuống ---
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              // ------------------------------------------------
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}