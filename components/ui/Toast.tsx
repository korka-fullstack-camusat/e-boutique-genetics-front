"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: { borderRadius: "8px", fontSize: "14px", fontWeight: 600 },
        success: { style: { background: "#111", color: "#fff" } },
        error: { style: { background: "#ef4444", color: "#fff" } },
      }}
    />
  );
}
