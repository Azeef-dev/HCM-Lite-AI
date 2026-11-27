import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { analyticsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { AlertTriangle, TrendingDown, Info, Users } from "lucide-react";

const BAND_STYLES = {
    High: "bg-destructive/10 text-destructive border-destructive/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default function Analytics() {
    const [risk, setRisk] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([analyticsApi.attritionRisk(), analyticsApi.absenceAnomalies()])
            .then(([riskRes, anomalyRes]) => {
                setRisk(riskRes?.data || []);
                setAnomalies(anomalyRes?.data || []);
            })
            .catch((err) => toast.error(err.message || "Failed to load analytics"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Workforce Analytics</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Heuristic signals based on attendance and leave patterns — a prompt to review, not a prediction.
                </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                    These scores only look at the last 3 months of attendance and leave data — they know nothing about
                    compensation, role satisfaction, or anything outside this system. Treat a high score as a reason
                    to check in with someone, not as a verdict.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        Attrition Risk
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : risk.length === 0 ? (
                        <div className="p-6">
                            <EmptyState icon={Users} title="No data yet" description="Scores will appear once there's enough attendance history." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Employee</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">Score</th>
                                        <th className="px-4 py-3 font-medium">Risk Band</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {risk.map((r) => (
                                        <tr key={r.employeeId} className="border-b last:border-0">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{r.name}</p>
                                                <p className="text-xs text-muted-foreground">{r.employeeCode}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{r.department || "—"}</td>
                                            <td className="px-4 py-3 font-semibold">{r.score}/100</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${BAND_STYLES[r.band] || ""}`}>
                                                    {r.band}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Absence Anomalies This Month
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : anomalies.length === 0 ? (
                        <div className="p-6">
                            <EmptyState icon={AlertTriangle} title="Nothing unusual" description="No employee's absences this month are a significant jump from their own recent pattern." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Employee</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">This Month</th>
                                        <th className="px-4 py-3 font-medium">Usual Average</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {anomalies.map((a) => (
                                        <tr key={a.employeeId} className="border-b last:border-0">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{a.name}</p>
                                                <p className="text-xs text-muted-foreground">{a.employeeCode}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{a.department || "—"}</td>
                                            <td className="px-4 py-3 font-semibold text-destructive">{a.currentAbsentDays} days absent</td>
                                            <td className="px-4 py-3 text-muted-foreground">{a.baselineAvgAbsentDays} days/month</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}