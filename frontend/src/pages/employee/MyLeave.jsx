import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { leaveApi, orgApi, aiApi } from "@/lib/api";
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
import { CalendarDays, Plus, X, Send, Sparkles, Loader2, ArrowRight } from "lucide-react";

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

    // Smart Leave
    const [smartText, setSmartText] = useState("");
    const [smartLoading, setSmartLoading] = useState(false);

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

    useEffect(() => {
        load();
    }, []);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSmartLeave() {
        if (!smartText.trim()) return;
        setSmartLoading(true);
        try {
            const res = await aiApi.smartLeave(smartText.trim());
            const parsed = res?.parsed || res?.data?.parsed;
            if (!parsed) throw new Error("Could not parse leave request");

            // Match leave type from parsed name or id
            let matchedTypeId = parsed.leaveTypeId;
            if (!matchedTypeId && parsed.leaveType) {
                const found = leaveTypes.find(
                    (lt) => lt.name.toLowerCase() === parsed.leaveType.toLowerCase()
                );
                if (found) matchedTypeId = found._id;
            }

            setForm({
                leaveType: matchedTypeId || leaveTypes[0]?._id || "",
                startDate: parsed.startDate ? parsed.startDate.split("T")[0] : "",
                endDate: parsed.endDate ? parsed.endDate.split("T")[0] : "",
                reason: parsed.reason || smartText.trim(),
            });

            toast.success("Form pre-filled by Smart Leave Assistant! Review and submit.");
            setSmartText("");
        } catch (err) {
            toast.error(err.message || "Smart leave failed. Please fill manually.");
        } finally {
            setSmartLoading(false);
        }
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
                    <h1 className="text-2xl font-bold tracking-tight">My Leave</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Apply for leave and track your balances</p>
                </div>
                <Button onClick={() => setShowForm((s) => !s)} className="gap-2">
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? "Cancel" : "Apply for Leave"}
                </Button>
            </div>

            {showForm && (
                <Card className="border-primary/30 shadow-xs animate-in fade-in duration-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">New Leave Application</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Smart Leave AI pre-fill bar */}
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                Smart Leave Assistant (AI)
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Type your request in plain words (e.g. &quot;Need next Monday and Tuesday off for a wedding&quot;) and let AI pre-fill the form.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    value={smartText}
                                    onChange={(e) => setSmartText(e.target.value)}
                                    placeholder="Need next Monday and Tuesday off for my sister's wedding..."
                                    className="bg-background h-9 text-xs"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSmartLeave();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSmartLeave}
                                    disabled={smartLoading || !smartText.trim()}
                                    className="gap-1.5 shrink-0 h-9 text-xs"
                                >
                                    {smartLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-3.5 w-3.5" />
                                    )}
                                    AI Fill
                                </Button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <Textarea
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    placeholder="Briefly explain the reason for your leave request..."
                                />
                                {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
                            </div>

                            <Button type="submit" className="gap-2 w-full sm:w-auto" disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                {submitting ? "Submitting Request..." : "Confirm & Submit Request"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold">Leave Balance ({new Date().getFullYear()})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-20" />
                    ) : balance.length === 0 ? (
                        <EmptyState icon={CalendarDays} title="No leave types configured" />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {balance.map((b, i) => (
                                <div key={b.leaveType || b.leaveTypeId || i} className="rounded-xl border p-3.5 text-center bg-card shadow-2xs">
                                    <p className="text-xs font-medium text-muted-foreground">{b.leaveType || b.name}</p>
                                    <p className="text-2xl font-bold mt-1 text-foreground">{b.remaining ?? "Unlimited"}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Used: {b.used ?? 0} {b.quota > 0 ? `/ ${b.quota}` : ""}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : requests.length === 0 ? (
                        <EmptyState icon={CalendarDays} title="No leave requests yet" description="Your past and pending leave requests will appear here." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
                                    <tr>
                                        <th className="py-2.5 px-3">Type</th>
                                        <th className="py-2.5 px-3">Start Date</th>
                                        <th className="py-2.5 px-3">End Date</th>
                                        <th className="py-2.5 px-3">Days</th>
                                        <th className="py-2.5 px-3">Reason</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {requests.map((r) => {
                                        const badge = statusBadge(r.status);
                                        const canCancel = ["pending", "approved"].includes(r.status);
                                        return (
                                            <tr key={r._id} className="hover:bg-muted/30">
                                                <td className="py-2.5 px-3 font-medium">{r.leaveType?.name || "Leave"}</td>
                                                <td className="py-2.5 px-3 text-xs">{formatDate(r.startDate)}</td>
                                                <td className="py-2.5 px-3 text-xs">{formatDate(r.endDate)}</td>
                                                <td className="py-2.5 px-3 font-semibold">{r.days}</td>
                                                <td className="py-2.5 px-3 max-w-xs truncate text-xs text-muted-foreground">{r.reason}</td>
                                                <td className="py-2.5 px-3">
                                                    <Badge variant={badge.variant} className="capitalize text-xs font-normal">
                                                        {r.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    {canCancel && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-7"
                                                            disabled={cancellingId === r._id}
                                                            onClick={() => handleCancel(r._id)}
                                                        >
                                                            {cancellingId === r._id ? "Cancelling..." : "Cancel"}
                                                        </Button>
                                                    )}
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
