"use client";

import Breadcrumb from "@/components/UI/Breadcrumb";
import RegisterForm from "@/components/Auth/RegisterForm";
import LoginImage from "@/components/Auth/LoginImage";

export default function RegisterPage() {
  return (
    <form
      action=""
      method="post"
      id="mona-register-popup"
      className="is-loading-group"
    >
      <main className="main spc-hd">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Đăng Ký", active: true },
          ]}
        />

        <section className="login">
          <div className="container">
            <div className="inner">
              <RegisterForm />
              <LoginImage />
            </div>
          </div>
        </section>
      </main>
    </form>
  );
}
