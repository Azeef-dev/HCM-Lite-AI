import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { employeeApi, orgApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    validateCode, validatePersonName, validateEmail, validatePhone,
    validateFreeText, validateIsoDate, validatePositiveNumber,
} from "@/lib/validators";
import { ArrowLeft, UserPlus } from "lucide-react";

const initial = {
    employeeCode: "", name: "", email: "", phone: "", address: "",
    department: "", designation: "", dateOfJoining: "", gender: "male", basic: "",
};

export default function EmployeeCreate() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const basePath = user?.role === "hr" ? "/hr/employees" : "/admin/employees";

    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        orgApi.listDepartments().then((res) => setDepartments(res.departments || res || [])).catch(() => { });
        orgApi.listDesignations().then((res) => setDesignations(res.designations || res || [])).catch(() => { });
    }, []);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function validate() {
        const e = {};
        e.employeeCode = validateCode(form.employeeCode, { label: "Employee code" });
        e.name = validatePersonName(form.name);
        e.email = validateEmail(form.email);
        e.phone = validatePhone(form.phone, { required: false });
        e.address = form.address ? validateFreeText(form.address, { required: false, min: 3, max: 200, label: "Address" }) : "";
        e.dateOfJoining = validateIsoDate(form.dateOfJoining, { label: "Date of joining" });
        e.basic = validatePositiveNumber(form.basic, { label: "Basic salary" });
        Object.keys(e).forEach((k) => !e[k] && delete e[k]);
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                employeeCode: form.employeeCode.trim(),
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                address: form.address.trim() || undefined,
                department: form.department || undefined,
                designation: form.designation || undefined,
                dateOfJoining: form.dateOfJoining,
                gender: form.gender,
                salary: { basic: Number(form.basic) },
            };
            const res = await employeeApi.create(payload);
            toast.success("Employee created successfully");
            if (res.tempPassword) {
                toast.success(`Temp login password: ${res.tempPassword}`, { duration: 10000 });
            }
            navigate(basePath, { replace: true });
        } catch (err) {
            toast.error(err.message || "Failed to create employee");
            if (err.errors?.length) {
                const fe = {};
                err.errors.forEach((er) => (fe[er.field] = er.message));
                setErrors((old) => ({ ...old, ...fe }));
            }
        } finally {
            setSubmitting(false);
        }
    }

    const filteredDesignations = form.department
        ? designations.filter((d) => (d.department?._id || d.department) === form.department)
        : designations;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(basePath)}>
                <ArrowLeft className="h-4 w-4" /> Back to Employees
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Add New Employee</CardTitle>
                    <p className="text-sm text-muted-foreground">A login account will be created automatically with a temporary password.</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Employee Code" name="employeeCode" value={form.employeeCode} onChange={handleChange} error={errors.employeeCode} placeholder="EMP-001" />
                            <Field label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Ali Khan" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="ali@company.com" />
                            <Field label="Phone (optional)" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="+923001234567" />
                        </div>
                        <Field label="Address (optional)" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="House 12, Street 5, Karachi" />
                        <div className="grid sm:grid-cols-2 gap-4">
                            <SelectField label="Department" name="department" value={form.department} onChange={handleChange}
                                options={departments.map((d) => ({ value: d._id, label: d.name }))} placeholder="Select department" />
                            <SelectField label="Designation" name="designation" value={form.designation} onChange={handleChange}
                                options={filteredDesignations.map((d) => ({ value: d._id, label: d.title }))} placeholder="Select designation" />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Field label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} error={errors.dateOfJoining} />
                            <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange}
                                options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
                            <Field label="Basic Salary" name="basic" type="number" value={form.basic} onChange={handleChange} error={errors.basic} placeholder="50000" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Creating…" : "Create Employee"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor={name}>{label}</label>
            <Input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete="off" />
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function SelectField({ label, name, value, onChange, options, placeholder }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor={name}>{label}</label>
            <select
                id={name} name={name} value={value} onChange={onChange}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}