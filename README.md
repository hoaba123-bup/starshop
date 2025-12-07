chỉ admin mới được thực hiện hành động nhạy cảm như tạo/sửa/xóa sản phẩm và phân quyền người dùng. Staff có thể xem danh sách, duyệt/hủy đơn, tra cứu dữ liệu nhưng không được chỉnh sửa danh mục quan trọng.

chạy server: npx tsx server.ts
chạy frontEnd: npm run dev

chỉnh thời gian cho 1 phiên đăng nhập tại src/constants/auth.ts

## Thông tin thẻ Test

| #   | Ngân hàng/Loại thẻ           | Số thẻ              | Tên chủ thẻ  | Ngày hết hạn/phát hành | CVC/CVV | Ghi chú/OTP           | Kết quả            |
| --- | ---------------------------- | ------------------- | ------------ | ---------------------- | ------- | --------------------- | ------------------ |
| 1   | NCB (ATM nội địa)            | 9704198526191432198 | NGUYEN VAN A | 07/15                  | -       | OTP: 123456           | **Thành công**     |
| 2   | NCB (ATM nội địa)            | 9704195798459170488 | NGUYEN VAN A | 07/15                  | -       | -                     | Thẻ không đủ số dư |
| 3   | NCB (ATM nội địa)            | 9704192181368742    | NGUYEN VAN A | 07/15                  | -       | -                     | Thẻ chưa kích hoạt |
| 4   | NCB (ATM nội địa)            | 9704193370791314    | NGUYEN VAN A | 07/15                  | -       | -                     | Thẻ bị khóa        |
| 5   | NCB (ATM nội địa)            | 9704194841945513    | NGUYEN VAN A | 07/15                  | -       | -                     | Thẻ bị hết hạn     |
| 6   | VISA (Quốc tế, No 3DS)       | 4456530000001005    | NGUYEN VAN A | 12/26                  | 123     | Email: test@gmail.com | **Thành công**     |
| 7   | VISA (Quốc tế, 3DS)          | 4456530000001096    | NGUYEN VAN A | 12/26                  | 123     | Email: test@gmail.com | **Thành công**     |
| 8   | MasterCard (Quốc tế, No 3DS) | 5200000000001005    | NGUYEN VAN A | 12/26                  | 123     | Email: test@gmail.com | **Thành công**     |
| 9   | MasterCard (Quốc tế, 3DS)    | 5200000000001096    | NGUYEN VAN A | 12/26                  | 12/26   | Email: test@gmail.com | **Thành công**     |
| 10  | JCB (Quốc tế, No 3DS)        | 3337000000000008    | NGUYEN VAN A | 12/26                  | 123     | Email: test@gmail.com | **Thành công**     |
| 11  | JCB (Quốc tế, 3DS)           | 3337000000200004    | NGUYEN VAN A | 12/24                  | 123     | Email: test@gmail.com | **Thành công**     |
| 12  | ATM nội địa (Nhóm NAPAS)     | 9704000000000018    | NGUYEN VAN A | 03/07                  | -       | OTP: otp              | **Thành công**     |
| 13  | ATM nội địa (EXIMBANK)       | 9704310005819191    | NGUYEN VAN A | 10/26                  | -       | -                     | **Thành công**     |
