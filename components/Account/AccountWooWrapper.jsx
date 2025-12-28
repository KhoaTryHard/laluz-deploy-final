import AccountProfileForm from "./AccountProfileForm";

export default function AccountWooWrapper() {
  return (
    <div className="info-acount-col-right col col-md-9 col-12">
      <div className="woocommerce">
        
        {/* ĐÃ XÓA PHẦN <nav> Ở ĐÂY VÌ ĐÃ CÓ Ở SIDEBAR TRÁI */}

        <div className="woocommerce-MyAccount-content" style={{ width: '100%' }}>
          <div className="inner">
            {/* Đây là nơi hiển thị nội dung chính (Form thông tin) */}
            <AccountProfileForm />
          </div>
        </div>
        
      </div>
    </div>
  );
}