"use client";

import { AccountGuard } from "@/components/Account/AccountGuard";

export default function AccountLayout({ children }) {
  return <AccountGuard>{children}</AccountGuard>;
}
