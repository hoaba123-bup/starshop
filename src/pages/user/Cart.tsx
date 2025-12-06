import React, { useEffect, useState } from "react";
import { getCart, updateQuantity, removeFromCart, cartTotal, CartItem } from "../../utils/cart";
import { Link } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const handleQty = (id: string | number, qty: number) => {
    const next = updateQuantity(id, qty);
    setItems([...next]);
  };

  const handleRemove = (id: string | number) => {
    const next = removeFromCart(id);
    setItems([...next]);
  };

  const total = cartTotal(items);

  if (!items.length) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-slate-800">Giỏ hàng</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Giỏ hàng trống.</p>
          <Link to="/" className="text-indigo-600 text-sm font-semibold">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Giỏ hàng</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.product.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleQty(item.product.id, Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="text-sm font-semibold text-slate-700">
                  {(item.product.price * item.quantity)} đ
                </div>
                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">Tổng</p>
          <p className="text-lg font-bold text-indigo-600">{total.toLocaleString("vi-VN")} đ</p>
        </div>
        <div className="mt-3 text-right">
          <Link
            to="/checkout"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}
