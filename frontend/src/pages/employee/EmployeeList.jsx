import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { employeeApi, orgApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { Search, UserPlus, Upload, Download, Users, Eye } from "lucide-react";

export default function EmployeeList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isHr = user?.role === "hr";

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const basePath = isHr ? "/hr/employees" : "/admin/employees";

    const load = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (department) params.set("department", department);
        if (status) params.set("status", status);
        params.set("page", page);
        params.set("limit", 10);

        employeeApi.list(`?${params.toString()}`)
            .then((res) => {
                setEmployees(res.employees || res.data || []);
                setTotalPages(res.totalPages || 1);
            })
            .catch((err) => toast.error(err.message || "Failed to load employees"))
            .finally(() => setLoading(false));
    }, [search, department, status, page]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        orgApi.listDepartments().then((res) => setDepartments(res.departments || res || [])).catch(() => { });
    }, []);

    function handleExport() {
        window.open(employeeApi.exportUrl(), "_blank");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Employees</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your organization's workforce</p>
                </div>
                {isHr && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport} className="gap-2">
                            <Download className="h-4 w-4" /> Export
                        </Button>
                        <Button variant="outline" onClick={() => navigate(`${basePath}/import`)} className="gap-2">
                            <Upload className="h-4 w-4" /> Import CSV
                        </Button>
                        <Button onClick={() => navigate(`${basePath}/new`)} className="gap-2">
                            <UserPlus className="h-4 w-4" /> Add Employee
                        </Button>
                    </div>
                )}
            </div>

            <Card>
                <CardContent className="p-4 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email or code…"
                            value={search}
                            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={department}
                        onChange={(e) => { setPage(1); setDepartment(e.target.value); }}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                    <select
                        value={status}
                        onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="probation">Probation</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : employees.length === 0 ? (
                        <EmptyState icon={Users} title="No employees found" description="Try adjusting your filters or add a new employee." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Code</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Email</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">Designation</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{emp.employeeCode}</td>
                                            <td className="px-4 py-3 font-medium">{emp.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                                            <td className="px-4 py-3">{emp.department?.name || "—"}</td>
                                            <td className="px-4 py-3">{emp.designation?.title || "—"}</td>
                                            <td className="px-4 py-3"><Badge variant={statusBadge(emp.status)}>{emp.status}</Badge></td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`${basePath}/${emp._id}`}>
                                                    <Button size="sm" variant="ghost" className="gap-1.5">
                                                        <Eye className="h-3.5 w-3.5" /> View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <span className="text-sm text-muted-foreground self-center">Page {page} of {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
            )}
        </div>
    );
}