import emailjs from "@emailjs/browser";
import { formatCurrency } from "../../utils/formatters";
import { readJsonFromStorage, writeJsonToStorage } from "../../services/storage";
import { LOCAL_STORAGE_ORDERS_KEY, MESSAGES } from "./constants";

export const calculateCartTotal = (cart) =>
  Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    : 0;

export const readOrdersFromStorage = () => readJsonFromStorage(LOCAL_STORAGE_ORDERS_KEY, []);

export const saveOrdersToStorage = (orders) => writeJsonToStorage(LOCAL_STORAGE_ORDERS_KEY, orders);

export const initializeEmailJS = () => {
  try {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
  } catch (error) {
    console.error("Lỗi khởi tạo EmailJS:", error);
  }
};

export const sendEmailConfirmation = (order, user, setMessage) => {
  const templateParams = {
    order_id: order.id,
    user_name: order.shippingInfo.name,
    user_email: user.email,
    email: user.email,
    order_total: formatCurrency(order.totalPrice),
    order_date: new Date(order.date).toLocaleString("vi-VN"),
    items: order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
  };

  emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      () => {},
      (error) => {
        console.error("Lỗi gửi email:", error);
        setMessage(
          "Đặt hàng thành công nhưng không gửi được email xác nhận."
        );
      }
    );
};
