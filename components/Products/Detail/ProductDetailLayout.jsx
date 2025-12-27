import Link from "next/link";

export default function ProductDetailLayout({ gallery, summary, info }) {
  return (
    <section className="prod-dt">
      <div className="container">
        <div className="prod-dt-inner">
          <form id="frmAddProduct">
            <input type="hidden" name="product_id" value="18124" />

            <div className="row">
              {/* LEFT */}
              <div
                id="product-18124"
                className="prod-dt-left col col-lg-8 product type-product post-18124 status-publish first instock product_cat-all has-post-thumbnail shipping-taxable purchasable product-type-variable"
              >
                <div className="prod-dt-left-it col-6">{gallery}</div>

                <div className="prod-dt-left-it col-6">{summary}</div>
              </div>

              {/* RIGHT */}
              <div className="prod-dt-right col col-lg-4">
                <div className="prod-dt-right-it">
                  <div className="box-info">
                    <div className="tt">Thông tin sản phẩm</div>

                    <ul className="info-list">
                      {info?.map((it, i) => (
                        <li className="info-item" key={i}>
                          <div className="ic-info">
                            {it.icon && <img src={it.icon} alt="" />}
                          </div>

                          <p className="txt">
                            {it.label}
                            {it.href ? (
                              <Link href={it.href} className="brand-link">
                                {it.value}
                              </Link>
                            ) : (
                              it.value
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
