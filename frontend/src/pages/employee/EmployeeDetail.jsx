import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { employeeApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { validateFreeText, validatePhone } from "@/lib/validators";
import { ArrowLeft, Mail, Phone, MapPin, Building2, Briefcase, CalendarDays, Wallet, Pencil, Save, X } from "lucide-react";

export default function EmployeeDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const basePath = user?.role === "hr" ? "/hr/employees" : user?.role === "admin" ? "/admin/employees" : "/employee";

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const isHr = user?.role === "hr";
    const isOwn = employee && user?.employeeId === employee._id;

    function load() {
        setLoading(true);
        employeeApi.get(id)
            .then((res) => {
                const emp = res.employee || res;
                setEmployee(emp);
                setForm({ phone: emp.phone || "", address: emp.address || "" });
            })
            .catch((err) => toast.error(err.message || "Failed to load employee"))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, [id]);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function validate() {
        const e = {};
        if (form.phone) e.phone = validatePhone(form.phone, { required: false });
        if (form.address) e.address = validateFreeText(form.address, { required: false, min: 3, max: 200, label: "Address" });
        Object.keys(e).forEach((k) => !e[k] && delete e[k]);
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = isHr
                ? { phone: form.phone || undefined, address: form.address || undefined }
                : { phone: form.phone || undefined, address: form.address || undefined };
            await employeeApi.update(id, payload);
            toast.success("Employee updated");
            setEditing(false);
            load();
        } catch (err) {
            toast.error(err.message || "Failed to update employee");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <Skeleton className="h-96" />;
    if (!employee) return <p className="text-muted-foreground">Employee not found.</p>;

    const canEdit = isHr || isOwn;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(basePath)}>
                <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <Card>
                <CardContent className="p-6 flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                            {employee.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{employee.name}</h1>
                            <p className="text-sm text-muted-foreground">{employee.designation?.title || "—"} · {employee.department?.name || "—"}</p>
                            <div className="mt-1.5"><Badge variant={statusBadge(employee.status)}>{employee.status}</Badge></div>
                        </div>
                    </div>
                    {canEdit && !editing && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(true)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                    )}
                    {editing && (
                        <div className="flex gap-2">
                            <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
                                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditing(false); setForm({ phone: employee.phone || "", address: employee.address || "" }); }}>
                                <X className="h-3.5 w-3.5" /> Cancel
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={Mail} label="Email" value={employee.email} />
                    {editing ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</label>
                                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+923001234567" />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address</label>
                                <Input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </div>
                        </div>
                    ) : (
                        <>
                            <InfoRow icon={Phone} label="Phone" value={employee.phone || "Not provided"} />
                            <InfoRow icon={MapPin} label="Address" value={employee.address || "Not provided"} />
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">Job Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={Building2} label="Department" value={employee.department?.name || "—"} />
                    <InfoRow icon={Briefcase} label="Designation" value={employee.designation?.title || "—"} />
                    <InfoRow icon={CalendarDays} label="Date of Joining" value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "—"} />
                    <InfoRow icon={CalendarDays} label="Employee Code" value={employee.employeeCode} />
                </CardContent>
            </Card>

            {(isHr || user?.role === "admin") && employee.salary && (
                <Card>
                    <CardHeader><CardTitle className="text-base">Compensation</CardTitle></CardHeader>
                    <CardContent>
                        <InfoRow icon={Wallet} label="Basic Salary" value={`Rs ${Number(employee.salary.basic || 0).toLocaleString()}`} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground w-36 shrink-0">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}