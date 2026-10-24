export function formatTime(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
}

export function todayIso() {
    return new Date().toISOString().split("T")[0];
}

export function hoursBetween(start, end) {
    if (!start || !end) return 0;
    const diffMs = new Date(end) - new Date(start);
    return Math.round((diffMs / 3600000) * 100) / 100;
}