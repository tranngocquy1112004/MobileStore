export const ERROR_MESSAGES = {
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem đơn hàng.",
  NO_ORDERS: "Bạn chưa có đơn hàng nào",
  LOADING: "Đang tải lịch sử đơn hàng...",
  STORAGE_ERROR: "Không thể lấy dữ liệu đơn hàng từ bộ nhớ. Vui lòng thử lại.",
  LOAD_ERROR: "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const LOCAL_STORAGE_ORDERS_KEY = "orders";
