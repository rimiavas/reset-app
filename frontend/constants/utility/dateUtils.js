export const formatDate = (date) =>
    date
        ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(
              2,
              "0"
          )}/${date.getFullYear()}`
        : "";

export const formatTime = (date) =>
    date
        ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
              2,
              "0"
          )}`
        : "";

export const formatDateInput = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const formatTimeInput = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};
