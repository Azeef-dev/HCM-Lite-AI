import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { attendanceApi, orgApi } from "@/lib/api";
import { formatTime, todayIso } from "@/lib/time";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import StatCard from "@/components/StatCard";
import DropdownSelect from "@/components/DropdownSelect";
import { Users, UserCheck, UserX, Clock, CalendarOff } from "lucide-react";

export default function AttendanceBoard() {
    const [date, setDate] = useState(todayIso());
    const [department, setDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orgApi.listDepartments().then((res) => setDepartments(res.departments || res || [])).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        attendanceApi.board(date, department)
            .then(setData)
            .catch((err) => toast.error(err.message || "Failed to load board"))
            .finally(() => setLoading(false));
    }, [date, department]);

    const rows = data?.rows || data?.employees || [];
    const summary = data?.summary || {};
    const departmentOptions = [{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d._id, label: d.name }))];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Attendance Board</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Daily attendance overview for all employees</p>
                </div>
                <div className="flex gap-2">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
                    <DropdownSelect value={department} onChange={setDepartment} options={departmentOptions} placeholder="All Departments" />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <StatCard label="Total" value={summary.total ?? rows.length} icon={Users} color="primary" />
                <StatCard label="Present" value={summary.present ?? 0} icon={UserCheck} color="success" />
                <StatCard label="Late" value={summary.late ?? 0} icon={Clock} color="warning" />
                <StatCard label="On Leave" value={summary.onLeave ?? 0} icon={CalendarOff} color="info" />
                <StatCard label="Absent" value={summary.absent ?? 0} icon={UserX} color="destructive" />
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Employee Status — {date}</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : rows.length === 0 ? (
                        <EmptyState icon={Users} title="No records for this date" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Employee</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">Check In</th>
                                        <th className="px-4 py-3 font-medium">Check Out</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => (
                                        <tr key={r.employeeId || r._id || i} className="border-b last:border-0 hover:bg-muted/40">
                                            <td className="px-4 py-3 font-medium">{r.name || r.employeeName}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{r.department || r.departmentName || "—"}</td>
                                            <td className="px-4 py-3">{formatTime(r.checkInTime)}</td>
                                            <td className="px-4 py-3">{formatTime(r.checkOutTime)}</td>
                                            <td className="px-4 py-3"><Badge variant={statusBadge(r.status)}>{(r.status || "off").replace("_", " ")}</Badge></td>
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