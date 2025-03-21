import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p style={{color:"#ff80ab"}}>&copy; 2025 MobileStore. All rights reserved.</p>
        <p style={{color:"#ff80ab"}}>Liên hệ: mobilestore@gmail.com | Địa chỉ: 123 Đường Hoa Anh Đào, Hà Nội</p>
        <div className="footer-links">
          <span>Về chúng tôi</span> | <span>Chính sách bảo mật</span> | <span>Điều khoản sử dụng</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;