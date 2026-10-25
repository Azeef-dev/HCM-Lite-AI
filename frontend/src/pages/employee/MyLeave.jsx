import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { leaveApi, orgApi } from "@/lib/api";
import { formatDate } from "@/lib/time";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import DropdownSelect from "@/components/DropdownSelect";
import { validateFreeText, validateIsoDate } from "@/lib/validators";
import { CalendarDays, Plus, X, Send } from "lucide-react";

const initialForm = { leaveType: "", startDate: "", endDate: "", reason: "" };

export default function MyLeave() {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [balance, setBalance] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);

    function load() {
        setLoading(true);
        Promise.all([
            leaveApi.me(),
            leaveApi.balance(new Date().getFullYear()),
            orgApi.listLeaveTypes(),
        ])
            .then(([myLeaves, bal, types]) => {
                setRequests(myLeaves.leaves || myLeaves.requests || myLeaves || []);
                setBalance(bal.balance || bal || []);
                setLeaveTypes(types.leaveTypes || types || []);
            })
            .catch((err) => toast.error(err.message || "Failed to load leave data"))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function validate() {
        const e = {};
        if (!form.leaveType) e.leaveType = "Please select a leave type";
        e.startDate = validateIsoDate(form.startDate, { label: "Start date" });
        e.endDate = validateIsoDate(form.endDate, { label: "End date" });
        if (!e.startDate && !e.endDate && new Date(form.endDate) < new Date(form.startDate)) {
            e.endDate = "End date cannot be before start date";
        }
        e.reason = validateFreeText(form.reason, { min: 3, max: 300, label: "Reason" });
        Object.keys(e).forEach((k) => !e[k] && delete e[k]);
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await leaveApi.apply({
                leaveTypeId: form.leaveType,
                startDate: form.startDate,
                endDate: form.endDate,
                reason: form.reason.trim(),
            });
            toast.success("Leave request submitted");
            setForm(initialForm);
            setShowForm(false);
            load();
        } catch (err) {
            toast.error(err.message || "Failed to submit leave request");
            if (err.errors?.length) {
                const fe = {};
                err.errors.forEach((e) => (fe[e.field] = e.message));
                setErrors((old) => ({ ...old, ...fe }));
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCancel(id) {
        setCancellingId(id);
        try {
            await leaveApi.cancel(id);
            toast.success("Leave request cancelled");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to cancel request");
        } finally {
            setCancellingId(null);
        }
    }

    const leaveTypeOptions = leaveTypes.map((t) => ({ value: t._id, label: t.name }));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">My Leave</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Apply for leave and track your requests</p>
                </div>
                <Button onClick={() => setShowForm((s) => !s)} className="gap-2">
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? "Cancel" : "Apply for Leave"}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader><CardTitle className="text-base">New Leave Request</CardTitle></CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Leave Type</label>
                                <DropdownSelect
                                    value={form.leaveType}
                                    onChange={(v) => setForm((f) => ({ ...f, leaveType: v }))}
                                    options={leaveTypeOptions}
                                    placeholder="Select leave type"
                                    triggerClassName="w-full"
                                />
                                {errors.leaveType && <p className="text-xs text-destructive">{errors.leaveType}</p>}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                                    {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                                    {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Reason</label>
                                <Textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Briefly explain the reason for leave…" />
                                {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
                            </div>
                            <Button type="submit" className="gap-2" disabled={submitting}>
                                <Send className="h-4 w-4" /> {submitting ? "Submitting…" : "Submit Request"}
                            </Button>
                        </CardContent>
                    </form>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Leave Balance ({new Date().getFullYear()})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-20" />
                    ) : balance.length === 0 ? (
                        <EmptyState icon={CalendarDays} title="No leave types configured" />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {balance.map((b, i) => (
                                <div key={b.leaveType || b.leaveTypeId || i} className="rounded-lg border p-3 text-center">
                                    <p className="text-xs text-muted-foreground">{b.leaveType || b.name}</p>
                                    <p className="text-xl font-bold mt-1">{b.remaining ?? "∞"}</p>
                                    <p className="text-[10px] text-muted-foreground">of {b.quota ?? "Unlimited"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">My Requests</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : requests.length === 0 ? (
                        <EmptyState icon={CalendarDays} title="No leave requests yet" description="Apply for leave using the button above." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Dates</th>
                                        <th className="px-4 py-3 font-medium">Days</th>
                                        <th className="px-4 py-3 font-medium">Reason</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((r) => (
                                        <tr key={r._id} className="border-b last:border-0 hover:bg-muted/40">
                                            <td className="px-4 py-3">{r.leaveType?.name || r.leaveTypeName || "—"}</td>
                                            <td className="px-4 py-3">{formatDate(r.startDate)} – {formatDate(r.endDate)}</td>
                                            <td className="px-4 py-3">{r.days ?? "—"}</td>
                                            <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={r.reason}>{r.reason}</td>
                                            <td className="px-4 py-3"><Badge variant={statusBadge(r.status)}>{r.status}</Badge></td>
                                            <td className="px-4 py-3 text-right">
                                                {(r.status === "pending" || r.status === "approved") && (
                                                    <Button size="sm" variant="ghost" disabled={cancellingId === r._id} onClick={() => handleCancel(r._id)}>
                                                        {cancellingId === r._id ? "Cancelling…" : "Cancel"}
                                                    </Button>
                                                )}
                                            </td>
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