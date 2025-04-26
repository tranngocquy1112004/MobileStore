// Import các hook cần thiết từ thư viện React:
// createContext: Để tạo Context (một cách để chia sẻ dữ liệu giữa các component mà không cần truyền props thủ công qua mọi cấp).
// useState: Để quản lý trạng thái cục bộ (trạng thái đăng nhập và thông tin người dùng).
// useEffect: Để thực hiện các tác vụ phụ (side effects) như đọc dữ liệu từ localStorage khi component được mount.
// useCallback: Để ghi nhớ (memoize) các hàm xử lý sự kiện (login, logout), giúp tối ưu hiệu suất bằng cách ngăn các hàm này được tạo lại không cần thiết qua mỗi lần render.
import React, { createContext, useState, useEffect, useCallback } from "react";

// --- Định nghĩa hằng số ---

// Key (khóa) sử dụng để lưu trữ thông tin người dùng hiện tại trong localStorage của trình duyệt.
// Việc sử dụng hằng số giúp tránh gõ sai key ở các nơi khác nhau trong ứng dụng và dễ dàng quản lý/thay đổi key nếu cần.
const LOCAL_STORAGE_KEY = "currentUser";

// --- Định nghĩa giá trị mặc định cho Context ---
// Giá trị này được sử dụng bởi các component con khi chúng gọi useContext(AuthContext)
// trong trường hợp Context Provider tương ứng (AuthProvider) chưa được render ở cây component phía trên.
// Nó định nghĩa cấu trúc dữ liệu và các hàm mà Context sẽ cung cấp, giúp IDE gợi ý code tốt hơn
// và cung cấp giá trị fallback an toàn nếu Context không được cung cấp đúng cách.
const defaultAuthContext = {
  isLoggedIn: false, // Trạng thái đăng nhập mặc định ban đầu là false (chưa đăng nhập)
  user: null, // Thông tin người dùng mặc định ban đầu là null (không có người dùng nào đang đăng nhập)
  login: () => {}, // Hàm login mặc định là một hàm rỗng không làm gì cả. Đây chỉ là placeholder.
  logout: () => {}, // Hàm logout mặc định là một hàm rỗng không làm gì cả. Đây chỉ là placeholder.
};

// --- Tạo AuthContext ---
// Sử dụng hàm createContext() của React để tạo một Context mới có tên là AuthContext.
// Context này sẽ chứa trạng thái xác thực và các hàm liên quan (login, logout).
// Truyền giá trị mặc định đã định nghĩa ở trên vào createContext().
// EXPORT AuthContext để các component khác có thể import và sử dụng hook useContext(AuthContext).
export const AuthContext = createContext(defaultAuthContext);

