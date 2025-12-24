import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // Xóa cookie xác thực
  cookieStore.delete("auth_token");
  
  // Xóa thêm các cookie khác nếu cần
  cookieStore.delete("user_gender"); 

  return NextResponse.json({ message: "Đăng xuất thành công" });
}