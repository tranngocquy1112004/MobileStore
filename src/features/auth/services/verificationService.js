import emailjs from "@emailjs/browser";
import { MESSAGES } from "../models/constants";

export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendVerificationEmail = (userData, code, setMessage) => {
  const templateParams = {
    user_name: userData.username || "Người dùng",
    to_email: userData.email,
    verification_code: code,
  };

  if (!templateParams.to_email || !templateParams.to_email.trim()) {
    setMessage(MESSAGES.EMPTY_EMAIL);
    return;
  }

  if (!process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID) {
    setMessage(MESSAGES.MISSING_TEMPLATE_ID);
    return;
  }

  emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      (response) => {
        console.log("Email xác nhận gửi thành công:", response.status, response.text);
        setMessage(MESSAGES.CODE_SENT);
      },
      (error) => {
        console.error("Lỗi gửi email xác nhận:", error);
        setMessage(`Gửi mã xác nhận thất bại: ${error.message || "Lỗi không xác định"}`);
      }
    );
};
