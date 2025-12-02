import React, { useEffect, useMemo, useState } from "react";
import { AdminApi } from "../../apis/admin.api";
import { Product } from "../../types/product";
import { Category } from "../../types/category";
import { http } from "../../apis/http";

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
  const token = localStorage.getItem("token");
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
      const res = await http.get<Category[]>("/categories");
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
      setError("Khong tai duoc danh sach san pham.");
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
    if (!window.confirm(`Xoa san pham "${product.name}"?`)) return;
    try {
      await AdminApi.products.remove(product.id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(product.id)));
    } catch (err) {
      console.error(err);
      setMessage("Khong the xoa san pham.");
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
        categoryId: product.categoryId ?? null,
        description: product.description ?? null,
        imageUrl: product.imageUrl ?? null,
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
      setMessage("Khong cap nhat duoc trang thai.");
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
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      status: form.status,
    };
    if (!payload.name || !payload.price) {
      setMessage("Vui long nhap ten va gia san pham.");
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
      setMessage("Khong luu duoc san pham. Vui long thu lai.");
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
          <h1 className="text-2xl font-bold text-slate-800">Quan ly san pham</h1>
          <p className="text-sm text-slate-600 mt-1">
            Them moi, chinh sua hoac xoa san pham trong cua hang
          </p>
        </div>
        {canManage && (
          <button
            className="rounded-lg bg-indigo-600 px-5 py-2 text-white font-semibold hover:bg-indigo-700"
            onClick={() => openModal()}
          >
            + Them san pham
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Tim theo ten hoac mo ta..."
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="all">Tat ca trang thai</option>
          <option value="active">Dang hien thi</option>
          <option value="inactive">Dang an</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.categoryId}
          onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
        >
          <option value="">Tat ca danh muc</option>
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
          placeholder="Gia toi thieu"
          value={filters.minPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
        />
        <input
          type="number"
          min={0}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Gia toi da"
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
              <th className="py-3 px-4 font-semibold text-slate-600">San pham</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Danh muc</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Gia</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Ton kho</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Trang thai</th>
              <th className="py-3 px-4 font-semibold text-slate-600 text-center">Hanh dong</th>
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
                  Khong co san pham phu hop.
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
                      {product.status === "active" ? "Dang ban" : "Dang an"}
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
                          {product.status === "active" ? "An" : "Hien"}
                        </button>
                        <button
                          className="text-rose-600 text-xs font-semibold hover:underline"
                          onClick={() => handleDelete(product)}
                        >
                          Xoa
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Chi xem</span>
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
                {editing ? "Chinh sua san pham" : "Them san pham moi"}
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
                  <label className="text-xs font-semibold text-slate-600">Ten san pham</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Gia (VND)</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Ton kho</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Danh muc</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                  >
                    <option value="">Khong phan loai</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Mo ta</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Anh</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => handleChange("imageUrl", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Trang thai</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="active">Dang ban</option>
                    <option value="inactive">Dang an</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
                  onClick={closeModal}
                >
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {saving ? "Dang luu..." : "Luu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
