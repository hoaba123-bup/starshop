import React, { useState } from "react";
import { AdminApi } from "../apis/admin.api";
import { ProductApi } from "../apis/product.api";
import { OrderApi } from "../apis/order.api";
import { Product } from "../types/product";
import { Order } from "../types/order";

interface Props {
  mode: "admin" | "user";
}

type Resource = "products" | "orders";

const downloadJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const DataTransferPanel: React.FC<Props> = ({ mode }) => {
  const [status, setStatus] = useState<string>("");
  const [productFile, setProductFile] = useState<File | null>(null);
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const canImport = mode === "admin";

  const exportData = async (resource: Resource) => {
    try {
      setStatus(`Dang xuat ${resource}...`);
      let payload: any[] = [];
      if (resource === "products") {
        if (mode === "admin") {
          const res = await AdminApi.products.list();
          payload = res.data || [];
        } else {
          const res = await ProductApi.list();
          payload = res.data || [];
        }
      } else {
        if (mode === "admin") {
          const res = await AdminApi.orders.list();
          payload = res.data || [];
        } else {
          const res = await OrderApi.myOrders();
          payload = res.data || [];
        }
      }
      downloadJSON(payload, `${resource}-${new Date().toISOString()}.json`);
      setStatus(`Da xuat ${resource} thanh cong.`);
    } catch (error) {
      console.error(error);
      setStatus(`Khong the xuat ${resource}.`);
    }
  };

  const importData = async (resource: Resource) => {
    if (!canImport) return;
    const file = resource === "products" ? productFile : orderFile;
    if (!file) {
      setStatus("Vui long chon tep JSON truoc.");
      return;
    }
    try {
      setStatus(`Dang nhap ${resource}...`);
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("Du lieu khong phai mang");
      }
      if (resource === "products") {
        await AdminApi.products.import(parsed as Partial<Product>[]);
      } else {
        await AdminApi.orders.import(parsed as Partial<Order>[]);
      }
      setStatus(`Da nhap ${resource} thanh cong.`);
    } catch (error) {
      console.error(error);
      setStatus(`Khong the nhap ${resource}. Vui long kiem tra dinh dang tep.`);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-800 dark:border-slate-600">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Import / Export du lieu
      </h3>
      {status && <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{status}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">San pham</h4>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-semibold hover:bg-indigo-700"
              onClick={() => exportData("products")}
            >
              Export JSON
            </button>
            {canImport && (
              <>
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                  className="text-sm text-slate-600 dark:text-slate-200"
                />
                <button
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100"
                  onClick={() => importData("products")}
                >
                  Import
                </button>
              </>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Don hang</h4>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-semibold hover:bg-indigo-700"
              onClick={() => exportData("orders")}
            >
              Export JSON
            </button>
            {canImport && (
              <>
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => setOrderFile(e.target.files?.[0] || null)}
                  className="text-sm text-slate-600 dark:text-slate-200"
                />
                <button
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100"
                  onClick={() => importData("orders")}
                >
                  Import
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {mode === "user" && (
        <p className="mt-4 text-xs text-slate-500">
          * Chi admin moi co the nhap du lieu. Ban co the xuat danh sach san pham va don hang cua minh.
        </p>
      )}
    </section>
  );
};

export default DataTransferPanel;
