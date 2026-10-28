import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { commsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import DropdownSelect from "@/components/DropdownSelect";
import {
    ShieldCheck,
    Clock,
    User,
    Eye,
    X,
    FileJson,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

const ACTION_COLORS = {
    create: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    approve: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    finalize: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    reject: "bg-red-500/10 text-red-600 border-red-500/20",
    delete: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const ENTITY_OPTIONS = [
    { value: "", label: "All Entities" },
    { value: "Company", label: "Company" },
    { value: "Employee", label: "Employee" },
    { value: "Department", label: "Department" },
    { value: "LeaveRequest", label: "LeaveRequest" },
    { value: "AttendanceCorrection", label: "AttendanceCorrection" },
    { value: "PayrollRun", label: "PayrollRun" },
    { value: "Announcement", label: "Announcement" },
    { value: "User", label: "User" },
];

const ACTION_OPTIONS = [
    { value: "", label: "All Actions" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "approve", label: "Approve" },
    { value: "finalize", label: "Finalize" },
    { value: "reject", label: "Reject" },
    { value: "delete", label: "Delete" },
];

export default function AuditLog() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [entityFilter, setEntityFilter] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);

    function loadLogs(pg = page) {
        setLoading(true);
        const params = new URLSearchParams({ page: String(pg), limit: "15" });
        if (entityFilter) params.append("entity", entityFilter);
        if (actionFilter) params.append("action", actionFilter);

        commsApi.audit(`?${params.toString()}`)
            .then((res) => {
                setLogs(res.data || []);
                setTotal(res.total || 0);
                setPage(res.page || 1);
                setTotalPages(res.pages || 1);
            })
            .catch((err) => toast.error(err.message || "Failed to load audit logs"))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadLogs(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityFilter, actionFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Immutable record of all create, update, approve, and finalize actions
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadLogs(page)} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card className="p-4 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Target Entity</label>
                        <DropdownSelect
                            value={entityFilter}
                            onChange={setEntityFilter}
                            options={ENTITY_OPTIONS}
                            placeholder="All Entities"
                            triggerClassName="w-full"
                            size="sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Action Type</label>
                        <DropdownSelect
                            value={actionFilter}
                            onChange={setActionFilter}
                            options={ACTION_OPTIONS}
                            placeholder="All Actions"
                            triggerClassName="w-full"
                            size="sm"
                        />
                    </div>

                    <div className="flex items-end">
                        {(entityFilter || actionFilter) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEntityFilter("");
                                    setActionFilter("");
                                }}
                                className="h-9 text-xs gap-1"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <EmptyState
                        icon={ShieldCheck}
                        title="No audit logs found"
                        description="Audit entries will record system events and administrative operations automatically."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                                    <th className="py-3 px-4 font-semibold">Actor</th>
                                    <th className="py-3 px-4 font-semibold">Action</th>
                                    <th className="py-3 px-4 font-semibold">Entity</th>
                                    <th className="py-3 px-4 font-semibold">Entity ID</th>
                                    <th className="py-3 px-4 text-right font-semibold">Changes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {logs.map((log) => {
                                    const actionClass =
                                        ACTION_COLORS[log.action] ||
                                        "bg-muted text-foreground border-border";

                                    return (
                                        <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 opacity-60" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{log.actorName || log.actor?.name || "System"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${actionClass}`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                                                {log.entity}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-mono text-muted-foreground max-w-35 truncate">
                                                {log.entityId || "N/A"}
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                {(log.before || log.after) ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedLog(log)}
                                                        className="h-7 text-xs gap-1 text-primary hover:text-primary"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View Diff
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Showing page {page} of {totalPages} ({total} total actions recorded)
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => loadLogs(page - 1)}
                                className="h-8 text-xs gap-1"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => loadLogs(page + 1)}
                                className="h-8 text-xs gap-1"
                            >
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150 backdrop-blur-xs">
                    <div className="bg-background rounded-xl border max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl">
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileJson className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-base">
                                    Audit Change Details: {selectedLog.action.toUpperCase()} {selectedLog.entity}
                                </h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-b pb-3">
                                <div>
                                    <span className="font-medium text-foreground">Actor: </span>
                                    {selectedLog.actorName || "System"}
                                </div>
                                <div>
                                    <span className="font-medium text-foreground">Recorded At: </span>
                                    {new Date(selectedLog.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                                        Before State
                                    </label>
                                    <pre className="text-xs bg-muted/60 p-3 rounded-lg overflow-x-auto font-mono max-h-80 border">
                                        {selectedLog.before
                                            ? JSON.stringify(selectedLog.before, null, 2)
                                            : "No prior state (Initial creation)"}
                                    </pre>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                                        After State
                                    </label>
                                    <pre className="text-xs bg-muted/60 p-3 rounded-lg overflow-x-auto font-mono max-h-80 border">
                                        {selectedLog.after
                                            ? JSON.stringify(selectedLog.after, null, 2)
                                            : "No after state"}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}