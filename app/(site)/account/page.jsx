"use client";

import Breadcrumb from "@/components/UI/Breadcrumb";
import AccountSidebar from "@/components/Account/AccountSidebar";
import AccountWooWrapper from "@/components/Account/AccountWooWrapper";

export default function AccountPage() {
  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tài khoản", active: true },
        ]}
      />

      <section className="info-acount">
        <div className="container">
          <div className="info-acount-flex row">
            <AccountSidebar />
            <AccountWooWrapper />
          </div>
        </div>
      </section>
    </main>
  );
}
