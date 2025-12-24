"use client";

import { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

export default function ProductSlider({
  products = [],
  name = "",
  link = "#",
}) {
  if (!products.length) return null;

  return (
    <section className="prods-home">
      <h2 className="tt-sec">
        <Link href={link}>{name}</Link>
      </h2>

      <div className="wr-prods-home">
        <Swiper
          modules={[Pagination, Autoplay]}
          loop
          speed={800}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          spaceBetween={24}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            480: { slidesPerView: 1.4 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4 },
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
  );
}

function ProductItem({ product }) {

  const initialImage = product.image_url || product.image || "/images/products/default.webp";
  const [imgSrc, setImgSrc] = useState(initialImage);
  const productLink = product.slug ? `/products/${product.slug}` : "#";

  return (
    <div className="prod-it">
      <div className="inner">
        <div className="bg"></div>

        <Link className="img-prod" href={productLink}>
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
            <Link className="prod-name" href={productLink}></Link>
            <Link href={productLink}>{product.brand}</Link>
          </h3>

          <Link className="txt-prod stt" href={productLink}>
            {product.name}
          </Link>

          <span className="txt-prod prc monawoo-price">
            <span className="woocommerce-Price-amount amount">
              <bdi>
                {product.price}
              </bdi>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}