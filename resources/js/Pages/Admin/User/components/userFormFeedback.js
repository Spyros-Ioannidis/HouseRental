import { addToast } from "@/Components/Other/Toast";

export function notifyFormErrors(errors, schema) {
  Object.entries(errors)
    .filter(([, error]) => error)
    .forEach(([field, error]) => {
      addToast(`${schema[field]?.label || field}: ${error}`, "failure");
    });
}
