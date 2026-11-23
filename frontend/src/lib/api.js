// Authenticated file fetches — used for PDFs / CSV exports. A plain
// <a href> or window.open() can't attach an Authorization header, which is
// exactly what was causing "No token provided" on those links. We fetch
// the file ourselves (with the header), turn it into a blob URL, then
// either open it or trigger a download — the token never touches the URL.
async function fetchAuthenticatedBlob(path) {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, { headers });
    } catch {
        throw { message: "Network error. Please check your connection.", errors: [] };
    }

    if (!res.ok) {
        let data = null;
        try { data = await res.json(); } catch { /* not JSON, e.g. a PDF stream */ }
        if (res.status === 401) {
            setToken(null);
            window.location.href = "/login";
        }
        throw { status: res.status, message: data?.message || "Download failed", errors: data?.errors || [] };
    }
    return res.blob();
}

export async function openAuthenticatedFile(path) {
    const blob = await fetchAuthenticatedBlob(path);
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}

export async function downloadAuthenticatedFile(path, filename) {
    const blob = await fetchAuthenticatedBlob(path);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}