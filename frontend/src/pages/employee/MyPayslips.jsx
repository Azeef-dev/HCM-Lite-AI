import { useEffect, useState } from "react";
import { payrollApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Badge, statusBadge } from "@/components/ui/badge";
import { toArray, safe } from "@/lib/normalize";
import { Wallet, Download, Loader2, FileText, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function MyPayslips() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await payrollApi.myPayslips();
                setPayslips(toArray(res?.data ?? res));
            } catch (err) {
                toast.error(err.message || "Failed to load payslips");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="py-16 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const latest = payslips[0];
    const total = payslips.reduce((sum, p) => sum + Number(safe(p.netPay, 0)), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Payslips</h1>
                <p className="text-sm text-muted-foreground">View and download your salary history.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                    icon={Wallet}
                    label="Latest Net Pay"
                    value={latest ? safe(latest.netPay, "—") : "—"}
                    hint={latest ? `${latest.month}/${latest.year}` : ""}
                    color="primary"
                />
                <StatCard icon={TrendingUp} label="Total Net Pay (All Time)" value={total.toLocaleString()} color="success" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payslip History</CardTitle>
                </CardHeader>
                <CardContent>
                    {payslips.length === 0 ? (
                        <EmptyState icon={FileText} title="No payslips yet" description="Your payslips will appear here once payroll is processed." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">Period</th>
                                        <th className="py-2 pr-4 font-medium">Gross Pay</th>
                                        <th className="py-2 pr-4 font-medium">Deductions</th>
                                        <th className="py-2 pr-4 font-medium">Net Pay</th>
                                        <th className="py-2 pr-4 font-medium">Status</th>
                                        <th className="py-2 pr-4 font-medium text-right">Download</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payslips.map((p) => {
                                        const pid = p._id || p.id;
                                        return (
                                            <tr key={pid} className="border-b last:border-0 hover:bg-muted/40">
                                                <td className="py-3 pr-4 font-medium">{p.month}/{p.year}</td>
                                                <td className="py-3 pr-4">{safe(p.grossPay, 0)}</td>
                                                <td className="py-3 pr-4">{safe(p.totalDeductions, 0)}</td>
                                                <td className="py-3 pr-4 font-semibold">{safe(p.netPay, 0)}</td>
                                                <td className="py-3 pr-4">
                                                    <Badge variant={statusBadge(safe(p.status, "finalized"))}>{safe(p.status, "finalized")}</Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    <a href={payrollApi.payslipPdfUrl(pid)} target="_blank" rel="noreferrer">
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4 mr-1.5" />
                                                            PDF
                                                        </Button>
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}