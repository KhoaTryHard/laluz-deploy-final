import HomeBanner from "@/components/Home/HomeBanner";
import WhyChoose from "@/components/Home/WhyChoose";
import ProductSlider from "@/components/Products/Slider/ProductSlider";
import { homeStudio } from "@/data/homeStudio";

import { homeProducts } from "@/data/homeProducts";

export default function Home() {
  return (
    <main className="main spc-hd ">
      <h1 className="mona-hidden-tt">
        LALUZ PARFUMS - Địa chỉ bán nước hoa chính hãng giá tốt
      </h1>

      {/* WP wrapper */}
      <div className="has-banner">
        <HomeBanner />

        <ProductSlider name={"nước hoa unisex"} products={homeProducts} />
        <HomeBanner />

        <ProductSlider name={"nước hoa nam"} products={homeProducts} />
        <HomeBanner />

        <ProductSlider name={"nước hoa nữ"} products={homeProducts} />

        <WhyChoose />

        {/* <ProductSlider name={"STUDIO"} products={homeStudio} /> */}
      </div>
    </main>
  );
}
