"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AccountGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) return null; 

  return children;
}
