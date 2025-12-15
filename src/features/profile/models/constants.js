export const LOCAL_STORAGE_USERS_KEY = "users";
export const MIN_PASSWORD_LENGTH = 6;
export const LOGOUT_DELAY = 2000;

export const FORM_TYPES = {
  PROFILE: "profile",
  PASSWORD: "password",
  ADDRESS: "address",
};

export const SECTIONS = [
  { id: FORM_TYPES.PROFILE, label: "Thông tin cá nhân" },
  { id: FORM_TYPES.PASSWORD, label: "Đổi mật khẩu" },
  { id: "addresses", label: "Địa chỉ giao hàng" },
  { id: "orders", label: "Lịch sử đơn hàng" },
];

export const MESSAGES = {
  PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
  PASSWORD_CHANGE_FAILED: "Đổi mật khẩu thất bại. Vui lòng thử lại.",
  PASSWORDS_NOT_MATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
  EMPTY_PASSWORD_FIELDS: "Vui lòng điền đầy đủ các trường mật khẩu.",
  PASSWORD_SAME_AS_OLD: "Mật khẩu mới không được trùng với mật khẩu cũ!",
  PASSWORD_TOO_SHORT: `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`,
  INVALID_OLD_PASSWORD: "Mật khẩu cũ không chính xác.",

  PROFILE_UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
  PROFILE_UPDATE_FAILED: "Cập nhật thông tin thất bại. Vui lòng thử lại.",

  ADDRESS_SAVE_SUCCESS: "Lưu địa chỉ thành công!",
  ADDRESS_SAVE_FAILED: "Lưu địa chỉ thất bại. Vui lòng thử lại.",
  ADDRESS_DELETE_SUCCESS: "Xóa địa chỉ thành công!",
  ADDRESS_EMPTY_FIELDS: "Vui lòng điền đủ địa chỉ, tên và số điện thoại.",
  ADDRESS_REQUIRED: "Vui lòng nhập địa chỉ.",
  NAME_REQUIRED: "Vui lòng nhập tên người nhận.",
  INVALID_PHONE: "Số điện thoại không hợp lệ. Phải có 10-11 chữ số.",

  SYSTEM_ERROR_READING_USERS: "Lỗi hệ thống, không thể đọc dữ liệu người dùng.",
  SYSTEM_ERROR_UPDATING_USERS: "Lỗi hệ thống, không thể lưu dữ liệu người dùng.",
  USER_NOT_FOUND: "Không tìm thấy thông tin người dùng hiện tại.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem trang hồ sơ.",
  INVALID_PROPS: "Dữ liệu đầu vào không hợp lệ.",
};
