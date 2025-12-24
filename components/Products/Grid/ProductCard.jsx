import React from "react";
import Link from "next/link";

export default function ProductCard({ product }) {

  const imageUrl = product?.image_url || product?.image || "/images/products/default.webp"; 

  const productLink = `/products/${product?.slug}`;
  
  return (
    <div className="prod-it">
      <div className="inner">
        <div className="bg"></div>

        <div className="img-prod">
          <Link href={productLink}>
             <img
               src={imageUrl}
               alt={product?.name || "Product Image"}
               style={{ width: "100%", height: "100%", objectFit: "cover" }}
             />
          </Link>
        </div>

        <div className="wr-info">
          <Link href={productLink} className="tt">
            {product?.name}
          </Link>
          <div className="stt">{product?.brand}</div>
          <div className="prc">{product?.price}</div>
        </div>
      </div>
    </div>
  );
}
