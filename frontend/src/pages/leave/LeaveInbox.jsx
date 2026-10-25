import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { leaveApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/time";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import DropdownSelect from "@/components/DropdownSelect";
import StatCard from "@/components/StatCard";
import { ClipboardList, Check, X, Users, Clock } from "lucide-react";

const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
];

export default function LeaveInbox() {
    const { user } = useAuth();
    const canManage = user?.role === "hr";

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("pending");
    const [comments, setComments] = useState({});
    const [acting, setActing] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        leaveApi.all(`?${params.toString()}`)
            .then((res) => setRequests(res.leaves || res.requests || res || []))
            .catch((err) => toast.error(err.message || "Failed to load leave requests"))
            .finally(() => setLoading(false));
    }, [status]);

    useEffect(() => { load(); }, [load]);

    async function handleApprove(id) {
        setActing(id);
        try {
            await leaveApi.approve(id, { comment: comments[id] || "" });
            toast.success("Leave approved");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to approve");
        } finally {
            setActing(null);
        }
    }

    async function handleReject(id) {
        setActing(id);
        try {
            await leaveApi.reject(id, { comment: comments[id] || "" });
            toast.success("Leave rejected");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to reject");
        } finally {
            setActing(null);
        }
    }

    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const approvedCount = requests.filter((r) => r.status === "approved").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{canManage ? "Leave Requests" : "Leave Overview"}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {canManage ? "Review and approve/reject employee leave requests" : "Company-wide leave request records"}
                    </p>
                </div>
                <DropdownSelect value={status} onChange={setStatus} options={statusOptions} placeholder="All Status" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard label="Total Shown" value={requests.length} icon={Users} color="primary" />
                <StatCard label="Pending" value={pendingCount} icon={Clock} color="warning" />
                <StatCard label="Approved" value={approvedCount} icon={Check} color="success" />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : requests.length === 0 ? (
                        <EmptyState icon={ClipboardList} title="No leave requests found" />
                    ) : (
                        <div className="divide-y">
                            {requests.map((r) => (
                                <div key={r._id} className="p-4 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{r.employee?.name || r.employeeName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {r.leaveType?.name || r.leaveTypeName} · {formatDate(r.startDate)} – {formatDate(r.endDate)} · {r.days ?? "—"} day(s)
                                            </p>
                                        </div>
                                        <Badge variant={statusBadge(r.status)}>{r.status}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">{r.reason}</p>

                                    {canManage && r.status === "pending" && (
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="Optional comment…"
                                                value={comments[r._id] || ""}
                                                onChange={(e) => setComments((c) => ({ ...c, [r._id]: e.target.value }))}
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" className="gap-1.5" disabled={acting === r._id} onClick={() => handleApprove(r._id)}>
                                                    <Check className="h-3.5 w-3.5" /> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="gap-1.5" disabled={acting === r._id} onClick={() => handleReject(r._id)}>
                                                    <X className="h-3.5 w-3.5" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}