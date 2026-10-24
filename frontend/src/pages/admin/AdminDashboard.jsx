import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { toArray, safe } from "@/lib/normalize";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        dashboardApi
            .admin()
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
        { label: "Attrition YTD", value: `${safe(data.attritionYtd, 0)}%` },
        { label: "Payroll Cost YTD", value: `Rs ${Number(safe(data.payrollCostYtd, 0)).toLocaleString()}` },
        { label: "Avg Salary", value: `Rs ${Number(safe(data.avgSalary, 0)).toLocaleString()}` },
    ];

    const deptList = toArray(data.headcountByDepartment);
    const genderList = toArray(data.genderSplit);
    const auditList = toArray(data.auditFeed);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k) => (
                    <Card key={k.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{k.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Headcount by Department</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {deptList.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
                        {deptList.map((d, i) => (
                            <div key={d.department || d.key || i} className="flex justify-between text-sm">
                                <span>{d.department || d.key || d._id || "Unknown"}</span>
                                <span className="font-medium">{d.count ?? d.value ?? 0}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Gender Split</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {genderList.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
                        {genderList.map((g, i) => (
                            <div key={g.gender || g.key || i} className="flex justify-between text-sm">
                                <span className="capitalize">{g.gender || g.key || g._id || "Unknown"}</span>
                                <span className="font-medium">{g.count ?? g.value ?? 0}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Recent Audit Activity</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {auditList.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
                    {auditList.map((a, i) => (
                        <div key={a._id || i} className="text-sm border-b last:border-0 pb-2">
                            <span className="font-medium">{a.actorName || "Unknown"}</span>{" "}
                            <span className="text-muted-foreground">{a.action} {a.entity}</span>{" "}
                            <span className="text-xs text-muted-foreground">
                                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}