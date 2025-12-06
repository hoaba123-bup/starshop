import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem, cartTotal, clearCart, getCart } from "../../utils/cart";
import { OrderApi } from "../../apis/order.api";

import { useAppMessage } from "../../hooks/useAppMessage";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    // THAY THẾ 'bank' bằng 'vnpay'
    payment: "cod" as "cod" | "vnpay", 
    notes: "",
  });
  const PAYMENT_METHODS = {
    COD: 'Thanh toán khi nhận hàng (COD)',
    // XÓA PAYOS: 'Ví điện tử & Thẻ ngân hàng (PayOS)',
    VNPAY: 'Thẻ ATM & Visa/Mastercard (VNPAY)', // GIỮ LẠI
};
  const [errors, setErrors] = useState<string[]>([]);
  const notify = useAppMessage();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cartTotal(cart);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as "cod" | "vnpay" })); 
  };

  const validate = () => {
    const errs: string[] = [];

    if (!form.name.trim()) errs.push("Vui lòng nhập họ tên");
    if (!/^\d{9,11}$/.test(form.phone)) errs.push("Số điện thoại từ 9 đến 11 chữ số");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.push("Email không đúng định dạng");
    if (!form.address.trim()) errs.push("Vui lòng nhập địa chỉ");
    if (form.payment === "bank") errs.push("Thanh toán chuyển khoản đang được phát triển");
    if (!cart.length) errs.push("Giỏ hàng trống");
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    setSubmitting(true);
    try {
      await OrderApi.create({
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shipping: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
        },
        paymentMethod: form.payment,
      });
      clearCart();
      setCart([]);
      notify.success("Đã tạo đơn hàng thành công!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      setErrors(["Không thể tạo đơn hàng. Vui lòng thử lại."]);
      notify.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };
>>>>>>> phiendangnhap

// ... (Các imports đã có, đảm bảo có import OrderApi và toast, axios nếu cần)

// Khai báo state cho phương thức thanh toán
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'COD' | 'PAYOS' | 'VNPAY'>('COD');
const [isSubmitting, setIsSubmitting] = useState(false); // Đổi tên `submitting` thành `isSubmitting` cho tiện

// THAY THẾ TOÀN BỘ HÀM handleSubmit
// file: src/pages/user/Checkout.tsx

// file: src/pages/user/Checkout.tsx

const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errs = validate();
    if (errs.length) {
        setErrors(errs);
        return;
    }
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setErrors([]);
    
    // 1. Chuẩn bị dữ liệu và Tạo đơn hàng
    let shopOrderCode: string | null = null;
    const total = cartTotal(cart);
    const paymentMethod = form.payment; // Lấy từ form state

    try {
        const orderPayload = {
            shipping: { name: form.name, phone: form.phone, email: form.email, address: form.address },
            items: cart.map(item => ({
                // ⚠️ QUAN TRỌNG: Đảm bảo tên trường là 'productId' nếu Backend yêu cầu
                productId: item.product.id, // Dùng item.id (hoặc item.code nếu API của huynh nhận productCode)
                quantity: item.quantity,
            })),
            totalAmount: total,
            paymentMethod: paymentMethod, // đã là 'cod' hoặc 'vnpay'
            notes: "Khong co ghi chu",
        };

        // ⚠️ Nếu Backend của huynh cần tổng tiền, hãy thêm nó vào orderPayload
        // Ví dụ: totalAmount: total,

        const orderRes = await OrderApi.create(orderPayload);
        shopOrderCode = orderRes.data.code;

    } catch (error) {
      
        const errorMessage = error.response?.data?.error || 'Lỗi không xác định khi tạo đơn hàng.';
        toast.error('Lỗi khi tạo đơn hàng: ' + errorMessage);
        setIsSubmitting(false);
        return;
    }

    // 2. Xử lý thanh toán VNPAY / COD
    if (paymentMethod === 'vnpay') {
        try {
            const response = await OrderApi.createVnPayUrl(total, shopOrderCode!);
            const orderUrl = response.data.orderUrl;
            
            window.location.href = orderUrl;
        } catch (error) {
            toast.error('Lỗi khi tạo giao dịch VNPAY.');
            setIsSubmitting(false);
        }
    } else { // paymentMethod === 'cod'
        clearCart();
        setCart([]);
        toast.success('Đặt hàng thành công! Đơn hàng sẽ được giao trong vài ngày tới.');
        // Chuyển hướng đến trang đơn hàng người dùng
        navigate('/profile/orders'); // Hoặc '/orders' tùy theo RouterSetup của huynh
    }

    setIsSubmitting(false);
};
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Thanh toán</h1>
      {errors.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
          <ul className="list-disc ml-5">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Thông tin giao hàng</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Ho ten"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Dia chi"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 sm:col-span-2"
                />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-slate-800 mb-3">Phương thức thanh toán</h3>
              <div className="space-y-2">

                <label className="flex items-center gap-2  rounded hover:bg-slate-50">
                 <input
    type="radio"
    id="cod"
    name="paymentMethod" // <-- PHẢI THÊM VÀ PHẢI GIỐNG NHAU
    value="cod"
    checked={form.payment === 'cod'}
    onChange={() => handleChange('payment' as keyof typeof form, 'cod')} // <-- THÊM ONCHANGE
    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
/>
                  <span className="text-gray font-medium">Thanh toan khi nhan hang</span>

                </label>
             <label className="flex items-center space-x-3">
       <input
    type="radio"
    id="vnpay"
    name="paymentMethod" // <-- PHẢI GIỐNG VỚI CÁI TRÊN
    value="vnpay"
    checked={form.payment === 'vnpay'}
    onChange={() => handleChange('payment' as keyof typeof form, 'vnpay')} // <-- THÊM ONCHANGE
    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
/>
        <span className="text-gray font-medium">
            {PAYMENT_METHODS.VNPAY}
        </span>
    </label>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sticky top-20">
            <h3 className="font-semibold text-slate-800 mb-4">Tổng kết đơn hàng</h3>
            <div className="space-y-2 text-sm mb-4 pb-4 border-b border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Tiền hàng:</span>
                <span className="font-semibold">{total.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Phí vận chuyển:</span>
                <span className="font-semibold">0 VND</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>Tong:</span>
              <span className="text-indigo-600">{total.toLocaleString("vi-VN")} VND</span>
            </div>
            <button
              className="w-full rounded-lg bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