// --- Component AuthProvider ---
// Đây là một React Component đóng vai trò là nhà cung cấp (provider) cho AuthContext.
// Nó sẽ quản lý state thực tế của trạng thái đăng nhập (isLoggedIn) và thông tin người dùng (user),
// sau đó cung cấp state và các hàm cập nhật state đó (login, logout) cho tất cả các component con
// được bọc bởi component AuthProvider này.
// Prop 'children' đại diện cho các component React khác nằm bên trong AuthProvider khi sử dụng (ví dụ: <AuthProvider><App /></AuthProvider>).
// EXPORT AuthProvider làm default export để có thể import và sử dụng nó để bọc ứng dụng.
export const AuthProvider = ({ children }) => {
  // --- State quản lý trạng thái xác thực ---
  // State 'isLoggedIn': Một boolean để theo dõi trạng thái đăng nhập hiện tại. Ban đầu được khởi tạo là false.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State 'user': Lưu trữ đối tượng chứa thông tin chi tiết của người dùng hiện đang đăng nhập (hoặc null nếu chưa đăng nhập). Ban đầu được khởi tạo là null.
  const [user, setUser] = useState(null);

  // --- Effect hook để khởi tạo trạng thái đăng nhập từ localStorage khi component mount ---
  // Effect này chạy một lần duy nhất sau lần render đầu tiên của component (tương tự lifecycle method componentDidMount trong class components).
  // Mục đích là kiểm tra xem có thông tin người dùng đã đăng nhập được lưu trong localStorage từ phiên trước không.
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY); // Cố gắng lấy dữ liệu người dùng được lưu trước đó trong localStorage bằng key 'currentUser'. localStorage.getItem trả về chuỗi hoặc null.

    // Kiểm tra xem có dữ liệu được lưu trong localStorage hay không (chuỗi savedUser khác null hoặc undefined)
    if (savedUser) {
      try {
        // Nếu có dữ liệu, thử phân tích cú pháp (parse) chuỗi JSON thành một đối tượng JavaScript.
        const parsedUser = JSON.parse(savedUser);

        // Nếu quá trình parse thành công VÀ kết quả parsedUser không phải là null hoặc undefined (đảm bảo dữ liệu hợp lệ)
        if (parsedUser) {
            setIsLoggedIn(true); // Cập nhật state isLoggedIn thành true (đã đăng nhập)
            setUser(parsedUser); // Cập nhật state user với thông tin người dùng vừa parse được
            console.log("Đã khôi phục trạng thái đăng nhập từ localStorage."); // Ghi log để theo dõi quá trình khôi phục
        } else {
            // Trường hợp chuỗi trong localStorage không phải là null/undefined nhưng parse ra lại là null/undefined (ví dụ: chuỗi "null" hoặc "undefined")
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
  }, []); // Dependency array rỗng []: Đảm bảo effect này chỉ chạy MỘT LẦN duy nhất sau lần render đầu tiên của component.

  // --- Hàm xử lý logic khi người dùng đăng nhập ---
  // Hàm này được cung cấp qua Context để các component con có thể gọi khi người dùng đăng nhập thành công.
  // Nhận vào dữ liệu của người dùng đã đăng nhập thành công (userData).
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại một lần duy nhất
  // vì danh sách dependencies của nó rỗng. Điều này giúp các component con sử dụng hàm 'login'
  // không bị re-render không cần thiết khi AuthProvider re-render vì lý do khác (ví dụ: state khác thay đổi).
  const login = useCallback((userData) => {
    // Lưu thông tin người dùng (userData) vào localStorage sau khi chuyển đổi nó thành chuỗi JSON.
    // Việc lưu này giúp duy trì trạng thái đăng nhập ngay cả khi người dùng đóng và mở lại trình duyệt.
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    setIsLoggedIn(true); // Cập nhật state isLoggedIn thành true để hiển thị trạng thái đã đăng nhập trên UI
    setUser(userData); // Cập nhật state user với thông tin chi tiết của người dùng vừa đăng nhập
    console.log("Người dùng đã đăng nhập:", userData?.username); // Ghi log thông báo đăng nhập thành công
  }, []); // Dependency array rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào từ scope ngoài cần theo dõi sự thay đổi.

  // --- Hàm xử lý logic khi người dùng đăng xuất ---
  // Hàm này được cung cấp qua Context để các component con có thể gọi khi người dùng muốn đăng xuất.
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại một lần duy nhất
  // vì danh sách dependencies của nó rỗng. Tương tự như hàm login, giúp tối ưu hiệu suất.
  const logout = useCallback(() => {
    // Xóa thông tin người dùng hiện tại khỏi localStorage bằng key đã định nghĩa.
    // Điều này loại bỏ dữ liệu đăng nhập đã lưu, khiến phiên đăng nhập kết thúc.
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsLoggedIn(false); // Đặt lại state isLoggedIn về false để hiển thị trạng thái chưa đăng nhập trên UI
    setUser(null); // Đặt lại state user về null để không còn thông tin người dùng nào được lưu trữ
    console.log("Người dùng đã đăng xuất."); // Ghi log thông báo đăng xuất
  }, []); // Dependency array rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào.

  // --- Đối tượng giá trị Context ---
  // Tạo một đối tượng JavaScript chứa tất cả các state và hàm mà chúng ta muốn chia sẻ
  // với các component con thông qua AuthContext.
  const authContextValue = {
    isLoggedIn, // Cung cấp trạng thái đăng nhập hiện tại (boolean)
    user, // Cung cấp thông tin người dùng hiện tại (object hoặc null)
    login, // Cung cấp hàm login (đã được memoize bằng useCallback)
    logout, // Cung cấp hàm logout (đã được memoize bằng useCallback)
  };

  return (
    // --- Cung cấp Context ---
    // Sử dụng component Provider của AuthContext để "bao bọc" các component con.
    // Thuộc tính 'value' của Provider nhận đối tượng 'authContextValue'.
    // Bất kỳ component nào nằm trong Provider này và sử dụng hook useContext(AuthContext)
    // đều có thể truy cập các giá trị và hàm được định nghĩa trong 'authContextValue'.
    <AuthContext.Provider value={authContextValue}>
      {children}{" "}
      {/* children đại diện cho các component React khác được đặt giữa thẻ mở và thẻ đóng của AuthProvider. Provider sẽ cung cấp Context cho toàn bộ cây con này. */}
    </AuthContext.Provider>
  );
};

// Export component AuthProvider làm default export.
// Điều này cho phép component này có thể được import và sử dụng dễ dàng ở các file khác
// (ví dụ: trong file App.js) để bọc toàn bộ ứng dụng hoặc một phần của ứng dụng cần truy cập xác thực.
export default AuthProvider;
