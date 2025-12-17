import AccountBreadcrumb from "@/components/Account/AccountBreadcrumb";
import AccountSidebar from "@/components/Account/AccountSidebar";

export default function OrdersPage() {
  return (
    <main className="main spc-hd spc-hd-2">
      <AccountBreadcrumb />

      <section className="info-acount">
        <div className="container">
          <div className="info-acount-flex row">
            <AccountSidebar />

            <div className="info-acount-col-right col col-md-9">
              <div className="woocommerce">
                <div className="woocommerce-MyAccount-content">
                  <h2>Lịch sử đơn hàng</h2>

                  <table className="shop_table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày</th>
                        <th>Trạng thái</th>
                        <th>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>#1023</td>
                        <td>17/12/2025</td>
                        <td>Hoàn thành</td>
                        <td>3.450.000đ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
