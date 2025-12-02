import React, { useEffect, useState } from "react";
import { http } from "../../../apis/http";
import DataTransferPanel from "../../../components/DataTransferPanel";

export default function Profile() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
        setError("Khong tai duoc thong tin tai khoan");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setError("Ho ten khong duoc de trong");
      setSuccess("");
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
      setSuccess("Da luu thong tin thanh cong");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error(err);
      setError("Khong the cap nhat thong tin");
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-600">Dang tai...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Thong tin ca nhan</h1>
        <p className="text-sm text-slate-600 mt-1">Xem va cap nhat thong tin tai khoan cua ban</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 dark:bg-slate-800 dark:border-slate-600">
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <label className="text-sm text-slate-600">
          Ho ten *
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
          So dien thoai
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Dang luu..." : "Luu thay doi"}
        </button>
      </div>

      <DataTransferPanel mode="user" />
    </div>
  );
}
