import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { attendanceApi } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/time";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { ClipboardCheck, Check, X } from "lucide-react";

export default function CorrectionRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState({});
    const [acting, setActing] = useState(null);

    function load() {
        setLoading(true);
        attendanceApi.listCorrections()
            .then((res) => setRequests(res.corrections || res.requests || res || []))
            .catch((err) => toast.error(err.message || "Failed to load correction requests"))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    async function review(id, decision) {
        setActing(id);
        try {
            await attendanceApi.reviewCorrection(id, { decision, comment: comments[id] || "" });
            toast.success(`Correction ${decision}`);
            load();
        } catch (err) {
            toast.error(err.message || "Failed to review request");
        } finally {
            setActing(null);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Attendance Correction Requests</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Review and approve/reject employee correction requests</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
                    ) : requests.length === 0 ? (
                        <EmptyState icon={ClipboardCheck} title="No pending correction requests" />
                    ) : (
                        <div className="space-y-4">
                            {requests.map((r) => (
                                <div key={r._id} className="border rounded-xl p-4 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{r.employee?.name || r.employeeName}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(r.date)}</p>
                                        </div>
                                        <Badge variant="warning">Pending</Badge>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3 text-sm bg-muted/40 rounded-lg p-3">
                                        <p><span className="text-muted-foreground">Requested Check-In:</span> {formatTime(r.correction?.requestedCheckIn) || "—"}</p>
                                        <p><span className="text-muted-foreground">Requested Check-Out:</span> {formatTime(r.correction?.requestedCheckOut) || "—"}</p>
                                        <p className="sm:col-span-2"><span className="text-muted-foreground">Reason:</span> {r.correction?.reason}</p>
                                    </div>
                                    <Input
                                        placeholder="Optional review comment…"
                                        value={comments[r._id] || ""}
                                        onChange={(e) => setComments((c) => ({ ...c, [r._id]: e.target.value }))}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" className="gap-1.5" disabled={acting === r._id} onClick={() => review(r._id, "approved")}>
                                            <Check className="h-3.5 w-3.5" /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1.5" disabled={acting === r._id} onClick={() => review(r._id, "rejected")}>
                                            <X className="h-3.5 w-3.5" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}