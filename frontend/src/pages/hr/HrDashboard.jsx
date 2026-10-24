import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { toArray, safe } from "@/lib/normalize";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Users, UserCheck, CalendarOff, Clock, ClipboardList, AlarmClockOff, PieChart, Building2 } from "lucide-react";

export default function HrDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        dashboardApi.hr()
            .then(setData)
            .catch((err) => { setError(err.message || "Failed to load dashboard"); toast.error(err.message || "Failed to load dashboard"); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton className="h-96" />;
    if (error) return <p className="text-sm text-destructive">{error}</p>;
    if (!data) return null;

    const lateComers = toArray(data.topLateComers);
    const leaveByType = toArray(data.leaveByType);
    const absenteeism = toArray(data.absenteeismByDepartment);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">HR Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Daily operations snapshot</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard label="Headcount" value={safe(data.headcount, 0)} icon={Users} color="primary" />
                <StatCard label="Present Today" value={safe(data.presentToday, 0)} icon={UserCheck} color="success" />
                <StatCard label="On Leave Today" value={safe(data.onLeaveToday, 0)} icon={CalendarOff} color="info" />
                <StatCard label="Late Today" value={safe(data.lateToday, 0)} icon={Clock} color="warning" />
                <StatCard label="Pending Approvals" value={safe(data.pendingApprovals, 0)} icon={ClipboardList} color="destructive" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <AlarmClockOff className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Top Late Comers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lateComers.length === 0 ? (
                            <EmptyState icon={AlarmClockOff} title="No late comers recorded" />
                        ) : (
                            <div className="space-y-1">
                                {lateComers.map((e, i) => (
                                    <div key={e.employeeId || i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                        <span>{e.name || e.key || "Unknown"}</span>
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">{e.lateCount ?? e.count ?? 0} days</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <PieChart className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Leave by Type (This Year)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaveByType.length === 0 ? (
                            <EmptyState icon={PieChart} title="No leave data yet" />
                        ) : (
                            <div className="space-y-1">
                                {leaveByType.map((l, i) => (
                                    <div key={l.leaveType || l.key || i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                        <span>{l.leaveType || l.key || "Unknown"}</span>
                                        <span className="font-semibold">{l.count ?? l.value ?? 0}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Absenteeism by Department</CardTitle>
                </CardHeader>
                <CardContent>
                    {absenteeism.length === 0 ? (
                        <EmptyState icon={Building2} title="No data yet" />
                    ) : (
                        <div className="space-y-1">
                            {absenteeism.map((d, i) => (
                                <div key={d.department || d.key || i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                    <span>{d.department || d.key || "Unknown"}</span>
                                    <span className="font-semibold text-red-600 dark:text-red-400">{d.absentCount ?? d.count ?? 0}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}