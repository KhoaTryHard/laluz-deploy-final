// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// // Đã xóa import useRouter vì không cần dùng ở đây nữa

// export default function HeaderTop() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Hàm gọi API lấy thông tin (Tách ra để tái sử dụng)
//   const fetchUser = async () => {
//     try {
//       const res = await fetch("/api/auth/me");
//       if (res.ok) {
//         const data = await res.json();
//         setUser(data);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error("Lỗi xác thực:", error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // 1. Gọi lần đầu khi vào trang
//     fetchUser();

//     // 2. Lắng nghe sự kiện "auth-change" từ trang Login
//     const handleAuthChange = () => {
//       // Khi nghe thấy tín hiệu, gọi lại API ngay lập tức
//       fetchUser();
//     };

//     window.addEventListener("auth-change", handleAuthChange);

//     // Dọn dẹp sự kiện khi component bị hủy
//     return () => {
//       window.removeEventListener("auth-change", handleAuthChange);
//     };
//   }, []);

//   // Giao diện lúc đang tải
//   if (loading) {
//     return (
//       <div className="hd-up">
//         <div className="container">
//           <div className="hd-up-inner">
//             <div className="txt-sales">
//               Đền 200% giá trị đơn nếu phát hiện hàng giả
//             </div>
//             <div className="hd-login">
//               <span style={{ color: "#ccc", fontSize: "0.9rem" }}>
//                 Checking...
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="hd-up">
//       <div className="container">
//         <div className="hd-up-inner">
//           <div className="txt-sales">
//             Đền 200% giá trị đơn nếu phát hiện hàng giả
//           </div>

//           <div className="hd-login">
//             {user ? (
//               /* --- ĐÃ ĐĂNG NHẬP --- */
//               /* Đã xóa nút Thoát theo yêu cầu */

//               <div className="hd-login-inner">
//                 <Link
//                   href="/account"
//                   style={{ display: "flex", alignItems: "center", gap: "5px" }}
//                   onClick={() => {
//                     router.refresh();
//                   }}
//                 >
//                   <div className="ic-login">
//                     <img src="/images/ic-user.svg" alt="User" />
//                   </div>
//                   <span className="txt" style={{ fontWeight: "bold" }}>
//                     {user.name || user.email || "Tài khoản"}
//                   </span>
//                 </Link>
//               </div>
//             ) : (
//               /* --- CHƯA ĐĂNG NHẬP --- */
//               <Link className="hd-login-inner" href="/login">
//                 <div className="ic-login">
//                   <img src="/images/ic-user.svg" alt="User" />
//                 </div>
//                 <span className="txt">Đăng nhập</span>
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Nếu bạn muốn dùng router.refresh(), hãy bỏ comment dòng dưới:
// import { useRouter } from "next/navigation";

export default function HeaderTop() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const router = useRouter();

  // 1. Dùng useCallback để tránh hàm bị khởi tạo lại nhiều lần không cần thiết
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" }); // Đảm bảo lấy data mới nhất
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Gọi lần đầu khi component mount
    fetchUser();

    // 2. Lắng nghe sự kiện "auth-change"
    const handleAuthChange = () => {
      setLoading(true); // Hiển thị trạng thái loading nhẹ khi đang update
      fetchUser();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [fetchUser]);

  // Giao diện Skeleton/Loading thu nhỏ để không bị nhảy layout (layout shift)
  if (loading) {
    return (
      <div className="hd-up">
        <div className="container">
          <div className="hd-up-inner">
            <div className="txt-sales">
              Đền 200% giá trị đơn nếu phát hiện hàng giả
            </div>
            <div className="hd-login">
              <span style={{ color: "#ccc", fontSize: "0.9rem" }}>
                Đang tải...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hd-up">
      <div className="container">
        <div className="hd-up-inner">
          <div className="txt-sales">
            Đền 200% giá trị đơn nếu phát hiện hàng giả
          </div>

          <div className="hd-login">
            {user ? (
              <div className="hd-login-inner">
                <Link
                  href="/account"
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                  onClick={() => {
                    router.refresh();
                  }}
                >
                  <div className="ic-login">
                    <img src="/images/ic-user.svg" alt="User" />
                  </div>
                  <span className="txt" style={{ fontWeight: "bold" }}>
                    {user.name || user.email || "Tài khoản"}
                  </span>
                </Link>
              </div>
            ) : (
              <Link className="hd-login-inner" href="/login">
                <div className="ic-login">
                  <img src="/images/ic-user.svg" alt="User" />
                </div>
                <span className="txt">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
