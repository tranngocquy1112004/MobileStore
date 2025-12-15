# MobileStore

Ứng dụng React mô phỏng cửa hàng bán điện thoại: duyệt sản phẩm, lọc/sắp xếp, giỏ hàng, thanh toán gửi email xác nhận, quản lý đơn, hồ sơ người dùng và trang quản trị.

## Công nghệ & script
- React 18, React Router v6, Context API, hooks tự viết.
- UI cơ bản bằng CSS thủ công + slick-carousel cho slider.
- Lưu trữ phía client bằng `localStorage`; gửi email qua EmailJS.
- Script: `npm start`, `npm run build`, `npm test`, `npm run deploy` (gh-pages).
- ENV cần: `REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID`, `REACT_APP_EMAILJS_PUBLIC_KEY`, `REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID` (đang khai báo trong `.env`).

## Cấu trúc thư mục & chức năng chi tiết

### Root
- `package.json`: khai báo dependency (react, react-router-dom, react-slick, emailjs, testing-library…), script build/start/deploy.
- `netlify.toml`: cấu hình build Netlify (chạy `npm run build`, publish `build/`, tắt BROWSER/PORT, tắt CI eslint errors).
- `.env`: key EmailJS phục vụ gửi mail đăng ký/đặt hàng.

### `src/index.js`
- Entry point tạo `root`, bọc `App` trong `React.StrictMode` và gọi `reportWebVitals`.

### `src/App.jsx`
- Khởi tạo `AuthProvider` và `CartProvider` bao quanh `HashRouter`.
- Định nghĩa `ProtectedRoute` kiểm tra `AuthContext.isLoggedIn`, nếu chưa đăng nhập sẽ `Navigate` về `/`.
- Routing: `/` (Account), `/home` (ProductPage), `/products/:id`, `/cart`, `/orders`, `/checkout`, `/profile` đều bảo vệ; `/admin` chưa bảo vệ; fallback `*` điều hướng về `/`. Header/Footer hiển thị mọi trang.

### Context
- `context/AuthContext.js`: tạo `AuthContext`; đọc/lưu/xóa `currentUser` trong `localStorage`; `login` chuẩn hóa email, set state; `logout` clear storage. `useEffect` nạp user khi mount.
- `context/CartContext.js`: lưu giỏ hàng theo user key `cart_{username}` trong `localStorage`; `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`; tính `totalPrice` bằng `useMemo`; tự nạp/lưu giỏ khi user đổi.

### Hooks & utils chung
- `hooks/useDebounce.js`: trả về giá trị debounce theo delay bằng `setTimeout/clearTimeout`.
- `utils/formatters.js`: `formatCurrency(value)` format tiền VND (Intl).
- `shared/storage.js`: helper đọc/ghi JSON `localStorage` với fallback và log lỗi.
- `shared/userService.js`: đọc/ghi danh sách user từ key `users`.
- `data/index.js`: JSDoc typedef cho Product/CartItem/Address/Order/User dùng làm tài liệu kiểu.

### Layout
- `features/layout/Header.jsx`: lấy `AuthContext` + `CartContext`, tính tổng quantity (`calculateCartItemCount`), nút đăng nhập/đăng xuất, link cart, link admin khi `role === 'admin'`, điều hướng sau logout, hiển thị tên `getDisplayName`.
- `features/layout/Footer.jsx`: footer tĩnh (copyright, liên hệ, liên kết).

### Auth (`features/auth`)
- `Account.jsx`: màn đăng nhập/đăng ký/quên mật khẩu; điều hướng `/home` khi đã login; init EmailJS. Luồng:
  - Đăng ký: kiểm tra trống/ trùng username, sinh code `generateVerificationCode`, gọi `sendVerificationEmail`, lưu `pendingUser`, chuyển `isVerifying`.
  - Xác thực: so khớp code, lưu user mới (`saveUsersToStorage`), reset form.
  - Đăng nhập: so khớp với admin mặc định (`ADMIN_CREDENTIALS`) hoặc user lưu trong storage, gọi `AuthContext.login`.
  - Quên mật khẩu: bước 1 tìm username có email, gửi code; bước 2 xác thực code + so khớp password mới/confirm rồi cập nhật storage.
  - Quản lý state form, message, toggle chế độ, logout.
- `models/constants.js`: key `users`/`currentUser`, thông báo lỗi/thành công, admin credentials.
- `services/userService.js`: wrapper đọc/ghi danh sách user từ localStorage (kèm try/catch).
- `services/verificationService.js`: `generateVerificationCode`, `sendVerificationEmail` dùng EmailJS với template ID từ ENV, validate email và cấu hình.
- Component con:
  - `AuthForm.js`: form login/register, hiện trường email khi đăng ký, nút chuyển chế độ/quên mật khẩu.
  - `VerificationForm.js`: nhập code xác thực đăng ký.
  - `ForgotPasswordUsernameForm.js`: nhập username để gửi code quên mật khẩu.
  - `ForgotPasswordResetForm.js`: nhập code + mật khẩu mới, confirm.
  - `LoggedInSection.js`: trạng thái đã đăng nhập, nút logout.

