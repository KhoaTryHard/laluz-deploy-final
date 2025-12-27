// import AccountBreadcrumb from "@/components/Account/AccountBreadcrumb";s
import AccountSidebar from "@/components/Account/AccountSidebar";

export default function ChangePasswordPage() {
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
                  <form className="is-loading-group">
                    <div className="group-form">
                      <label>Mật khẩu cũ</label>
                      <input type="password" />
                    </div>

                    <div className="group-form">
                      <label>Mật khẩu mới</label>
                      <input type="password" />
                    </div>

                    <div className="group-form">
                      <label>Nhập lại mật khẩu</label>
                      <input type="password" />
                    </div>

                    <button className="btn btn-pri">
                      <span className="txt">Đổi mật khẩu</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
