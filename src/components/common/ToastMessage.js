import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showToast = (message, type = "info") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warn":
      toast.warn(message);
      break;
    default:
      toast(message);
  }
};

export const ToastWrapper = () => (
  <ToastContainer position="top-right" autoClose={3000} />
);
