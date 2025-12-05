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
    payment: "cod" as "cod" | "bank",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const notify = useAppMessage();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cartTotal(cart);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
                <label className="flex items-center gap-2 p-2 rounded hover:bg-slate-50">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === "cod"}
                    onChange={() => handleChange("payment", "cod")}
                  />
                  <span className="text-sm">Thanh toán khi nhận hàng</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded text-slate-400">
                  <input type="radio" name="payment" disabled checked={form.payment === "bank"} />
                  <span className="text-sm">Chuyển khoản (đang phát triển)</span>
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
