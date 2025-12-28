"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

export default function HomeBanner() {
  const banners = [
    {
      link: "/collections/all/",
      img: "https://laluz.vn/wp-content/uploads/2024/12/Frame-549.jpg",
    },
    {
      link: "/collections/all/",
      img: "https://laluz.vn/wp-content/uploads/2024/12/Frame-550.jpg",
    },
    {
      link: "/roja-parfums/",
      img: "https://laluz.vn/wp-content/uploads/2024/12/Frame-551.jpg",
    },
  ];

  return (
    <section className="banner-section">
      <div className="banner-slide">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000 }}
          loop
          className="swiper swiper-banner-home"
        >
          {banners.map((b, i) => (
            <SwiperSlide key={i}>
              <a href={b.link} className="bg">
                <img
                  src={b.img}
                  className="attachment-full size-full"
                  width="1531"
                  height="520"
                  alt=""
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
