import ProductPrice from "./ProductPrice";
import ProductVariation from "./ProductVariation";
import ProductAddToCart from "./ProductAddToCart";

export default function ProductSummary({ product }) {
  
  if (!product) return null;

  return (
    <>
      <h1 className="tt-prod-dt">{product.name}</h1>

      <div className="rating-info">
        <div className="star">
          <div className="star-list">
            <div className="star-flex star-empty">
              <i className="fa-regular fa-star icon"></i>
              <i className="fa-regular fa-star icon"></i>
              <i className="fa-regular fa-star icon"></i>
              <i className="fa-regular fa-star icon"></i>
              <i className="fa-regular fa-star icon"></i>
            </div>
          </div>
        </div>
        <span className="txt-rvw">0 đánh giá</span>
      </div>

      <a className="add-favo" href="/login">
        <img src="/template/assets/images/ic-heart.svg" alt="" />
        <span className="txt">Thêm vào yêu thích</span>
      </a>

      <ProductPrice product={product} />
      
      {/* Kiểm tra product.variations tồn tại trước khi truyền */}
      <ProductVariation options={product.variations || []} />
      
      {/* --- SỬA LỖI TẠI ĐÂY --- */}
      {/* Phải truyền prop product={product} xuống thì bên kia mới nhận được */}
      <ProductAddToCart product={product} />
      {/* ----------------------- */}

      <div className="hotline">
        HOTLINE TƯ VẤN <i className="fa-solid fa-phone-volume"></i>{" "}
        <a href="tel:0941417777">
          <span className="sdt">094 141 7777</span>
        </a>{" "}
        (9:00 - 22:00)
      </div>
    </>
  );
}