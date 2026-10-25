import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { payrollApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Badge, statusBadge } from "@/components/ui/badge";
import { toArray, safe } from "@/lib/normalize";
import { ArrowLeft, Loader2, CheckCircle2, Users, Wallet, TrendingDown, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function PayrollRunDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const canManage = user?.role === "hr";

    const [run, setRun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [finalizing, setFinalizing] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await payrollApi.getRun(id);
            setRun(res?.data ?? res);
        } catch (err) {
            toast.error(err.message || "Failed to load payroll run");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function handleFinalize() {
        if (!window.confirm("Finalize this payroll run? This action cannot be undone.")) return;
        setFinalizing(true);
        try {
            await payrollApi.finalizeRun(id);
            toast.success("Payroll run finalized");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to finalize payroll run");
        } finally {
            setFinalizing(false);
        }
    }

    if (loading) {
        return (
            <div className="py-16 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!run) {
        return <EmptyState icon={Wallet} title="Payroll run not found" description="This payroll run may have been removed." />;
    }

    const payslips = toArray(run.payslips);
    const totalGross = payslips.reduce((sum, p) => sum + Number(safe(p.grossPay, 0)), 0);
    const totalDeductions = payslips.reduce((sum, p) => sum + Number(safe(p.totalDeductions, 0)), 0);
    const totalNet = payslips.reduce((sum, p) => sum + Number(safe(p.netPay, 0)), 0);
    const status = safe(run.status, "draft");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Payroll Run — {run.month}/{run.year}
                        </h1>
                        <div className="mt-1">
                            <Badge variant={statusBadge(status)}>{status}</Badge>
                        </div>
                    </div>
                </div>
                {canManage && status === "draft" && (
                    <Button onClick={handleFinalize} disabled={finalizing}>
                        {finalizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Finalize Run
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Employees" value={payslips.length} color="primary" />
                <StatCard icon={Wallet} label="Total Gross" value={totalGross.toLocaleString()} color="info" />
                <StatCard icon={TrendingDown} label="Total Deductions" value={totalDeductions.toLocaleString()} color="warning" />
                <StatCard icon={CheckCircle2} label="Total Net Pay" value={totalNet.toLocaleString()} color="success" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payslips</CardTitle>
                </CardHeader>
                <CardContent>
                    {payslips.length === 0 ? (
                        <EmptyState icon={FileText} title="No payslips in this run" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">Employee</th>
                                        <th className="py-2 pr-4 font-medium">Basic</th>
                                        <th className="py-2 pr-4 font-medium">Allowances</th>
                                        <th className="py-2 pr-4 font-medium">Deductions</th>
                                        <th className="py-2 pr-4 font-medium">Tax</th>
                                        <th className="py-2 pr-4 font-medium">Net Pay</th>
                                        <th className="py-2 pr-4 font-medium text-right">Payslip</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payslips.map((p) => {
                                        const pid = p._id || p.id;
                                        return (
                                            <tr key={pid} className="border-b last:border-0 hover:bg-muted/40">
                                                <td className="py-3 pr-4 font-medium">{safe(p.employeeName, p.employee?.name) || "—"}</td>
                                                <td className="py-3 pr-4">{safe(p.basicSalary, 0)}</td>
                                                <td className="py-3 pr-4">{safe(p.allowances, 0)}</td>
                                                <td className="py-3 pr-4">{safe(p.totalDeductions, 0)}</td>
                                                <td className="py-3 pr-4">{safe(p.tax, 0)}</td>
                                                <td className="py-3 pr-4 font-semibold">{safe(p.netPay, 0)}</td>
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