"use client";

import Breadcrumb from "@/components/UI/Breadcrumb";
import LoginForm from "@/components/Auth/LoginForm";
import LoginImage from "@/components/Auth/LoginImage";

export default function LoginPage() {
  return (  
    <div id="mona-login-form" className="is-loading-group">
      <main className="main spc-hd spc-hd-2">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Đăng Nhập", active: true },
          ]}
        />
        <section className="login">
          <div className="container">
            <div className="inner">
              <LoginForm />
              <LoginImage />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}