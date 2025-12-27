"use client";

// import { updateProfile } from "@/lib/account";

export default function AccountProfileForm() {
  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;

    const payload = {
      name: form["name"].value,
      phone: form["phone"].value,
      birthday: form["birthday"].value,
    };

    await updateProfile(payload);
    alert("Cập nhật thành công");
  }

  return (
    <form
      className="is-loading-group"
      id="m-edit-account"
      onSubmit={handleSubmit}
    >
      <div className="form-info-acount row">
        <div className="group-form col col-md-6">
          <label className="name-group">Họ và Tên</label>
          <input name="name" defaultValue="hoanle010299" />
        </div>

        <div className="group-form col col-md-6">
          <label className="name-group">Email</label>
          <input defaultValue="hoanle010299@gmail.com" readOnly />
        </div>

        <div className="group-form col col-md-6">
          <label className="name-group">Ngày sinh</label>
          <input name="birthday" className="date" />
        </div>

        <div className="group-form col col-md-6">
          <label className="name-group">Số Điện thoại</label>
          <input name="phone" type="tel" />
        </div>
      </div>

      <button className="btn btn-pri">
        <span className="txt">Thay đổi</span>
      </button>
    </form>
  );
}
