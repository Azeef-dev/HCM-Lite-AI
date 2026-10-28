import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toArray, safe } from "@/lib/normalize";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import NoEmployeeProfileNotice from "@/components/NoEmployeeProfileNotice";
import { Badge } from "@/components/ui/badge";
import { Clock, AlarmClock, CheckCircle2, CalendarDays, Wallet, Megaphone } from "lucide-react";

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        dashboardApi.employee()
            .then(setData)
            .catch((err) => { setError(err.message || "Failed to load dashboard"); toast.error(err.message || "Failed to load dashboard"); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton className="h-96" />;
    if (error) return <p className="text-sm text-destructive">{error}</p>;
    if (!data) return null;

    const leaveBalance = toArray(data.leaveBalance);
    const announcements = toArray(data.announcements);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Your personal snapshot</p>
            </div>

            {!user?.employeeId && <NoEmployeeProfileNotice />}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Hours This Week" value={`${safe(data.hoursThisWeek, 0)} / 40h`} icon={Clock} color="primary" />
                <StatCard label="Late This Month" value={safe(data.lateCountThisMonth, 0)} icon={AlarmClock} color="warning" />
                <StatCard
                    label="Today's Status"
                    value={<span className="capitalize">{(safe(data.checkInStatusToday, "not checked in") || "").replace("_", " ")}</span>}
                    icon={CheckCircle2}
                    color="success"
                />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Leave Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    {leaveBalance.length === 0 ? (
                        <EmptyState icon={CalendarDays} title="No leave types configured" />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {leaveBalance.map((l, i) => (
                                <div key={l.leaveType || l.key || i} className="rounded-lg border p-3 text-center">
                                    <p className="text-xs text-muted-foreground">{l.leaveType || l.key || "Unknown"}</p>
                                    <p className="text-xl font-bold mt-1">{l.remaining ?? l.value ?? 0}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {data.lastPayslip && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <Wallet className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Last Payslip</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                        <span>{data.lastPayslip.month}/{data.lastPayslip.year}</span>
                        <Badge variant="success">Rs {Number(safe(data.lastPayslip.netPay, 0)).toLocaleString()}</Badge>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <Megaphone className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                    {announcements.length === 0 ? (
                        <EmptyState icon={Megaphone} title="No announcements yet" />
                    ) : (
                        <div className="space-y-3">
                            {announcements.map((a, i) => (
                                <div key={a._id || i} className="border-b last:border-0 pb-3">
                                    <p className="font-medium text-sm">{a.title}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">{a.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}