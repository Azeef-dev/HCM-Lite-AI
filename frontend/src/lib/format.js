export function formatDate(d) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatDateTime(d) {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function formatCurrency(n) {
    return `Rs ${Number(n || 0).toLocaleString()}`;
}
export function toDateInputValue(d) {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
}