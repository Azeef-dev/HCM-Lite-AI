// Converts any backend shape (array | object map | null | undefined) into a safe array
export function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
        return Object.entries(value).map(([key, val]) => {
            if (val && typeof val === "object") return { key, ...val };
            return { key, count: val };
        });
    }
    return [];
}

// Safe getter for any key path, returns fallback if missing
export function safe(value, fallback = null) {
    return value === undefined || value === null ? fallback : value;
}