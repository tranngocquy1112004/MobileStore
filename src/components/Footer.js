import React from "react";
import "./Footer.css";

/**
 * Component Footer - Hiển thị phần chân trang của website
 * Bao gồm thông tin bản quyền, thông tin liên hệ và các liên kết hữu ích
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Thông tin bản quyền */}
        <p style={{color:"#ff80ab"}}>&copy; 2025 MobileStore. All rights reserved.</p>
        
        {/* Thông tin liên hệ */}
        <p style={{color:"#ff80ab"}}>Liên hệ: mobilestore@gmail.com | Địa chỉ: 123 Đường Hoa Anh Đào, Hà Nội</p>
        
        {/* Các liên kết hữu ích */}
        <div className="footer-links">
          <span>Về chúng tôi</span> | <span>Chính sách bảo mật</span> | <span>Điều khoản sử dụng</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;