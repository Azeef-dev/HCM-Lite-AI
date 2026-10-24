import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi.admin()
            .then(setData)
            .catch((err) => toast.error(err.message || "Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton className="h-96" />;
    if (!data) return <p className="text-muted-foreground">No data available.</p>;

    const kpis = [
        { label: "Headcount", value: data.headcount },
        { label: "Attrition YTD", value: `${data.attritionYtd ?? 0}%` },
        { label: "Payroll Cost YTD", value: `Rs ${Number(data.payrollCostYtd || 0).toLocaleString()}` },
        { label: "Avg Salary", value: `Rs ${Number(data.avgSalary || 0).toLocaleString()}` },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k) => (
                    <Card key={k.label}>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{k.value}</p></CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Headcount by Department</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(data.headcountByDepartment || []).map((d) => (
                            <div key={d.department} className="flex justify-between text-sm">
                                <span>{d.department}</span><span className="font-medium">{d.count}</span>
                            </div>
                        ))}
                        {(!data.headcountByDepartment?.length) && <p className="text-sm text-muted-foreground">No data yet.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Gender Split</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(data.genderSplit || []).map((g) => (
                            <div key={g.gender} className="flex justify-between text-sm">
                                <span className="capitalize">{g.gender}</span><span className="font-medium">{g.count}</span>
                            </div>
                        ))}
                        {(!data.genderSplit?.length) && <p className="text-sm text-muted-foreground">No data yet.</p>}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Recent Audit Activity</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {(data.auditFeed || []).map((a) => (
                        <div key={a._id} className="text-sm border-b last:border-0 pb-2">
                            <span className="font-medium">{a.actorName}</span>{" "}
                            <span className="text-muted-foreground">{a.action} {a.entity}</span>{" "}
                            <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                    ))}
                    {(!data.auditFeed?.length) && <p className="text-sm text-muted-foreground">No activity yet.</p>}
                </CardContent>
            </Card>
        </div>
    );
}