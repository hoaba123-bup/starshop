import React, { useEffect, useMemo, useState } from "react";
import { AdminApi } from "../../apis/admin.api";
import { Product } from "../../types/product";
import { Category } from "../../types/category";
import { httpAdmin } from "../../apis/http";
import { ADMIN_TOKEN_KEY } from "../../constants/auth";

interface ProductFormState {
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  status: string;
}

const initialForm: ProductFormState = {
  name: "",
  price: "",
  stock: "0",
  categoryId: "",
  description: "",
  imageUrl: "",
  status: "active",
};

const getRoleFromToken = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return "user";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "user";
  } catch {
    return "user";
  }
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const role = useMemo(() => getRoleFromToken(), []);
  const canManage = role === "admin";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await httpAdmin.get<Category[]>("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {
        q: filters.q || undefined,
        categoryId: filters.categoryId || undefined,
      };
      if (filters.status !== "all") params.status = filters.status;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      const res = await AdminApi.products.list(params);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        price: String(product.price),
        stock: String(product.stock ?? 0),
        categoryId: String(product.categoryId ?? ""),
        description: product.description ?? "",
        imageUrl: product.imageUrl ?? "",
        status: product.status ?? "active",
      });
    } else {
      setEditing(null);
      setForm(initialForm);
    }
    setShowModal(true);
    setMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(initialForm);
  };

  const handleChange = (key: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    try {
      await AdminApi.products.remove(product.id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(product.id)));
    } catch (err) {
      console.error(err);
      setMessage("Không thể xóa sản phẩm.");
    }
  };

  const handleToggleStatus = async (product: Product) => {
    if (!canManage) return;
    const nextStatus = product.status === "active" ? "inactive" : "active";
    try {
      const payload = {
        name: product.name,
        price: product.price,
        stock: product.stock ?? 0,
        categoryId: product.categoryId ?? undefined,
        description: product.description ?? undefined,
        imageUrl: product.imageUrl ?? undefined,
        status: nextStatus,
      };
      const res = await AdminApi.products.update(product.id, payload);
      const updated = res.data;
      setProducts((prev) =>
        prev.map((item) => (String(item.id) === String(product.id) ? updated : item))
      );
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Không cập nhật được trạng thái.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      status: form.status,
    };
    if (!payload.name || !payload.price) {
      setMessage("Vui lòng nhập tên và giá sản phẩm.");
      setSaving(false);
      return;
    }

    try {
      if (editing) {
        const res = await AdminApi.products.update(editing.id, payload);
        setProducts((prev) =>
          prev.map((item) =>
            String(item.id) === String(editing.id) ? res.data : item
          )
        );
      } else {
        const res = await AdminApi.products.create(payload);
        setProducts((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setMessage("Không lưu được sản phẩm. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.q) {
        const keyword = filters.q.toLowerCase();
        const target = `${product.name || ""} ${product.description || ""}`.toLowerCase();
        if (!target.includes(keyword)) return false;
      }
      if (filters.status !== "all" && product.status !== filters.status) return false;
      if (filters.categoryId && String(product.categoryId ?? "") !== filters.categoryId) return false;
      if (
        filters.minPrice &&
        Number(product.price) < Number(filters.minPrice)
      )
        return false;
      if (
        filters.maxPrice &&
        Number(product.price) > Number(filters.maxPrice)
      )
        return false;
      return true;
    });
  }, [products, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-slate-600 mt-1">
            Thêm mới, chỉnh sửa và quản lý sản phẩm trong cửa hàng
          </p>
        </div>
        {canManage && (
          <button
            className="rounded-lg bg-indigo-600 px-5 py-2 text-white font-semibold hover:bg-indigo-700"
            onClick={() => openModal()}
          >
            + Thêm sản phẩm
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Tìm theo tên..."
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="all">Tất cả thạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="inactive">Đang ẩn</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.categoryId}
          onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Giá tối thiểu"
          value={filters.minPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
        />
        <input
          type="number"
          min={0}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Giá tối đa"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
        />
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          onClick={() =>
            setFilters({ q: "", status: "all", categoryId: "", minPrice: "", maxPrice: "" })
          }
        >
          Lam moi
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="py-3 px-4 font-semibold text-slate-600">Sản phẩm</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Danh mục</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Giá</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Tồn kho</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-slate-600 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Dang tai du lieu...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Không có sản phẩm phù hợp.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{product.name}</td>
                  <td className="py-3 px-4 text-slate-600">{product.categoryName || "-"}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {Number(product.price).toLocaleString("vi-VN") + " VND"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{product.stock ?? 0}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        product.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {product.status === "active" ? "Đang bán" : "Đang ẩn"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {canManage ? (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="text-indigo-600 text-xs font-semibold hover:underline"
                          onClick={() => openModal(product)}
                        >
                          Sua
                        </button>
                        <button
                          className="text-amber-600 text-xs font-semibold hover:underline"
                          onClick={() => handleToggleStatus(product)}
                        >
                          {product.status === "active" ? "Ẩn" : "Hiện"}
                        </button>
                        <button
                          className="text-rose-600 text-xs font-semibold hover:underline"
                          onClick={() => handleDelete(product)}
                        >
                          Xoa
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Chỉ xem</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                className="text-slate-500 hover:text-rose-600"
                onClick={closeModal}
              >
                X
              </button>
            </div>
            {message && (
              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {message}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tên sản phẩm</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Giá (VND)</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tồn kho</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Danh mục</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                  >
                    <option value="">Không phân loại</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Mô tả</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Ảnh</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => handleChange("imageUrl", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Trạng thái</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="active">Đang bán</option>
                    <option value="inactive">Đang ẩn</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




