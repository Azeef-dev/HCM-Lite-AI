import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { toArray, safe } from "@/lib/normalize";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        dashboardApi
            .employee()
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

    const leaveBalance = toArray(data.leaveBalance);
    const announcements = toArray(data.announcements);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Hours This Week</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{safe(data.hoursThisWeek, 0)} / 40h</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Late This Month</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{safe(data.lateCountThisMonth, 0)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today's Status</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold capitalize">{safe(data.checkInStatusToday, "Not checked in")}</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Leave Balance</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {leaveBalance.length === 0 && <p className="text-sm text-muted-foreground">No leave types configured.</p>}
                    {leaveBalance.map((l, i) => (
                        <div key={l.leaveType || l.key || i} className="flex justify-between text-sm">
                            <span>{l.leaveType || l.key || "Unknown"}</span>
                            <span className="font-medium">{l.remaining ?? l.value ?? 0} remaining</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {data.lastPayslip && (
                <Card>
                    <CardHeader><CardTitle>Last Payslip</CardTitle></CardHeader>
                    <CardContent className="text-sm">
                        <p>
                            {data.lastPayslip.month}/{data.lastPayslip.year} — Net Pay: Rs{" "}
                            {Number(safe(data.lastPayslip.netPay, 0)).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
                    {announcements.map((a, i) => (
                        <div key={a._id || i} className="text-sm border-b last:border-0 pb-2">
                            <p className="font-medium">{a.title}</p>
                            <p className="text-muted-foreground">{a.message}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}