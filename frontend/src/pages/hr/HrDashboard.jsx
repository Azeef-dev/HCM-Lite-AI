import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { toArray, safe } from "@/lib/normalize";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HrDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        dashboardApi
            .hr()
            .then(setData)
            .catch((err) => {
                setError(err.message || "Failed to load dashboard");
                toast.error(err.message || "Failed to load dashboard");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton className="h-96" />;
    if (error) return <p className="text-sm text-destructive">{error}</p>;
    if (!data) return <p className="text-muted-foreground">No data available.</p>;

    const kpis = [
        { label: "Headcount", value: safe(data.headcount, 0) },
        { label: "Present Today", value: safe(data.presentToday, 0) },
        { label: "On Leave Today", value: safe(data.onLeaveToday, 0) },
        { label: "Late Today", value: safe(data.lateToday, 0) },
        { label: "Pending Approvals", value: safe(data.pendingApprovals, 0) },
    ];

    const lateComers = toArray(data.topLateComers);
    const leaveByType = toArray(data.leaveByType);
    const absenteeism = toArray(data.absenteeismByDepartment);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">HR Dashboard</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpis.map((k) => (
                    <Card key={k.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">{k.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold">{k.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Top Late Comers</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {lateComers.length === 0 && <p className="text-sm text-muted-foreground">No late comers recorded.</p>}
                        {lateComers.map((e, i) => (
                            <div key={e.employeeId || i} className="flex justify-between text-sm">
                                <span>{e.name || e.key || "Unknown"}</span>
                                <span className="font-medium">{e.lateCount ?? e.count ?? 0} days</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Leave by Type (This Year)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {leaveByType.length === 0 && <p className="text-sm text-muted-foreground">No leave data yet.</p>}
                        {leaveByType.map((l, i) => (
                            <div key={l.leaveType || l.key || i} className="flex justify-between text-sm">
                                <span>{l.leaveType || l.key || "Unknown"}</span>
                                <span className="font-medium">{l.count ?? l.value ?? 0}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Absenteeism by Department</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {absenteeism.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
                    {absenteeism.map((d, i) => (
                        <div key={d.department || d.key || i} className="flex justify-between text-sm">
                            <span>{d.department || d.key || "Unknown"}</span>
                            <span className="font-medium">{d.absentCount ?? d.count ?? 0}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}