### Products (`features/products`)
- Data: `public/db.json` chứa mảng sản phẩm (brand, specs). `productService` fetch từ `${process.env.PUBLIC_URL}/db.json`, cache vào localStorage key `products`, có `loadProducts` kết hợp cache + fetch, hỗ trợ `AbortController`.
- Hooks:
  - `useProducts.js`: dùng reducer quản lý `allProducts`, `filters` (brand/search), `currentPage`, `isLoading`, `isSearching`; debounce search (`useDebounce`), lọc brand & tên, sắp xếp giá (`SORT_PRODUCTS`), phân trang (`PRODUCTS_PER_PAGE`), reset filter, trả về `filteredProducts`, `paginatedProducts`, `totalPages`, flag `showNoResults`.
  - `useProductDetail.js`: nạp sản phẩm theo id, state `product/isLoading/error/message`; `handleAddToCart` kiểm tra đăng nhập, push vào cart, đặt message, gọi callback animation, fallback điều hướng `/cart`.
- Constants: `BRANDS`, `SORT_TYPES`, `PRODUCTS_PER_PAGE`, `SEARCH_DEBOUNCE`, `PRODUCT_MESSAGES`; slider data & config trong `models/sliderData.js`.
- Pages/Components:
  - `ProductPage.jsx`: ghép `HeroSlider`, `FilterSection`, `ProductList`, `Pagination`; dispatch reducer cho filter/sort/page.
  - `ProductDetail.jsx`: lấy id URL, lấy `CartContext` & `AuthContext`, hiệu ứng bay ảnh tới nút cart (`createFlyingImageAnimation`), dùng `useProductDetail`, render `ProductDetailView`.
  - `components/HeroSlider.jsx`: slider banner dùng `react-slick` + dữ liệu `SLIDES`.
  - `FilterSection.jsx`: input search, `BrandFilter` button group, sort tăng/giảm giá, nút reset filter.
  - `ProductList.jsx`: loading/search/no-results state, render `ProductCard` grid.
  - `ProductCard.jsx`: card sản phẩm, link chi tiết.
  - `ProductDetailView.jsx`: hiển thị ảnh, giá (`formatCurrency`), mô tả, `ProductSpecs`, message trạng thái, nút Add to Cart & Back.
  - `ProductSpecs.jsx`: liệt kê thông số nếu có.
  - `Pagination.jsx`: điều khiển trang đơn giản.

### Cart (`features/cart`)
- `CartPage.jsx`: dùng `useCartPage` lấy cart, tổng, guard login; hiển thị lỗi, trạng thái giỏ trống, list `CartItem`, `CartSummary`, link checkout/back.
- `services/useCartPage.js`: đọc context, tính `cartTotal`, guard nếu chưa login/giỏ trống, điều hướng checkout, quản lý thông báo `guardMessage` & `error`.
- `models/constants.js`: thông báo UI.
- Components:
  - `CartItem.jsx`: render item, nút +/- quantity, subtotal (`formatCurrency`), nút xóa; validate dữ liệu.
  - `CartSummary.jsx`: tổng tiền, nút tới checkout (disabled nếu chưa login), thông báo cần đăng nhập.
  - `EmptyCartMessage.jsx`: trạng thái giỏ trống + link về shop.

### Checkout (`features/checkout`)
- `index.js` (CheckoutPage): guard login/cart trống; hiển thị message; render `OrderSummary`, khu nhập/chọn địa chỉ, `ShippingPreview`; đặt hàng bằng `useCheckout`.
- `services/useCheckout.js`: state `shippingInfo`, address đã lưu, form thủ công, message; load EmailJS; preload địa chỉ đầu tiên nếu có; handler chọn địa chỉ lưu, nhập thủ công, toggle form; `handlePlaceOrder` validate shipping info/email, tạo order (id = timestamp, status mặc định), đọc/ghi `orders` storage, gửi email (`sendEmailConfirmation`), clear cart & điều hướng `/orders`.
- `services/helpers.js`: `calculateCartTotal`, `readOrdersFromStorage`, `saveOrdersToStorage`, `initializeEmailJS`, `sendEmailConfirmation` (compose templateParams, gọi EmailJS, báo lỗi qua `setMessage`).
- `models/constants.js`: key `orders`, thông báo thành công/lỗi, yêu cầu email hợp lệ.
- Components:
  - `OrderSummary.js`: liệt kê cart, tổng tiền, nút quay lại giỏ nếu trống.
  - `SavedAddressSelector.js`: radio chọn địa chỉ đã lưu, nút mở form nhập mới.
  - `ManualAddressForm.js`: form nhập địa chỉ mới, submit đặt hàng nếu hợp lệ.
  - `ShippingPreview.js`: xem trước địa chỉ sẽ giao.

