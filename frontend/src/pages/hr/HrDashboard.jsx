import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi, aiApi } from "@/lib/api";
import { toArray, safe } from "@/lib/normalize";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import {
    Users,
    UserCheck,
    CalendarOff,
    Clock,
    ClipboardList,
    AlarmClockOff,
    PieChart,
    Building2,
    Sparkles,
    Loader2,
} from "lucide-react";

export default function HrDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [aiSummary, setAiSummary] = useState(null);
    const [summarizing, setSummarizing] = useState(false);

    useEffect(() => {
        dashboardApi.hr()
            .then(setData)
            .catch((err) => {
                setError(err.message || "Failed to load dashboard");
                toast.error(err.message || "Failed to load dashboard");
            })
            .finally(() => setLoading(false));
    }, []);

    async function handleGenerateAiSummary() {
        if (!data?.kpis) return;
        setSummarizing(true);
        try {
            const res = await aiApi.dashboardSummary(data.kpis);
            const content = res?.summary || res?.data?.summary || res?.answer || "No summary available.";
            setAiSummary(content);
            toast.success("AI summary generated");
        } catch (err) {
            toast.error(err.message || "Failed to generate AI summary");
        } finally {
            setSummarizing(false);
        }
    }

    if (loading) return <Skeleton className="h-96" />;
    if (error) return <p className="text-sm text-destructive">{error}</p>;
    if (!data) return null;

    const lateComers = toArray(data.topLateComers);
    const leaveByType = toArray(data.leaveByType);
    const absenteeism = toArray(data.absenteeismByDepartment);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Daily operations & workforce attendance snapshot</p>
                </div>
                <Button
                    onClick={handleGenerateAiSummary}
                    disabled={summarizing}
                    variant="outline"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                >
                    {summarizing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="h-4 w-4" />
                    )}
                    {aiSummary ? "Refresh AI Summary" : "Generate AI Summary"}
                </Button>
            </div>

            {/* AI Summary Banner */}
            {aiSummary && (
                <Card className="border-primary/30 bg-primary/5 shadow-xs animate-in fade-in duration-200">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-semibold text-primary">
                            AI Operational Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {aiSummary}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard label="Headcount" value={safe(data.kpis?.headcount ?? data.headcount, 0)} icon={Users} color="primary" />
                <StatCard label="Present Today" value={safe(data.kpis?.presentToday ?? data.presentToday, 0)} icon={UserCheck} color="success" />
                <StatCard label="On Leave Today" value={safe(data.kpis?.onLeaveToday ?? data.onLeaveToday, 0)} icon={CalendarOff} color="info" />
                <StatCard label="Late Today" value={safe(data.kpis?.lateToday ?? data.lateToday, 0)} icon={Clock} color="warning" />
                <StatCard label="Pending Approvals" value={safe(data.kpis?.pendingApprovals ?? data.pendingApprovals, 0)} icon={ClipboardList} color="destructive" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <AlarmClockOff className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold">Top Late Comers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lateComers.length === 0 ? (
                            <EmptyState icon={AlarmClockOff} title="No late comers recorded" />
                        ) : (
                            <div className="space-y-1">
                                {lateComers.map((e, i) => (
                                    <div key={e.employeeId || e.employee?._id || i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                        <span className="font-medium">{e.name || e.employee?.name || "Unknown"}</span>
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                                            {e.lateCount ?? e.count ?? 0} days
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-xs">
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <PieChart className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold">Approved Leave by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaveByType.length === 0 ? (
                            <EmptyState icon={PieChart} title="No leave data recorded" />
                        ) : (
                            <div className="space-y-3">
                                {leaveByType.map((l, i) => (
                                    <div key={(l.leaveType || l.key || i) + ""} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                        <span className="capitalize">{l.leaveType || l.key || "Leave"}</span>
                                        <span className="font-semibold">{l.count ?? 0}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
