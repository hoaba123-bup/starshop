# Hướng dẫn Logic Chức năng Đăng ký & Đăng nhập

## 1. LOGIC CHỨC NĂNG ĐĂNG KÝ (SIGN UP)

### Mô tả tổng quan:
Chức năng đăng ký cho phép người dùng tạo tài khoản mới để sử dụng các tính năng của hệ thống như mua hàng, quản lý đơn, cập nhật thông tin cá nhân, v.v.

### Luồng xử lý chi tiết:

#### Bước 1: Truy cập trang Đăng ký
- Người dùng nhấn nút "Đăng ký" từ menu hoặc link ở trang đăng nhập
- Hệ thống điều hướng đến `/sign-up`
- Trang hiển thị form đăng ký

#### Bước 2: Hiển thị Form Đăng ký
Hệ thống hiển thị form với các trường:
- **Họ và tên** (bắt buộc)
- **Email** (bắt buộc)
- **Mật khẩu** (bắt buộc)
- **Xác nhận mật khẩu** (bắt buộc)

#### Bước 3: Nhập Thông tin & Nhấn Đăng ký
Frontend (`SignUp.tsx`):
```
1. Người dùng nhập đầy đủ thông tin vào form
2. Nhấn nút "Đăng ký"
3. Component kích hoạt hàm handleSubmit()
4. Thực hiện validation phía client
```

#### Bước 4: Validation Phía Client
File: `src/utils/validation.ts`

**Kiểm tra các trường bắt buộc:**
- Họ tên: không được để trống
- Email: không được để trống
- Mật khẩu: không được để trống
- Xác nhận mật khẩu: không được để trống

**Kiểm tra định dạng Email:**
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Nếu sai: Lỗi "Email không đúng định dạng"

**Kiểm tra độ mạnh Mật khẩu:**
- Ít nhất 6 ký tự
- Chứa ít nhất 1 chữ hoa (A-Z)
- Chứa ít nhất 1 chữ thường (a-z)
- Chứa ít nhất 1 chữ số (0-9)

**Kiểm tra Xác nhận Mật khẩu:**
- Phải trùng khớp với Mật khẩu
- Nếu không: Lỗi "Mật khẩu xác nhận không trùng khớp"

**Nếu validation thất bại:**
- Hiển thị thông báo lỗi dưới mỗi field
- Giữ lại các giá trị đã nhập
- Không gửi request đến server

#### Bước 5: Gửi Request đến Server
Nếu validation client thành công:
```
POST /auth/register
Body: {
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  password: "Password123"
}
Headers: {
  Content-Type: application/json
}
```

#### Bước 6: Xử lý Phía Server
File: `server.ts` - Route `POST /auth/register`

**6.1: Validation Phía Server (kiểm tra lại)**
- Kiểm tra các trường bắt buộc
- Kiểm tra định dạng email
- Kiểm tra yêu cầu mật khẩu
- Kiểm tra xác nhận mật khẩu

Nếu lỗi: Return `400 Bad Request`
```json
{
  "errors": [
    { "field": "email", "message": "Email không đúng định dạng" }
  ]
}
```

**6.2: Kiểm tra Email Trùng**
- Query: `SELECT id FROM users WHERE email = ?`
- Nếu tìm thấy user có email này:
  - Return `400 Bad Request`
  ```json
  {
    "errors": [
      { "field": "email", "message": "Email này đã được sử dụng, vui lòng chọn email khác" }
    ]
  }
  ```

**6.3: Hash Password**
- Sử dụng bcryptjs để mã hóa mật khẩu
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

**6.4: Lưu User vào Database**
- Insert vào bảng `users`
```sql
INSERT INTO users (fullName, email, password, role, status, createdAt)
VALUES (?, ?, ?, ?, ?, ?)
```

Dữ liệu:
- `fullName`: Giá trị từ form
- `email`: Giá trị từ form
- `password`: Password đã hash
- `role`: 'user' (mặc định)
- `status`: 'active'
- `createdAt`: Thời gian hiện tại

**6.5: Tạo JWT Token**
```typescript
const token = generateToken(userId, email, 'user');
```

Token chứa:
- `userId`: ID của user vừa tạo
- `email`: Email của user
- `role`: 'user'
- Hết hạn: 7 ngày

**6.6: Return Response Thành công**
```json
{
  "message": "Đăng ký tài khoản thành công",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "role": "user"
  }
}
```

