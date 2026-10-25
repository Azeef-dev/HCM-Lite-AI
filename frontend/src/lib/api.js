const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
    return localStorage.getItem("hcm_token");
}
function setToken(token) {
    if (token) localStorage.setItem("hcm_token", token);
    else localStorage.removeItem("hcm_token");
}

async function request(path, { method = "GET", body, headers = {}, isForm = false } = {}) {
    const token = getToken();
    const finalHeaders = { ...headers };
    if (!isForm) finalHeaders["Content-Type"] = "application/json";
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: finalHeaders,
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
        });
    } catch {
        throw { message: "Network error. Please check your connection.", errors: [] };
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok) {
        if (res.status === 401) {
            setToken(null);
            if (!path.includes("/auth/login") && !path.includes("/auth/companies")) {
                window.location.href = "/login";
            }
        }
        throw { status: res.status, message: data?.message || "Something went wrong", errors: data?.errors || [] };
    }
    return data;
}

export const api = {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body, opts = {}) => request(path, { method: "POST", body, ...opts }),
    put: (path, body, opts = {}) => request(path, { method: "PUT", body, ...opts }),
    delete: (path) => request(path, { method: "DELETE" }),
    setToken,
    getToken,
};

export const authApi = {
    status: () => api.get("/auth/status"),
    companies: () => api.get("/auth/companies"),
    setup: (payload) => api.post("/auth/setup", payload),
    registerCompany: (payload) => api.post("/auth/register-company", payload),
    registerUser: (payload) => api.post("/auth/register", payload),
    login: (payload) => api.post("/auth/login", payload),
    me: () => api.get("/auth/me"),
    changePassword: (payload) => api.post("/auth/change-password", payload),
};

export const orgApi = {
    getSettings: () => api.get("/org/settings"),
    updateSettings: (payload) => api.put("/org/settings", payload),
    listDepartments: () => api.get("/org/departments"),
    createDepartment: (payload) => api.post("/org/departments", payload),
    updateDepartment: (id, payload) => api.put(`/org/departments/${id}`, payload),
    deleteDepartment: (id) => api.delete(`/org/departments/${id}`),
    listDesignations: () => api.get("/org/designations"),
    createDesignation: (payload) => api.post("/org/designations", payload),
    updateDesignation: (id, payload) => api.put(`/org/designations/${id}`, payload),
    deleteDesignation: (id) => api.delete(`/org/designations/${id}`),
    listLeaveTypes: () => api.get("/org/leave-types"),
    createLeaveType: (payload) => api.post("/org/leave-types", payload),
    updateLeaveType: (id, payload) => api.put(`/org/leave-types/${id}`, payload),
    deleteLeaveType: (id) => api.delete(`/org/leave-types/${id}`),
    listHolidays: () => api.get("/org/holidays"),
    createHoliday: (payload) => api.post("/org/holidays", payload),
    deleteHoliday: (id) => api.delete(`/org/holidays/${id}`),
    createHr: (payload) => api.post("/org/users/hr", payload),
    listUsers: () => api.get("/org/users"),
    setUserActive: (id, isActive) => api.put(`/org/users/${id}/active`, { isActive }),
    resetPassword: (id) => api.post(`/org/users/${id}/reset-password`),
};

export const employeeApi = {
    create: (payload) => api.post("/employees", payload),
    list: (query = "") => api.get(`/employees${query}`),
    get: (id) => api.get(`/employees/${id}`),
    update: (id, payload) => api.put(`/employees/${id}`, payload),
    csvImport: (formData, dryRun) =>
        api.post(`/employees/csv-import?dryRun=${dryRun ? "true" : "false"}`, formData, { isForm: true }),
    exportUrl: () => `${API_BASE}/employees/export`,
};

export const attendanceApi = {
    checkIn: () => api.post("/attendance/check-in"),
    checkOut: () => api.post("/attendance/check-out"),
    me: (month, year) => api.get(`/attendance/me?month=${month}&year=${year}`),
    requestCorrection: (payload) => api.post("/attendance/correction", payload),
    listCorrections: () => api.get("/attendance/corrections"),
    reviewCorrection: (id, payload) => api.put(`/attendance/corrections/${id}/review`, payload),
    board: (date, department) =>
        api.get(`/attendance/board?date=${date}${department ? `&department=${department}` : ""}`),
};

export const leaveApi = {
    apply: (payload) => api.post("/leave", payload),
    cancel: (id) => api.put(`/leave/${id}/cancel`),
    me: () => api.get("/leave/me"),
    balance: (year) => api.get(`/leave/balance?year=${year}`),
    pending: () => api.get("/leave/pending"),
    all: (query = "") => api.get(`/leave${query}`),
    approve: (id, payload) => api.put(`/leave/${id}/approve`, payload),
    reject: (id, payload) => api.put(`/leave/${id}/reject`, payload),
};

export const payrollApi = {
    createRun: (payload) => api.post("/payroll/runs", payload),
    listRuns: () => api.get("/payroll/runs"),
    getRun: (id) => api.get(`/payroll/runs/${id}`),
    finalizeRun: (id) => api.put(`/payroll/runs/${id}/finalize`),
    myPayslips: () => api.get("/payroll/payslips/me"),
    payslipPdfUrl: (id) => `${API_BASE}/payroll/payslips/${id}/pdf`,
};

export const dashboardApi = {
    admin: () => api.get("/dashboards/admin"),
    hr: () => api.get("/dashboards/hr"),
    employee: () => api.get("/dashboards/employee"),
};

export const aiApi = {
    chat: (message) => api.post("/ai/chat", { message }),
    dashboardSummary: (kpis) => api.post("/ai/dashboard-summary", { kpis }),
    smartLeave: (text) => api.post("/ai/smart-leave", { text }),
};

export const commsApi = {
    createAnnouncement: (payload) => api.post("/comms/announcements", payload),
    listAnnouncements: () => api.get("/comms/announcements"),
    myNotifications: () => api.get("/comms/notifications/me"),
    markRead: (id) => api.put(`/comms/notifications/${id}/read`),
    markAllRead: () => api.put("/comms/notifications/mark-all-read"),
    audit: (query = "") => api.get(`/comms/audit${query}`),
};
