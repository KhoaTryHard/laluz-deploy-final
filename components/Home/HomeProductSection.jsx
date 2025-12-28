"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

import { unisexProducts } from "@/data/unisexProducts";

export default function HomeProductSection() {
  return (
    <section className="prods-home">
      <h2 className="tt-sec">
        <a href="/collections/all?gender=Unisex">NƯỚC HOA UNISEX</a>
      </h2>

      <div className="wr-prods-home">
        <Swiper
          modules={[Pagination]}
          slidesPerView={4}
          spaceBetween={20}
          pagination={{ clickable: true }}
          className="swiper-prod-home unisex"
          breakpoints={{
            320: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {unisexProducts.map((p, i) => (
            <SwiperSlide key={i}>
              <div className="prod-it">
                <div className="inner">
                  <a className="img-prod" href={p.link}>
                    <img src={p.img} alt={p.name} />
                  </a>
                  <div className="wr-info">
                    <h3 className="txt-prod tt">
                      <a className="prod-name">{p.brand}</a>
                    </h3>
                    <a className="txt-prod stt" href={p.link}>
                      {p.name}
                    </a>
                    <span className="txt-prod prc">{p.price}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
