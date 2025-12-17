import Breadcrumb from "@/components/UI/Breadcrumb";
import AboutContent from "@/components/About/AboutContent";

export default function AboutPage() {
  return (
    <main className="main spc-hd spc-hd-2">
      {/* NAV BREAD */}
      <section className="nav-bread">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Giới thiệu về LALUZ", active: true },
            ]}
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="blog-dt-sect">
        <div className="container">
          <div className="blog-inner">
            <div className="wr-mid">
              <div className="inner">
                <h1 className="tt-blog-main">Giới thiệu về LALUZ</h1>

                {/* TOÀN BỘ NỘI DUNG */}
                <AboutContent />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
