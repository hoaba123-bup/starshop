import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cart";
import { http } from "../../apis/http";
import { Product } from "../../types/product";
import { Category } from "../../types/category";
import { useAppMessage } from "../../hooks/useAppMessage";

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await http.get<Category[]>("/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await http.get<Product[]>("/products", {
          params: {
            q: keyword || undefined,
            categoryId: categoryId || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          },
        });
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categoryId, minPrice, maxPrice]);

  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    products.forEach((p) => {
      const key = String(p.categoryId || "others");
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [products]);

  const notify = useAppMessage();


  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Tìm kiếm sản phẩm</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Từ khóa tên sản phẩm" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input type="number" min={0} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Giá tối thiểu" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input type="number" min={0} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Giá tối đa" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
      </section>

      {loading && <p className="text-sm text-slate-600">Đang tải sản phẩm...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!loading && !error && categories.map((cat) => {
        const list = grouped[String(cat.id)] || [];
        if (!list.length) return null;
        return (
          <section key={cat.id} className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">{cat.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm flex flex-col cursor-pointer"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div>
                    <div className="h-32 rounded-lg bg-slate-100 mb-3 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-slate-100" />
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.categoryName}</div>
                    <div className="text-indigo-600 font-bold mt-1">
                      {Number(p.price).toLocaleString("vi-VN")} VND
                    </div>
                  </div>
                  <button
                    className="mt-auto rounded-lg bg-indigo-600 px-3 py-2 text-white text-sm font-medium hover:bg-indigo-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      const result = addToCart(p, 1);
                      if (result.success) {
                        notify.success("Đã thêm sản phẩm vào giỏ hàng");
                      } else {
                        notify.error(result.message || "Sản phẩm đã hết hàng");
                      }
                    }}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

    </div>
  );
}
