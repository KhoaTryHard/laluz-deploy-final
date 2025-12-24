import UserForm from "@/app/(admin)/admin/components/users/UserForm";

export default function CreateAdminPage() {
  return (
    <div className="container-laluz">
      <h2 className="tt-sec">Tạo tài khoản Admin</h2>
      <UserForm mode="create" />
    </div>
  );
}
