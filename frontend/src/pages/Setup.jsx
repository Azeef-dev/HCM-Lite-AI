import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import {
    Building2,
    User,
    Mail,
    Lock,
    MapPin,
    Phone,
    Loader2,
    CheckCircle2,
    UserPlus,
    LogIn,
    Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    validateCompanyName,
    validatePersonName,
    validateEmail,
    validatePassword,
    validatePhone,
    validateFreeText,
} from "@/lib/validators";
import { redirectByRole } from "@/pages/Login";

const FEATURES = [
    "Independent multi-company workspaces",
    "Instant Administrator account setup with defaults",
    "Employee self-registration for active organizations",
    "Integrated HR operations, attendance, and payroll",
];

export default function Setup() {
    const navigate = useNavigate();
    const { registerCompany, registerUser } = useAuth();
    const [mode, setMode] = useState("company"); // "company" | "employee"

    // Existing companies list for employee signup
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    // Company form
    const [companyForm, setCompanyForm] = useState({
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        industry: "Information Technology",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        confirmPassword: "",
    });

    // Employee form
    const [employeeForm, setEmployeeForm] = useState({
        companyId: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoadingCompanies(true);
        authApi.companies()
            .then((list) => {
                const arr = Array.isArray(list) ? list : list.data || [];
                setCompanies(arr);
                if (arr.length > 0) {
                    setEmployeeForm((p) => ({ ...p, companyId: p.companyId || arr[0]._id }));
                }
            })
            .catch(() => {})
            .finally(() => setLoadingCompanies(false));
    }, []);

    function updateCompanyField(k, v) {
        setCompanyForm((p) => ({ ...p, [k]: v }));
        setErrors((p) => ({ ...p, [k]: undefined }));
    }

    function updateEmployeeField(k, v) {
        setEmployeeForm((p) => ({ ...p, [k]: v }));
        setErrors((p) => ({ ...p, [k]: undefined }));
    }

    function validateCompany() {
        const next = {};
        const cNameErr = validateCompanyName(companyForm.companyName);
        if (cNameErr) next.companyName = cNameErr;

        const aNameErr = validatePersonName(companyForm.adminName);
        if (aNameErr) next.adminName = aNameErr;

        const emailErr = validateEmail(companyForm.adminEmail);
        if (emailErr) next.adminEmail = emailErr;

        const passErr = validatePassword(companyForm.adminPassword);
        if (passErr) next.adminPassword = passErr;

        if (companyForm.confirmPassword !== companyForm.adminPassword) {
            next.confirmPassword = "Passwords do not match";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function validateEmployee() {
        const next = {};
        if (!employeeForm.companyId) next.companyId = "Please select a company";

        const nameErr = validatePersonName(employeeForm.name);
        if (nameErr) next.name = nameErr;

        const emailErr = validateEmail(employeeForm.email);
        if (emailErr) next.email = emailErr;

        const passErr = validatePassword(employeeForm.password);
        if (passErr) next.password = passErr;

        if (employeeForm.confirmPassword !== employeeForm.password) {
            next.confirmPassword = "Passwords do not match";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleCompanySubmit(e) {
        e.preventDefault();
        if (!validateCompany()) return;

        setSubmitting(true);
        try {
            const user = await registerCompany({
                companyName: companyForm.companyName.trim(),
                companyAddress: companyForm.companyAddress.trim(),
                companyPhone: companyForm.companyPhone.trim(),
                industry: companyForm.industry,
                adminName: companyForm.adminName.trim(),
                adminEmail: companyForm.adminEmail.trim().toLowerCase(),
                adminPassword: companyForm.adminPassword,
            });
            toast.success("Organization created successfully");
            redirectByRole(user.role, navigate);
        } catch (err) {
            toast.error(err.message || "Failed to create company");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleEmployeeSubmit(e) {
        e.preventDefault();
        if (!validateEmployee()) return;

        setSubmitting(true);
        try {
            const user = await registerUser({
                companyId: employeeForm.companyId,
                name: employeeForm.name.trim(),
                email: employeeForm.email.trim().toLowerCase(),
                password: employeeForm.password,
            });
            toast.success("Account created successfully");
            redirectByRole(user.role, navigate);
        } catch (err) {
            toast.error(err.message || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            {/* Left branding panel */}
            <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground p-12">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <span className="text-xl font-bold tracking-tight">HCM Lite</span>
                </div>
                <div className="space-y-6 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-semibold backdrop-blur-xs">
                        <Building2 className="h-3.5 w-3.5" />
                        Multi-Company Architecture
                    </div>
                    <h1 className="text-3xl font-bold leading-tight">
                        Create an organization or join your existing team
                    </h1>
                    <p className="text-primary-foreground/80 text-sm">
                        Register multiple companies independently with their own custom work policies, departments, attendance, and payroll runs.
                    </p>
                    <ul className="space-y-3 pt-2">
                        {FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-3 text-sm text-primary-foreground/90">
                                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-primary-foreground/80" />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-xs text-primary-foreground/60">
                    Saylani Hackathon — HCM Lite Platform
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-6">
                        <Logo size="sm" />
                        <span className="text-lg font-bold">HCM Lite</span>
                    </div>

                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 p-1 bg-muted rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("company");
                                setErrors({});
                            }}
                            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                                mode === "company"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Building2 className="h-4 w-4" />
                            Register Company
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("employee");
                                setErrors({});
                            }}
                            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                                mode === "employee"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <UserPlus className="h-4 w-4" />
                            Join Existing Company
                        </button>
                    </div>

                    {mode === "company" ? (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Create your company</h2>
                            <p className="text-sm text-muted-foreground mt-1 mb-6">
                                Set up a new organization and configure its primary Administrator account.
                            </p>

                            <form onSubmit={handleCompanySubmit} className="space-y-5">
                                <div className="space-y-3.5">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Organization Details
                                    </h3>
                                    <Field
                                        icon={Building2}
                                        label="Company Name"
                                        value={companyForm.companyName}
                                        onChange={(v) => updateCompanyField("companyName", v)}
                                        placeholder="e.g. Acme Corp"
                                        error={errors.companyName}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field
                                            icon={Briefcase}
                                            label="Industry"
                                            value={companyForm.industry}
                                            onChange={(v) => updateCompanyField("industry", v)}
                                            placeholder="Technology"
                                            error={errors.industry}
                                        />
                                        <Field
                                            icon={Phone}
                                            label="Phone (optional)"
                                            value={companyForm.companyPhone}
                                            onChange={(v) => updateCompanyField("companyPhone", v)}
                                            placeholder="03001234567"
                                            error={errors.companyPhone}
                                        />
                                    </div>
                                    <Field
                                        icon={MapPin}
                                        label="Office Address (optional)"
                                        value={companyForm.companyAddress}
                                        onChange={(v) => updateCompanyField("companyAddress", v)}
                                        placeholder="Main Boulevard, City"
                                        error={errors.companyAddress}
                                    />
                                </div>

                                <div className="space-y-3.5 pt-2 border-t">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Administrator Credentials
                                    </h3>
                                    <Field
                                        icon={User}
                                        label="Full Name"
                                        value={companyForm.adminName}
                                        onChange={(v) => updateCompanyField("adminName", v)}
                                        placeholder="e.g. Alex Johnson"
                                        error={errors.adminName}
                                    />
                                    <Field
                                        icon={Mail}
                                        label="Work Email"
                                        type="email"
                                        value={companyForm.adminEmail}
                                        onChange={(v) => updateCompanyField("adminEmail", v)}
                                        placeholder="admin@company.com"
                                        error={errors.adminEmail}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field
                                            icon={Lock}
                                            label="Password"
                                            type="password"
                                            value={companyForm.adminPassword}
                                            onChange={(v) => updateCompanyField("adminPassword", v)}
                                            placeholder="Min 8 characters"
                                            error={errors.adminPassword}
                                        />
                                        <Field
                                            icon={Lock}
                                            label="Confirm"
                                            type="password"
                                            value={companyForm.confirmPassword}
                                            onChange={(v) => updateCompanyField("confirmPassword", v)}
                                            placeholder="Re-enter"
                                            error={errors.confirmPassword}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11" disabled={submitting}>
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Building2 className="h-4 w-4 mr-2" />
                                    )}
                                    Create Organization Workspace
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Join an organization</h2>
                            <p className="text-sm text-muted-foreground mt-1 mb-6">
                                Sign up as an employee under an existing registered company.
                            </p>

                            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Select Company</label>
                                    <select
                                        value={employeeForm.companyId}
                                        onChange={(e) => updateEmployeeField("companyId", e.target.value)}
                                        className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        {companies.length === 0 ? (
                                            <option value="">No companies registered yet</option>
                                        ) : (
                                            companies.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name} {c.address ? `(${c.address})` : ""}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {errors.companyId && <p className="text-xs text-destructive">{errors.companyId}</p>}
                                </div>

                                <Field
                                    icon={User}
                                    label="Your Full Name"
                                    value={employeeForm.name}
                                    onChange={(v) => updateEmployeeField("name", v)}
                                    placeholder="e.g. Sarah Miller"
                                    error={errors.name}
                                />

                                <Field
                                    icon={Mail}
                                    label="Work Email"
                                    type="email"
                                    value={employeeForm.email}
                                    onChange={(v) => updateEmployeeField("email", v)}
                                    placeholder="you@company.com"
                                    error={errors.email}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Field
                                        icon={Lock}
                                        label="Password"
                                        type="password"
                                        value={employeeForm.password}
                                        onChange={(v) => updateEmployeeField("password", v)}
                                        placeholder="Min 8 characters"
                                        error={errors.password}
                                    />
                                    <Field
                                        icon={Lock}
                                        label="Confirm"
                                        type="password"
                                        value={employeeForm.confirmPassword}
                                        onChange={(v) => updateEmployeeField("confirmPassword", v)}
                                        placeholder="Re-enter"
                                        error={errors.confirmPassword}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11"
                                    disabled={submitting || companies.length === 0}
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <UserPlus className="h-4 w-4 mr-2" />
                                    )}
                                    Create Employee Account
                                </Button>
                            </form>
                        </div>
                    )}

                    <div className="pt-6 mt-6 border-t text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                            <LogIn className="h-3.5 w-3.5" />
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text", error }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-9 h-11"
                />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
