import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

let addToastExternal;
const pendingToasts = [];
const TOAST_TYPES = new Set(["success", "failure", "neutral"]);

const normalizeType = (type) => (TOAST_TYPES.has(type) ? type : "neutral");

const createToast = (message, type = "neutral") => ({
  id: Date.now() + Math.random(),
  message,
  type: normalizeType(type),
});

export const ToastProvider = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastExternal = (message, type = "neutral") => {
      const toast = createToast(message, type);

      setToasts((prev) => [...prev, toast].slice(-10));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };

    pendingToasts.splice(0).forEach((toast) => {
      addToastExternal(toast.message, toast.type);
    });

    return () => {
      addToastExternal = undefined;
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="fixed bottom-4 right-4 z-10 flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>,
    document.body,
  );
};

export const addToast = (message, type = "neutral") => {
  const toast = {
    message,
    type: normalizeType(type),
  };

  if (addToastExternal) {
    addToastExternal(toast.message, toast.type);
  } else {
    pendingToasts.push(toast);
  }
};

const toastStyles = {
  success: "border-emerald-200 bg-emerald-600 text-white shadow-emerald-950/15",
  failure: "border-red-200 bg-red-600 text-white shadow-red-950/15",
  neutral: "border-slate-200 bg-slate-800 text-white shadow-slate-950/15",
};

const Toast = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);
    const exitTimer = setTimeout(() => setVisible(false), 2650);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      role={type === "failure" ? "alert" : "status"}
      className={`max-w-sm px-4 py-2 border rounded font-semibold text-sm shadow-lg duration-350 transform transition ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${toastStyles[type] ?? toastStyles.neutral}`}
    >
      {message}
    </div>
  );
};
