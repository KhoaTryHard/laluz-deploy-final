"use client";
import Link from "next/link";

export default function CartItemRow({ item, quantity, onUpdateQuantity, onRemove }) {
  // Format tiền
  const formatPrice = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // Lấy ID và MaxStock an toàn
  const itemId = item.product_id || item.id;
  const maxStock = (item.stock_quantity !== undefined && item.stock_quantity !== null) ? item.stock_quantity : 999;
  const currentTotal = Number(item.price) * quantity;

  return (
    <tr className="wc-block-cart-items__row">
      <td>
        <div className="product-info-wrapper">
          {/* Ảnh và Link */}
          <div className="product-image-container">
            <Link href={`/products/${item.slug}`}>
              <img src={item.image_url || "/images/products/default.webp"} alt={item.name} style={{width: '80px'}} />
            </Link>
          </div>

          <div className="product-details">
            <Link className="product-name" href={`/products/${item.slug}`}>{item.name}</Link>
            <span className="product-price-single">{formatPrice(item.price)}</span>
            {item.volume_ml && <span className="product-variant">Dung tích: {item.volume_ml} ml</span>}

            {/* --- NÚT BẤM (Đã sửa type="button") --- */}
            <div className="quantity-box" style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px'}}>
              <button
                type="button"  // <--- QUAN TRỌNG: BẮT BUỘC CÓ
                className="quantity-btn"
                onClick={() => {
                    console.log("Bấm trừ:", itemId); // Log kiểm tra
                    onUpdateQuantity(itemId, quantity - 1);
                }}
                disabled={quantity <= 1}
                style={{cursor: 'pointer', padding: '5px 10px', zIndex: 10}}
              >
                -
              </button>

              <input
                type="number"
                className="quantity-input"
                value={quantity}
                readOnly
                style={{width: '40px', textAlign: 'center'}}
              />

              <button
                type="button" // <--- QUAN TRỌNG: BẮT BUỘC CÓ
                className="quantity-btn"
                onClick={() => {
                    console.log("Bấm cộng:", itemId); // Log kiểm tra
                    if (quantity < maxStock) {
                        onUpdateQuantity(itemId, quantity + 1);
                    } else {
                        alert(`Kho chỉ có ${maxStock} sản phẩm`);
                    }
                }}
                style={{cursor: 'pointer', padding: '5px 10px', zIndex: 10}}
              >
                +
              </button>
            </div>
            {/* --------------------------------------- */}

            <button type="button" className="remove-link" onClick={() => onRemove(itemId)} style={{color: 'red', marginTop: '5px', display:'block', border:'none', background:'none', cursor:'pointer'}}>
              Xóa sản phẩm
            </button>
          </div>
        </div>
      </td>

      <td style={{ textAlign: "right" }}>
        <span className="row-total-price">{formatPrice(currentTotal)}</span>
      </td>
    </tr>
  );
}