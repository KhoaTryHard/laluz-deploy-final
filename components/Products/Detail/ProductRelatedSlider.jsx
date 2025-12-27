"use client";

import { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export default function ProductRelatedSlider({ products = [] }) {
  if (!products.length) return null;

  return (
    <div className="container">
      <section className="prods-home prod-related">
        <h3
          className="tt"
          style={{
            color: "#242424",
            fontSize: "2.4rem",
            fontWeight: 500,
            textTransform: "uppercase",
            marginBottom: "2.5rem",
          }}
        >
          Sản phẩm liên quan
        </h3>

        <div className="wr-prods-home">
          <Swiper
            modules={[Navigation]}
            slidesPerView={4}
            spaceBetween={24}
            navigation={{
              prevEl: ".prod-related .btn-navi.prev",
              nextEl: ".prod-related .btn-navi.next",
            }}
            className="swiper swiper-prod-home"
          >
            {products.map((product, index) => (
              <SwiperSlide key={index}>
                <ProductItem product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}

/* ===================== */
/* MARKUP GIỐNG HỆT ProductSlider */
/* ===================== */

function ProductItem({ product }) {
  const initialImage = product.image || "/images/products/default.webp";
  const [imgSrc, setImgSrc] = useState(initialImage);

  return (
    <div className="prod-it">
      <div className="inner">
        <div className="bg"></div>

        <Link className="img-prod" href={product.link}>
          <img
            src={imgSrc}
            width="900"
            height="900"
            className="attachment-full size-full wp-post-image"
            alt={product.name}
            loading="lazy"
            style={{ objectFit: "cover" }}
            onError={() => setImgSrc("/images/products/default.webp")}
          />
        </Link>

        <div className="wr-info">
          <h3 className="txt-prod tt">
            <Link className="prod-name" href={product.link}></Link>
            <Link href={product.brandLink}>{product.brand}</Link>
          </h3>

          <Link className="txt-prod stt" href={product.link}>
            {product.name}
          </Link>

          <span className="txt-prod prc monawoo-price">
            <span className="woocommerce-Price-amount amount">
              <bdi>
                {Number(product.price).toLocaleString("vi-VN")}
                <span className="woocommerce-Price-currencySymbol">₫</span>
              </bdi>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
