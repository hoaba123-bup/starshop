import React, { useEffect, useState } from "react";
import { http } from "../../../apis/http";
import DataTransferPanel from "../../../components/DataTransferPanel";
import { useAppMessage } from "../../../hooks/useAppMessage";

export default function Profile() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const notify = useAppMessage();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await http.get("/auth/me");
        setForm({
          fullName: res.data.fullName ?? "",
          email: res.data.email ?? "",
          phone: res.data.phone ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Không tải được thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setError("Họ tên không được để trống");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await http.put("/auth/me", {
        fullName: form.fullName.trim(),
        phone: form.phone || null,
      });
      setForm({
        fullName: res.data.fullName ?? "",
        email: res.data.email ?? "",
        phone: res.data.phone ?? "",
      });
      notify.success("Đã lưu thay đổi");
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật thông tin");
      notify.error("Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-600">Dang tai...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Thông tin cá nhân</h1>
        <p className="text-sm text-slate-600 mt-1">Xem và cập nhật thông tin tài khoản của bạn</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 dark:bg-slate-800 dark:border-slate-600">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <label className="text-sm text-slate-600">
          Họ tên *
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-600">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2"
            value={form.email}
            disabled
          />
        </label>
        <label className="text-sm text-slate-600">
          Số điện thoại
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 mt-4"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <DataTransferPanel mode="user" />
    </div>
  );
}