### Orders (`features/orders`)
- `OrderHistory.jsx`: guard login, dùng `useUserOrders` để lấy đơn theo user, render `OrderStatus` (loading/error/no orders) và list `OrderItem`.
- `services/useUserOrders.js`: reducer quản lý `userOrders/isLoading/error`; đọc tất cả đơn bằng `readOrders`, lọc theo `user.username`, sắp xếp mới nhất trước.
- `services/orderService.js`: wrapper `readOrders`/`saveOrders` dùng storage helper với key `orders`.
- `models/constants.js`: thông báo lỗi và `ORDER_STATUS` enum.
- Components:
  - `OrderStatus.jsx`: hiển thị loading/error/no orders, nút reload khi lỗi.
  - `OrderItem.jsx`: hiển thị thông tin đơn, tổng tiền (`formatCurrency`), địa chỉ, danh sách item (`OrderItemsList`).
  - `OrderItemsList.jsx`: liệt kê từng item với quantity và giá.

### User Profile (`features/profile`)
- `UserProfilePage.jsx`: gọi `useUserProfilePage`; nếu không login trả về null; render `UserProfileView`.
- `services/useUserProfilePage.js`: reducer `profileReducer` cho 3 form (profile/password/address) + active section; đọc/lưu users từ `localStorage users`, validate mật khẩu (`validatePasswordChange`) và địa chỉ (`validateAddress`); `updateUserAndContext` cập nhật storage + gọi `AuthContext.login`; `handleSubmitProfileUpdate`, `handleSubmitPasswordChange` (logout sau đổi pass), `handleAddAddress`, `handleDeleteAddress`, `setActiveSection`.
- `models/constants.js`: key users, `MIN_PASSWORD_LENGTH`, `LOGOUT_DELAY`, form ids, menu `SECTIONS`, thông báo lỗi/thành công.
- `components/UserProfileView.jsx`: UI điều hướng section; gồm:
  - `ProfileForm`: hiển thị username khóa, cập nhật email/phone.
  - `PasswordForm`: đổi mật khẩu, enforce `minLength`.
  - `AddressForm`: thêm/xóa địa chỉ, render danh sách.
  - Section "orders": nhúng `OrderHistory`.
  - Link quay lại `/home`. Có hàm validate props cho từng form.

### Admin (`features/admin`)
- `index.js`: AdminDashboard đọc dữ liệu qua `useAdminData`, hiển thị loading/error, danh sách người dùng và đơn tương ứng.
- `services/useAdminData.js`: load users + orders từ storage, sort orders theo date desc, state `users/orders/isLoading/error`; `handleDeleteUser` (confirm, xóa user + đơn, lưu lại storage), `userOrdersMap` tạo map username -> orders; `formatOrderTotal` dùng `formatCurrency`.
- `models/constants.js`: key storage `users/orders`, thông báo lỗi load/save.
- Components:
  - `components/UserItem.js`: render thông tin user, nút xóa, danh sách đơn của user (dùng `OrderItem`).
  - `components/OrderItem.js`: hiển thị đơn (date, total, shipping info, list items).

### Style & assets
- `styles/*.css`: stylesheet riêng cho từng page: `Header.css`, `Footer.css`, `Account.css`, `ProductPage.css`, `ProductDetail.css`, `CartPage.css`, `CheckoutPage.css`, `OrderHistory.css`, `UserProfilePage.css`, `AdminDashboard.css`.
- `public/index.html`, `manifest.json`, `favicon.ico`, `logo192/512.png`, `robots.txt`: scaffold CRA.
- `public/db.json`: dữ liệu sản phẩm dùng cho fetch/cache.

### Khác
- `setupTests.js`: cấu hình jest-dom cho testing.
- `reportWebVitals.js`: helper đo hiệu năng (CLS/FID/FCP/LCP/TTFB) khi cung cấp callback.

## Luồng dữ liệu chính
- Xác thực: `Account` đọc/ghi user vào `localStorage users`; `AuthContext` giữ `currentUser` và truyền xuống app; admin đăng nhập bằng credential cố định.
- Giỏ hàng: `CartContext` lưu theo từng `username`, đồng bộ `localStorage`; Cart/Checkout lấy từ đây.
- Sản phẩm: fetch `public/db.json`, cache `localStorage products`; lọc/sort/search/pagination với reducer + debounce.
- Đặt hàng: `Checkout` tạo order, lưu vào `localStorage orders`, gửi email xác nhận, clear cart, chuyển `/orders`.
- Đơn hàng/Hồ sơ/Admin: `OrderHistory` lọc theo user; `UserProfile` chỉnh sửa thông tin, đổi pass, quản lý địa chỉ; `AdminDashboard` xem tất cả user/đơn và xóa.
