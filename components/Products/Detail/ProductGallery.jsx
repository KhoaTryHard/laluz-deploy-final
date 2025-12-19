"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Thumbs } from "swiper/modules";
import { useState } from "react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

export default function ProductGallery({ images = [] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
    
  if (!images || images.length === 0) return null;

  return (
    <div id="monaGalleryProduct">
      {/* TOP */}
      <div className="prod-dt-left-top">
        <div className="prod-dt-left-top-wr gallery">
          <Swiper
            modules={[Thumbs]}
            thumbs={{ swiper: thumbsSwiper }}
            className="mySwiperTop"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div
                  className="prod-dt-left-top-img gItem"
                  style={{ backgroundImage: `url(${img})` }}
                >
                  <span className="magnify">
                    <img
                      src={img}
                      alt=""
                      className="zoom"
                      data-magnify-src={img}
                    />
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="prod-dt-left-bottom">
        <div className="prod-dt-left-bottom-wr">
          <Swiper
            modules={[FreeMode, Thumbs]}
            onSwiper={setThumbsSwiper}
            slidesPerView={2}
            freeMode
            watchSlidesProgress
            className="mySwiperBottom swiper-thumbs"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="prod-dt-left-bottom-img">
                  <img src={img} alt="" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