#### Bước 7: Xử lý Response Phía Client
**Nếu thành công:**
- Lưu token vào `localStorage.setItem("token", token)`
- Hiển thị thông báo: "Đăng ký thành công! Đang chuyển hướng..."
- Đợi 1.5 giây
- Chuyển hướng đến trang chủ `/`
- User tự động đăng nhập

**Nếu thất bại:**
- Hiển thị thông báo lỗi phía dưới form
- Highlight các field có lỗi với màu đỏ
- Không xóa dữ liệu đã nhập (để user sửa)

#### Bước 8: Người dùng sử dụng hệ thống
- Token được gửi tự động trong header: `Authorization: Bearer <token>`
- Có thể truy cập các trang yêu cầu đăng nhập
- Có thể thực hiện các thao tác như mua hàng, xem đơn, v.v.

---

## 2. LOGIC CHỨC NĂNG ĐĂNG NHẬP (SIGN IN)

### Mô tả tổng quan:
Chức năng đăng nhập cho phép người dùng đã có tài khoản truy cập vào hệ thống theo đúng vai trò (khách hàng, admin, nhân viên).

### Luồng xử lý chi tiết:

#### Bước 1: Truy cập trang Đăng nhập
- Người dùng nhấn nút "Đăng nhập" hoặc truy cập `/sign-in`
- Hệ thống hiển thị form đăng nhập

#### Bước 2: Hiển thị Form Đăng nhập
Form chứa:
- **Email** (bắt buộc)
- **Mật khẩu** (bắt buộc)

#### Bước 3: Nhập Thông tin & Nhấn Đăng nhập
- Người dùng nhập email và mật khẩu
- Nhấn nút "Đăng nhập"
- Component kích hoạt hàm handleSubmit()

#### Bước 4: Validation Phía Client
File: `src/utils/validation.ts`

**Kiểm tra các trường bắt buộc:**
- Email không được trống
- Mật khẩu không được trống

**Kiểm tra định dạng Email:**
- Kiểm tra regex email
- Nếu lỗi: "Email không đúng định dạng"

**Nếu validation thất bại:**
- Hiển thị lỗi dưới mỗi field
- Không gửi request

#### Bước 5: Gửi Request đến Server
```
POST /auth/login
Body: {
  email: "nguyenvana@email.com",
  password: "Password123"
}
```

#### Bước 6: Xử lý Phía Server
File: `server.ts` - Route `POST /auth/login`

**6.1: Validation Phía Server**
- Kiểm tra email và mật khẩu không trống
- Kiểm tra email đúng định dạng

Nếu lỗi: Return `400 Bad Request`

**6.2: Tìm kiếm User theo Email**
```sql
SELECT * FROM users WHERE email = ?
```

**Nếu không tìm thấy:**
- Return `401 Unauthorized`
```json
{
  "errors": [
    { "field": "email", "message": "Email hoặc mật khẩu không đúng" }
  ]
}
```
*(Không nên tiết lộ email không tồn tại vì lý do bảo mật)*

**6.3: So sánh Mật khẩu**
```typescript
const isPasswordValid = await bcrypt.compare(inputPassword, hashedPassword);
```

**Nếu mật khẩu không khớp:**
- Return `401 Unauthorized`
```json
{
  "errors": [
    { "field": "password", "message": "Email hoặc mật khẩu không đúng" }
  ]
}
```

**6.4: Xác định vai trò người dùng**
- Lấy `role` từ database: "user", "admin", hoặc "staff"

**6.5: Tạo JWT Token**
```typescript
const token = generateToken(userId, email, role);
```

