import React, { createContext, useState, useEffect } from "react"; // Import các hook cần thiết từ React: createContext để tạo Context, useState để quản lý state, useEffect để thực hiện side effect

// --- Định nghĩa hằng số ---

// Key sử dụng để lưu trữ thông tin người dùng hiện tại trong localStorage
const LOCAL_STORAGE_KEY = "currentUser";

// --- Định nghĩa giá trị mặc định cho Context ---
// Giá trị này được sử dụng khi một component sử dụng Context
// mà không có Provider tương ứng ở cây component phía trên.
const defaultAuthContext = {
  isLoggedIn: false, // Mặc định ban đầu là chưa đăng nhập
  user: null, // Mặc định không có thông tin người dùng
  login: () => {}, // Hàm login mặc định (hàm rỗng không làm gì cả)
  logout: () => {}, // Hàm logout mặc định (hàm rỗng không làm gì cả)
};

// --- Tạo AuthContext ---
// Sử dụng createContext để tạo một Context mới.
// Truyền giá trị mặc định đã định nghĩa ở trên.
export const AuthContext = createContext(defaultAuthContext);

// --- Component AuthProvider ---
// Đây là một component cung cấp (provider) Context.
// Nó sẽ bọc các component con cần truy cập Context xác thực và cung cấp state/hàm.
// Prop 'children' đại diện cho các component con nằm bên trong AuthProvider khi sử dụng.
export const AuthProvider = ({ children }) => {
  // --- State quản lý trạng thái xác thực ---
  // State boolean để theo dõi trạng thái đăng nhập (true nếu đã đăng nhập, false nếu chưa)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State object/null để lưu thông tin chi tiết của người dùng đang đăng nhập
  const [user, setUser] = useState(null);

  // --- Effect hook để khởi tạo trạng thái từ localStorage khi component mount ---
  // Effect này chạy một lần duy nhất sau lần render đầu tiên của component.
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY); // Lấy dữ liệu người dùng từ localStorage dựa trên key đã định nghĩa
    // Kiểm tra xem có dữ liệu được lưu trong localStorage không
    if (savedUser) {
      try {
        // Nếu có dữ liệu, thử parse chuỗi JSON thành object JavaScript
        const parsedUser = JSON.parse(savedUser);
        // Nếu parse thành công, cập nhật state:
        setIsLoggedIn(true); // Đặt trạng thái đăng nhập là true
        setUser(parsedUser); // Lưu thông tin người dùng vào state user
      } catch (error) {
        // Nếu parse thất bại (ví dụ: dữ liệu trong localStorage bị hỏng)
        console.error("Lỗi khi parse dữ liệu người dùng từ localStorage:", error); // Ghi log lỗi
        // Có thể thêm logic để xóa dữ liệu lỗi khỏi localStorage ở đây nếu cần
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []); // Dependency array rỗng []: effect chỉ chạy một lần khi component mount và clean up khi unmount.

  // --- Hàm xử lý đăng nhập ---
  // Nhận dữ liệu người dùng (ví dụ: { username, password }) khi đăng nhập thành công
  const login = (userData) => {
    // Lưu thông tin người dùng vào localStorage (chuyển đổi thành chuỗi JSON)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập thành true
    setUser(userData); // Cập nhật state user với dữ liệu người dùng
  };

  // --- Hàm xử lý đăng xuất ---
  const logout = () => {
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsLoggedIn(false); // Đặt lại trạng thái đăng nhập về false
    setUser(null); // Đặt lại state user về null (không có người dùng nào đăng nhập)
  };

  // --- Đối tượng giá trị Context ---
  // Tập hợp các state và hàm cần chia sẻ cho các component con.
  const authContextValue = {
    isLoggedIn, // Chia sẻ trạng thái đăng nhập
    user, // Chia sẻ thông tin người dùng
    login, // Chia sẻ hàm login
    logout, // Chia sẻ hàm logout
  };

  return (
    // Sử dụng AuthContext.Provider để cung cấp giá trị authContextValue
    // cho tất cả các component con được bọc bởi AuthProvider này.
    <AuthContext.Provider value={authContextValue}>
      {children}{" "}
      {/* children đại diện cho các component con được render bên trong Provider */}
    </AuthContext.Provider>
  );
};

export default AuthProvider; // Export AuthProvider làm default export