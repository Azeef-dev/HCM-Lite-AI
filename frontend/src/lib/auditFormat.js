const HIDDEN_KEYS = new Set([
    "_id", "__v", "password", "createdAt", "updatedAt",
    "resetPasswordTokenHash", "resetPasswordExpires",
]);

const LABELS = {
    name: "Name", email: "Email", role: "Role", status: "Status", action: "Action",
    employeeCode: "Employee Code", department: "Department", designation: "Designation",
    basic: "Basic Salary", salary: "Salary", phone: "Phone", address: "Address",
    isActive: "Active", mustChangePassword: "Must Change Password", company: "Company",
    startDate: "Start Date", endDate: "End Date", reason: "Reason", leaveType: "Leave Type",
    checkInTime: "Check-in Time", checkOutTime: "Check-out Time", month: "Month", year: "Year",
    netPay: "Net Pay", gross: "Gross Pay",
};

// Friendly one-line summaries for short "marker" audit entries that are
// really just an event flag (e.g. { action: "password reset" }) rather
// than a full before/after document — these read far better as a
// sentence than as a field list.
const ACTION_SENTENCES = {
    "password reset": "The user's password was reset.",
    "finalize": "This payroll run was finalized and locked.",
    "approve": "This request was approved.",
    "reject": "This request was rejected.",
};

function labelFor(key) {
    if (LABELS[key]) return LABELS[key];
    const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
    return spaced;
}

function formatPrimitive(value) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    if (typeof value === "string") {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) return d.toLocaleString();
        }
        if (/^[a-f0-9]{24}$/i.test(value)) return `#${value.slice(-6)}`; // Mongo ObjectId — not meaningful to show in full
        return value;
    }
    return String(value);
}

function flattenEntries(obj, prefix = "") {
    const entries = [];
    for (const [key, value] of Object.entries(obj || {})) {
        if (HIDDEN_KEYS.has(key)) continue;
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
            if (value.name) entries.push([path, value.name]); // populated ref like { _id, name }
            else entries.push(...flattenEntries(value, path));
        } else if (Array.isArray(value)) {
            entries.push([path, value.length ? `${value.length} item(s)` : "None"]);
        } else {
            entries.push([path, value]);
        }
    }
    return entries;
}

// If the "after" object is really just a short action marker (one or two
// keys, led by "action"), return a plain-English sentence instead of a
// field list. Returns null when this doesn't apply.
export function describeActionMarker(after) {
    if (!after || typeof after !== "object") return null;
    const keys = Object.keys(after).filter((k) => !HIDDEN_KEYS.has(k));
    if (keys.length === 0 || keys.length > 2 || !keys.includes("action")) return null;
    const action = String(after.action || "").toLowerCase();
    return ACTION_SENTENCES[action] || `Action recorded: ${labelFor(action)}.`;
}

// Turns a raw state object into a clean { label, value } list a
// non-technical reader can skim, instead of a wall of JSON.
export function humanizeAuditState(state) {
    if (state === null || state === undefined || typeof state === "string") return null;
    const entries = flattenEntries(state);
    if (entries.length === 0) return [];
    return entries.map(([key, value]) => ({
        label: labelFor(key.split(".").pop()),
        value: formatPrimitive(value),
    }));
}

// Only the fields that actually changed, as { label, from, to } — far more
// useful than two full side-by-side dumps for everyday edits.
export function humanizeAuditDiff(before, after) {
    if (!before || typeof before === "string" || typeof before !== "object") return null;
    if (!after || typeof after !== "object") return null;

    const beforeEntries = Object.fromEntries(flattenEntries(before));
    const afterEntries = Object.fromEntries(flattenEntries(after));
    const keys = new Set([...Object.keys(beforeEntries), ...Object.keys(afterEntries)]);

    const changes = [];
    for (const key of keys) {
        const from = beforeEntries[key];
        const to = afterEntries[key];
        if (String(from ?? "") === String(to ?? "")) continue;
        changes.push({ label: labelFor(key.split(".").pop()), from: formatPrimitive(from), to: formatPrimitive(to) });
    }
    return changes;
}