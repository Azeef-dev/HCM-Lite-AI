import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HrDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi.hr()
            .then(setData)
            .catch((err) => toast.error(err.message || "Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton className="h-96" />;
    if (!data) return <p className="text-muted-foreground">No data available.</p>;

    const kpis = [
        { label: "Headcount", value: data.headcount },
        { label: "Present Today", value: data.presentToday },
        { label: "On Leave Today", value: data.onLeaveToday },
        { label: "Late Today", value: data.lateToday },
        { label: "Pending Approvals", value: data.pendingApprovals },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">HR Dashboard</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpis.map((k) => (
                    <Card key={k.label}>
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{k.label}</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-bold">{k.value}</p></CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Top Late Comers</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(data.topLateComers || []).map((e) => (
                            <div key={e.employeeId} className="flex justify-between text-sm">
                                <span>{e.name}</span><span className="font-medium">{e.lateCount} days</span>
                            </div>
                        ))}
                        {(!data.topLateComers?.length) && <p className="text-sm text-muted-foreground">No late comers recorded.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Leave by Type (This Year)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(data.leaveByType || []).map((l) => (
                            <div key={l.leaveType} className="flex justify-between text-sm">
                                <span>{l.leaveType}</span><span className="font-medium">{l.count}</span>
                            </div>
                        ))}
                        {(!data.leaveByType?.length) && <p className="text-sm text-muted-foreground">No leave data yet.</p>}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Absenteeism by Department</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {(data.absenteeismByDepartment || []).map((d) => (
                        <div key={d.department} className="flex justify-between text-sm">
                            <span>{d.department}</span><span className="font-medium">{d.absentCount}</span>
                        </div>
                    ))}
                    {(!data.absenteeismByDepartment?.length) && <p className="text-sm text-muted-foreground">No data yet.</p>}
                </CardContent>
            </Card>
        </div>
    );
}