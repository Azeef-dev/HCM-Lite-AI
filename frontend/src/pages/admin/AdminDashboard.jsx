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
    TrendingDown,
    Wallet,
    Banknote,
    Building2,
    PieChart,
    History,
    Sparkles,
    Loader2,
} from "lucide-react";

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [aiSummary, setAiSummary] = useState(null);
    const [summarizing, setSummarizing] = useState(false);

    useEffect(() => {
        dashboardApi.admin()
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

    if (loading) return <DashboardSkeleton />;
    if (error) return <p className="text-sm text-destructive">{error}</p>;
    if (!data) return null;

    const deptList = toArray(data.headcountByDepartment);
    const genderList = toArray(data.genderSplit);
    const auditList = toArray(data.auditFeed);
    const maxDept = Math.max(1, ...deptList.map((d) => d.count ?? d.value ?? 0));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Company-wide overview & executive analytics</p>
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
                            AI Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {aiSummary}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Headcount" value={safe(data.kpis?.headcount ?? data.headcount, 0)} icon={Users} color="primary" />
                <StatCard label="Attrition YTD" value={`${safe(data.kpis?.attritionYtd ?? data.attritionYtd, 0)}%`} icon={TrendingDown} color="warning" />
                <StatCard label="Payroll Cost YTD" value={`Rs ${Number(safe(data.kpis?.payrollCostYtd ?? data.payrollCostYtd, 0)).toLocaleString()}`} icon={Wallet} color="success" />
                <StatCard label="Avg Salary" value={`Rs ${Number(safe(data.kpis?.avgSalary ?? data.avgSalary, 0)).toLocaleString()}`} icon={Banknote} color="info" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <Building2 className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold">Headcount by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deptList.length === 0 ? (
                            <EmptyState icon={Building2} title="No department data yet" description="Add departments and employees to see this breakdown." />
                        ) : (
                            <div className="space-y-3">
                                {deptList.map((d, i) => {
                                    const label = d.department || d.key || d._id || "Unknown";
                                    const count = d.count ?? d.value ?? 0;
                                    return (
                                        <div key={label + i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">{label}</span>
                                                <span className="text-muted-foreground">{count}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${(count / maxDept) * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-xs">
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <PieChart className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold">Gender Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {genderList.length === 0 ? (
                            <EmptyState icon={PieChart} title="No data yet" />
                        ) : (
                            <div className="space-y-3">
                                {genderList.map((g, i) => (
                                    <div key={(g.gender || g.key || i) + ""} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                        <span className="capitalize">{g.gender || g.key || "Unknown"}</span>
                                        <span className="font-semibold">{g.count ?? g.value ?? 0}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <History className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold">Recent Audit Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {auditList.length === 0 ? (
                        <EmptyState icon={History} title="No activity yet" description="Actions performed across the app will show up here." />
                    ) : (
                        <div className="space-y-1">
                            {auditList.map((a, i) => (
                                <div key={a._id || i} className="flex items-center justify-between text-sm py-2.5 border-b last:border-0">
                                    <div>
                                        <span className="font-medium">{a.actorName || "Admin"}</span>{" "}
                                        <span className="text-muted-foreground">{a.action} {a.entity}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-56" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64" /><Skeleton className="h-64" />
            </div>
        </div>
    );
}
