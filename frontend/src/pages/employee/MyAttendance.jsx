import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { attendanceApi } from "@/lib/api";
import { formatTime, formatDate } from "@/lib/time";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/EmptyState";
import { Clock, LogIn, LogOut, CalendarClock, AlertCircle } from "lucide-react";
import { validateFreeText, validateIsoDate } from "@/lib/validators";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function MyAttendance() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [showCorrection, setShowCorrection] = useState(null);
    const [form, setForm] = useState({ requestedCheckIn: "", requestedCheckOut: "", reason: "" });
    const [errors, setErrors] = useState({});

    function load() {
        setLoading(true);
        attendanceApi.me(month, year)
            .then((res) => setRecords(res.attendance || res.records || res || []))
            .catch((err) => toast.error(err.message || "Failed to load attendance"))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, [month, year]);

    const today = records.find((r) => formatDate(r.date) === formatDate(new Date()));
    const canCheckIn = !today || !today.checkInTime;
    const canCheckOut = today && today.checkInTime && !today.checkOutTime;

    async function handleCheckIn() {
        setActing(true);
        try {
            await attendanceApi.checkIn();
            toast.success("Checked in successfully");
            load();
        } catch (err) {
            toast.error(err.message || "Check-in failed");
        } finally {
            setActing(false);
        }
    }

    async function handleCheckOut() {
        setActing(true);
        try {
            await attendanceApi.checkOut();
            toast.success("Checked out successfully");
            load();
        } catch (err) {
            toast.error(err.message || "Check-out failed");
        } finally {
            setActing(false);
        }
    }

    function openCorrection(record) {
        setShowCorrection(record.date);
        setForm({ requestedCheckIn: "", requestedCheckOut: "", reason: "" });
        setErrors({});
    }

    function validateCorrection() {
        const e = {};
        e.reason = validateFreeText(form.reason, { min: 3, max: 300, label: "Reason" });
        Object.keys(e).forEach((k) => !e[k] && delete e[k]);
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function submitCorrection(date) {
        if (!validateCorrection()) return;
        try {
            await attendanceApi.requestCorrection({
                date,
                requestedCheckIn: form.requestedCheckIn || undefined,
                requestedCheckOut: form.requestedCheckOut || undefined,
                reason: form.reason.trim(),
            });
            toast.success("Correction request submitted");
            setShowCorrection(null);
            load();
        } catch (err) {
            toast.error(err.message || "Failed to submit correction");
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Attendance</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Track your daily check-in/out and history</p>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Clock className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Today, {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
                            <p className="text-lg font-bold">
                                {today?.checkInTime ? `Checked in at ${formatTime(today.checkInTime)}` : "Not checked in yet"}
                                {today?.checkOutTime && ` · Checked out at ${formatTime(today.checkOutTime)}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleCheckIn} disabled={!canCheckIn || acting} className="gap-2">
                            <LogIn className="h-4 w-4" /> Check In
                        </Button>
                        <Button onClick={handleCheckOut} disabled={!canCheckOut || acting} variant="outline" className="gap-2">
                            <LogOut className="h-4 w-4" /> Check Out
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /> Attendance History</CardTitle>
                    <div className="flex gap-2">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : records.length === 0 ? (
                        <EmptyState icon={CalendarClock} title="No attendance records for this month" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Check In</th>
                                        <th className="px-4 py-3 font-medium">Check Out</th>
                                        <th className="px-4 py-3 font-medium">Hours</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r) => (
                                        <>
                                            <tr key={r._id || r.date} className="border-b last:border-0 hover:bg-muted/40">
                                                <td className="px-4 py-3">{formatDate(r.date)}</td>
                                                <td className="px-4 py-3">{formatTime(r.checkInTime)}</td>
                                                <td className="px-4 py-3">{formatTime(r.checkOutTime)}</td>
                                                <td className="px-4 py-3">{r.workingHours ?? "—"}</td>
                                                <td className="px-4 py-3"><Badge variant={statusBadge(r.status)}>{r.status?.replace("_", " ")}</Badge></td>
                                                <td className="px-4 py-3 text-right">
                                                    {r.correction?.status === "pending" ? (
                                                        <Badge variant="warning">Correction Pending</Badge>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" onClick={() => openCorrection(r)}>Request Fix</Button>
                                                    )}
                                                </td>
                                            </tr>
                                            {showCorrection === r.date && (
                                                <tr className="bg-muted/30">
                                                    <td colSpan={6} className="px-4 py-4">
                                                        <div className="space-y-3 max-w-xl">
                                                            <div className="flex items-center gap-2 text-sm font-medium"><AlertCircle className="h-4 w-4 text-amber-500" /> Request Attendance Correction</div>
                                                            <div className="grid sm:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-xs font-medium">Correct Check-In Time</label>
                                                                    <Input type="time" value={form.requestedCheckIn} onChange={(e) => setForm((f) => ({ ...f, requestedCheckIn: e.target.value }))} />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium">Correct Check-Out Time</label>
                                                                    <Input type="time" value={form.requestedCheckOut} onChange={(e) => setForm((f) => ({ ...f, requestedCheckOut: e.target.value }))} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium">Reason</label>
                                                                <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Explain why this correction is needed" />
                                                                {errors.reason && <p className="text-xs text-destructive mt-1">{errors.reason}</p>}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" onClick={() => submitCorrection(r.date)}>Submit Request</Button>
                                                                <Button size="sm" variant="outline" onClick={() => setShowCorrection(null)}>Cancel</Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
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