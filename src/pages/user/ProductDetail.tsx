import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cart";
import { http } from "../../apis/http";
import { Product } from "../../types/product";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const res = await http.get<Product>(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        setError("San pham khong ton tai hoac da bi an.");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading) return <p className="text-sm text-slate-600">Dang tai...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!product) return null;

  const handleAddToCart = () => {
    const result = addToCart(product, qty);
    if (result.success) {
      setToast({ message: "Da them san pham vao gio hang", type: "success" });
    } else {
      setToast({ message: result.message || "San pham da het hang", type: "error" });
    }
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-slate-100" />
        )}
      </div>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Danh muc: {product.categoryName}</p>
        <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
        <p className="text-indigo-600 text-xl font-semibold">
          {Number(product.price).toLocaleString("vi-VN")} VND
        </p>
        {typeof product.stock === "number" && (
          <p className="text-xs text-slate-500">Ton kho: {product.stock}</p>
        )}
        <p className="text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
            onClick={handleAddToCart}
          >
            Them vao gio
          </button>
        </div>
        {toast && (
          <p className={`text-sm ${toast.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
            {toast.message}
          </p>
        )}
      </div>
    </div>
  );
}