**6.6: Return Response Thành công**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "role": "user",
    "phone": "0123456789"
  }
}
```

#### Bước 7: Xử lý Response Phía Client
**Nếu thành công:**
1. Lưu token: `localStorage.setItem("token", token)`
2. Lấy vai trò từ user response
3. Điều hướng dựa trên vai trò:
   - Nếu `role === "admin"` hoặc `role === "staff"`:
     → Chuyển đến `/admin` (Dashboard Admin)
   - Nếu `role === "user"`:
     → Chuyển đến `/` (Trang chủ)

**Nếu thất bại:**
- Hiển thị thông báo lỗi
- Highlight field có lỗi
- Giữ email trong form (nhưng xóa mật khẩu vì lý do bảo mật)

#### Bước 8: Trong quá trình sử dụng hệ thống

**8.1: Gửi Token với mỗi Request**
File: `src/apis/http.ts`
- Request interceptor tự động thêm token vào header:
```
Authorization: Bearer <token>
```

**8.2: Kiểm tra Token trên Server**
- Middleware: `authMiddleware`
- Xác thực và giải mã token
- Lấy thông tin user từ token
- Gắn user vào `req.user`

**8.3: Truy cập các API Bảo vệ**
- Các API yêu cầu đăng nhập sẽ kiểm tra token
- Nếu token hết hạn hoặc không hợp lệ:
  - Return `401 Unauthorized`
  - Client xóa token và chuyển về `/sign-in`

**8.4: Điều hướng dựa trên vai trò**
- User có thể truy cập trang dành cho user
- Admin/Staff có thể truy cập dashboard quản trị
- Các trang bảo vệ kiểm tra role trước khi hiển thị

#### Bước 9: Đăng xuất
- Người dùng nhấn nút "Đăng xuất"
- Xóa token: `localStorage.removeItem("token")`
- Chuyển về `/sign-in`

---

## 3. CẤU TRÚC FILE VÀ COMPONENT

### Frontend:
- `src/pages/user/auth/SignUp.tsx` - Form đăng ký
- `src/pages/user/auth/SignIn.tsx` - Form đăng nhập
- `src/pages/user/components/ProtectedRoute.tsx` - Bảo vệ trang user
- `src/pages/admin/components/AdminProtected.tsx` - Bảo vệ trang admin
- `src/apis/auth.api.ts` - API client cho auth
- `src/apis/http.ts` - HTTP client với interceptor
- `src/utils/validation.ts` - Hàm validation

### Backend:
- `server.ts` - API routes: POST /auth/register, POST /auth/login, GET /auth/me
- `src/middleware/authMiddleware.ts` - JWT authentication middleware
- `src/config/database.ts` - Database connection
- `src/types/user.ts` - TypeScript types

### Database:
- Bảng `users`:
  - `id` (INT, PRIMARY KEY)
  - `fullName` (VARCHAR)
  - `email` (VARCHAR, UNIQUE)
  - `password` (VARCHAR, hashed)
  - `phone` (VARCHAR, nullable)
  - `role` (ENUM: 'user', 'admin', 'staff')
  - `status` (VARCHAR: 'active', 'inactive')
  - `createdAt` (DATETIME)
  - `updatedAt` (DATETIME, nullable)

---

## 4. LƯỚI BẢNG TÓMLỖI & THÀNH CÔNG

| Tình huống | Loại Lỗi | HTTP Status | Thông báo |
|-----------|---------|-----------|----------|
| Field bắt buộc trống | Validation | 400 | "Vui lòng nhập [field]" |
| Email không đúng định dạng | Validation | 400 | "Email không đúng định dạng" |
| Mật khẩu quá ngắn | Validation | 400 | "Mật khẩu phải có ít nhất 6 ký tự" |
| Mật khẩu không trùng | Validation | 400 | "Mật khẩu xác nhận không trùng khớp" |
| Email đã tồn tại (SignUp) | Business Logic | 400 | "Email này đã được sử dụng, vui lòng chọn email khác" |
| Email không tồn tại (SignIn) | Authentication | 401 | "Email hoặc mật khẩu không đúng" |
| Mật khẩu sai (SignIn) | Authentication | 401 | "Email hoặc mật khẩu không đúng" |
| Token hết hạn | Authorization | 401 | "Token không hợp lệ hoặc đã hết hạn" |
| Lỗi server | Server Error | 500 | "Lỗi máy chủ" |
| **Đăng ký thành công** | ✅ | 201 | "Đăng ký tài khoản thành công" |
| **Đăng nhập thành công** | ✅ | 200 | "Đăng nhập thành công" |

---

## 5. CÁCH TEST

### Test Đăng ký:
1. Truy cập `http://localhost:5173/sign-up`
2. Nhập thông tin:
   - Họ tên: "Nguyễn Văn A"
   - Email: "nguyenvana@email.com"
   - Mật khẩu: "Password123"
   - Xác nhận: "Password123"
3. Nhấn "Đăng ký"
4. Nếu thành công → Chuyển về trang chủ

### Test Đăng nhập:
1. Truy cập `http://localhost:5173/sign-in`
2. Nhập:
   - Email: "nguyenvana@email.com"
   - Mật khẩu: "Password123"
3. Nhấn "Đăng nhập"
4. Nếu thành công → Chuyển về trang chủ hoặc admin

### Test Bảo vệ Trang:
1. Xóa token: `localStorage.removeItem("token")`
2. Truy cập trang yêu cầu đăng nhập
3. Sẽ tự động chuyển đến `/sign-in`
