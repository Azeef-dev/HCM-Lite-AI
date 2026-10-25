import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { payrollApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DropdownSelect from "@/components/DropdownSelect";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Badge, statusBadge } from "@/components/ui/badge";
import { toArray, safe } from "@/lib/normalize";
import { Wallet, Plus, Loader2, FileText, TrendingUp, Eye } from "lucide-react";
import toast from "react-hot-toast";

const MONTHS = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" },
];

function yearOptions() {
    const now = new Date().getFullYear();
    const years = [];
    for (let y = now; y >= now - 5; y--) years.push({ value: y, label: String(y) });
    return years;
}

export default function PayrollRuns() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const canManage = user?.role === "hr";

    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [creating, setCreating] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await payrollApi.listRuns();
            setRuns(toArray(res?.data ?? res));
        } catch (err) {
            toast.error(err.message || "Failed to load payroll runs");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate() {
        setCreating(true);
        try {
            await payrollApi.createRun({ month, year });
            toast.success("Payroll run created");
            setShowCreate(false);
            load();
        } catch (err) {
            toast.error(err.message || "Failed to create payroll run");
        } finally {
            setCreating(false);
        }
    }

    const totalRuns = runs.length;
    const draftRuns = runs.filter((r) => safe(r.status, "draft") === "draft").length;
    const finalizedRuns = runs.filter((r) => r.status === "finalized").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
                    <p className="text-sm text-muted-foreground">
                        {canManage ? "Create and manage payroll runs." : "View payroll run history."}
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setShowCreate((s) => !s)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Payroll Run
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Wallet} label="Total Runs" value={totalRuns} color="primary" />
                <StatCard icon={FileText} label="Draft" value={draftRuns} color="warning" />
                <StatCard icon={TrendingUp} label="Finalized" value={finalizedRuns} color="success" />
            </div>

            {showCreate && canManage && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Create Payroll Run</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Month</label>
                            <DropdownSelect value={month} onChange={setMonth} options={MONTHS} placeholder="Select month" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Year</label>
                            <DropdownSelect value={year} onChange={setYear} options={yearOptions()} placeholder="Select year" />
                        </div>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create Run
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payroll Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-10 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : runs.length === 0 ? (
                        <EmptyState
                            icon={Wallet}
                            title="No payroll runs yet"
                            description={canManage ? "Create your first payroll run to get started." : "No payroll runs have been created yet."}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">Period</th>
                                        <th className="py-2 pr-4 font-medium">Employees</th>
                                        <th className="py-2 pr-4 font-medium">Total Net Pay</th>
                                        <th className="py-2 pr-4 font-medium">Status</th>
                                        <th className="py-2 pr-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.map((r) => {
                                        const id = r._id || r.id;
                                        const periodLabel = `${MONTHS.find((m) => m.value === Number(r.month))?.label || r.month} ${r.year}`;
                                        return (
                                            <tr key={id} className="border-b last:border-0 hover:bg-muted/40">
                                                <td className="py-3 pr-4 font-medium">{periodLabel}</td>
                                                <td className="py-3 pr-4">{safe(r.employeeCount, toArray(r.payslips).length)}</td>
                                                <td className="py-3 pr-4">{safe(r.totalNetPay, "—")}</td>
                                                <td className="py-3 pr-4">
                                                    <Badge variant={statusBadge(r.status)}>{safe(r.status, "draft")}</Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`${canManage ? "/hr" : "/admin"}/payroll/${id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1.5" />
                                                        View
                                                    </Button>
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