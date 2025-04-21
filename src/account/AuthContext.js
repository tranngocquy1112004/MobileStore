import React, { createContext, useState, useEffect, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: createContext để tạo Context, useState để quản lý trạng thái cục bộ, useEffect để thực hiện các tác vụ phụ (side effects), và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện, giúp tối ưu hiệu suất

// --- Định nghĩa hằng số ---

// Key sử dụng để lưu trữ thông tin người dùng hiện tại trong localStorage
const LOCAL_STORAGE_KEY = "currentUser";

// --- Định nghĩa giá trị mặc định cho Context ---
// Giá trị này được sử dụng khi một component sử dụng Context
// mà không có Provider tương ứng ở cây component phía trên.
// Nó định nghĩa cấu trúc dữ liệu và các hàm mà Context sẽ cung cấp.
const defaultAuthContext = {
  isLoggedIn: false, // Trạng thái đăng nhập mặc định ban đầu là false (chưa đăng nhập)
  user: null, // Thông tin người dùng mặc định ban đầu là null (không có người dùng nào)
  login: () => {}, // Hàm login mặc định là một hàm rỗng không làm gì cả
  logout: () => {}, // Hàm logout mặc định là một hàm rỗng không làm gì cả
};

// --- Tạo AuthContext ---
// Sử dụng hàm createContext() của React để tạo một Context mới.
// Context này sẽ chứa trạng thái xác thực và các hàm liên quan.
// Truyền giá trị mặc định đã định nghĩa ở trên vào createContext().
export const AuthContext = createContext(defaultAuthContext);

// --- Component AuthProvider ---
// Đây là một React Component đóng vai trò là nhà cung cấp (provider) cho AuthContext.
// Nó sẽ quản lý state thực tế của trạng thái đăng nhập và thông tin người dùng,
// sau đó cung cấp state và các hàm cập nhật state đó cho tất cả các component con được bọc bởi nó.
// Prop 'children' đại diện cho các component React khác nằm bên trong AuthProvider khi sử dụng.
export const AuthProvider = ({ children }) => {
  // --- State quản lý trạng thái xác thực ---
  // State 'isLoggedIn': Một boolean để theo dõi trạng thái đăng nhập hiện tại (true nếu đã đăng nhập, false nếu chưa)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State 'user': Lưu trữ đối tượng chứa thông tin chi tiết của người dùng hiện đang đăng nhập (hoặc null nếu chưa đăng nhập)
  const [user, setUser] = useState(null);

  // --- Effect hook để khởi tạo trạng thái đăng nhập từ localStorage khi component mount ---
  // Effect này chạy một lần duy nhất sau lần render đầu tiên của component.
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY); // Cố gắng lấy dữ liệu người dùng được lưu trước đó trong localStorage bằng key 'currentUser'
    // Kiểm tra xem có dữ liệu được lưu trong localStorage hay không (chuỗi savedUser khác null hoặc undefined)
    if (savedUser) {
      try {
        // Nếu có dữ liệu, thử phân tích cú pháp (parse) chuỗi JSON thành một đối tượng JavaScript
        const parsedUser = JSON.parse(savedUser);
        // Nếu quá trình parse thành công VÀ kết quả parsedUser không phải là null hoặc undefined
        if (parsedUser) {
            setIsLoggedIn(true); // Cập nhật state isLoggedIn thành true (đã đăng nhập)
            setUser(parsedUser); // Cập nhật state user với thông tin người dùng vừa parse được
        } else {
             // Trường hợp chuỗi trong localStorage không phải là null/undefined nhưng parse ra lại là null/undefined (ví dụ: chuỗi "null")
             localStorage.removeItem(LOCAL_STORAGE_KEY); // Xóa dữ liệu không hợp lệ khỏi localStorage
             console.warn("Dữ liệu currentUser trong localStorage không hợp lệ, đã xóa."); // Ghi cảnh báo ra console
        }
      } catch (error) {
        // Nếu quá trình parse JSON thất bại (ví dụ: dữ liệu trong localStorage bị hỏng, không đúng định dạng JSON)
        console.error("Lỗi khi parse dữ liệu người dùng từ localStorage:", error); // Ghi log lỗi chi tiết ra console
        // Xóa dữ liệu lỗi khỏi localStorage để tránh lỗi lặp lại trong các lần tải trang sau
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []); // Dependency array rỗng []: Effect này chỉ chạy MỘT LẦN duy nhất sau lần render đầu tiên của component (tương tự componentDidMount) và hàm cleanup (nếu có) sẽ chạy khi component unmount.

  // --- Hàm xử lý logic khi người dùng đăng nhập ---
  // Hàm này nhận vào dữ liệu của người dùng đã đăng nhập thành công (userData).
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại một lần duy nhất
  // vì danh sách dependencies của nó rỗng. Điều này giúp các component con sử dụng hàm 'login'
  // không bị re-render không cần thiết khi AuthProvider re-render vì lý do khác.
  const login = useCallback((userData) => {
    // Lưu thông tin người dùng (userData) vào localStorage sau khi chuyển đổi nó thành chuỗi JSON.
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    setIsLoggedIn(true); // Cập nhật state isLoggedIn thành true để hiển thị trạng thái đã đăng nhập
    setUser(userData); // Cập nhật state user với thông tin chi tiết của người dùng vừa đăng nhập
  }, []); // Dependency array rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào từ scope ngoài cần theo dõi sự thay đổi.

  // --- Hàm xử lý logic khi người dùng đăng xuất ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại một lần duy nhất.
  const logout = useCallback(() => {
    // Xóa thông tin người dùng hiện tại khỏi localStorage bằng key đã định nghĩa.
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsLoggedIn(false); // Đặt lại state isLoggedIn về false để hiển thị trạng thái chưa đăng nhập
    setUser(null); // Đặt lại state user về null để không còn thông tin người dùng nào được lưu trữ
  }, []); // Dependency array rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào.

  // --- Đối tượng giá trị Context ---
  // Tạo một đối tượng JavaScript chứa tất cả các state và hàm mà chúng ta muốn chia sẻ
  // với các component con thông qua AuthContext.
  const authContextValue = {
    isLoggedIn, // Cung cấp trạng thái đăng nhập hiện tại
    user, // Cung cấp thông tin người dùng hiện tại (hoặc null)
    login, // Cung cấp hàm login (đã được memoize bằng useCallback)
    logout, // Cung cấp hàm logout (đã được memoize bằng useCallback)
  };

  return (
    // --- Cung cấp Context ---
    // Sử dụng component Provider của AuthContext để "bao bọc" các component con.
    // Thuộc tính 'value' của Provider nhận đối tượng 'authContextValue'.
    // Bất kỳ component nào nằm trong Provider này và sử dụng useContext(AuthContext)
    // đều có thể truy cập các giá trị và hàm trong 'authContextValue'.
    <AuthContext.Provider value={authContextValue}>
      {children}{" "}
      {/* children đại diện cho các component React khác được đặt giữa thẻ mở và thẻ đóng của AuthProvider */}
    </AuthContext.Provider>
  );
};

export default AuthProvider; // Export component AuthProvider làm default export để sử dụng ở các file khác (ví dụ: trong file App.js) để bọc toàn bộ ứng dụng hoặc một phần của ứng dụng cần truy cập xác thực.