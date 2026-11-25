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
import { Users, UserCheck, UserX, Clock, CalendarOff, Camera } from "lucide-react";

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

    const rows = data?.rows || data?.employees || data?.board || [];
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
                <StatCard icon={Users} label="Total Employees" value={summary.totalEmployees ?? rows.length ?? 0} color="primary" />
                <StatCard icon={UserCheck} label="Present" value={summary.present ?? 0} color="success" />
                <StatCard icon={UserX} label="Absent" value={summary.absent ?? 0} color="destructive" />
                <StatCard icon={Clock} label="Late" value={summary.late ?? 0} color="warning" />
                <StatCard icon={CalendarOff} label="Leave" value={summary.leave ?? 0} color="info" />
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Employee Attendance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="space-y-3 p-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={Camera}
                                title="No attendance data"
                                description="No employees or logs were found for the selected date and department."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Employee</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">Check-in</th>
                                        <th className="px-4 py-3 font-medium">Check-out</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => {
                                        const employee = row.employee || row.user || row;
                                        const status = row.status || row.attendanceStatus || row.state || "present";

                                        return (
                                            <tr key={employee._id || employee.id || row._id || `${employee.name}-${row.date}`} className="border-t">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                            {employee.name?.charAt(0)?.toUpperCase() || "U"}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{employee.name || "Unknown"}</p>
                                                            <p className="text-xs text-muted-foreground">{employee.code || employee.employeeId || employee.id || "No ID"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{employee.department?.name || employee.department || row.department || "--"}</td>
                                                <td className="px-4 py-3">{formatTime(row.checkInTime)}</td>
                                                <td className="px-4 py-3">{formatTime(row.checkOutTime)}</td>
                                                <td className="px-4 py-3"><Badge variant={statusBadge(status)}>{status.replace("_", " ")}</Badge></td>
                                                <td className="px-4 py-3 capitalize text-muted-foreground">{row.source || "web"}</td>
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