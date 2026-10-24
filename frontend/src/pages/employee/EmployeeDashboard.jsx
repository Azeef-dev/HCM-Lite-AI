import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi.employee()
            .then(setData)
            .catch((err) => toast.error(err.message || "Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton className="h-96" />;
    if (!data) return <p className="text-muted-foreground">No data available.</p>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Hours This Week</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{data.hoursThisWeek} / 40h</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Late This Month</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{data.lateCountThisMonth}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today's Status</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold capitalize">{data.checkInStatusToday || "Not checked in"}</p></CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Leave Balance</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {(data.leaveBalance || []).map((l) => (
                        <div key={l.leaveType} className="flex justify-between text-sm">
                            <span>{l.leaveType}</span><span className="font-medium">{l.remaining} remaining</span>
                        </div>
                    ))}
                    {(!data.leaveBalance?.length) && <p className="text-sm text-muted-foreground">No leave types configured.</p>}
                </CardContent>
            </Card>
            {data.lastPayslip && (
                <Card>
                    <CardHeader><CardTitle>Last Payslip</CardTitle></CardHeader>
                    <CardContent className="text-sm">
                        <p>{data.lastPayslip.month}/{data.lastPayslip.year} — Net Pay: Rs {Number(data.lastPayslip.netPay).toLocaleString()}</p>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {(data.announcements || []).map((a) => (
                        <div key={a._id} className="text-sm border-b last:border-0 pb-2">
                            <p className="font-medium">{a.title}</p>
                            <p className="text-muted-foreground">{a.message}</p>
                        </div>
                    ))}
                    {(!data.announcements?.length) && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
                </CardContent>
            </Card>
        </div>
    );
}