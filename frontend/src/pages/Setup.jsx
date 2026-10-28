import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    Briefcase,
    LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    validateCompanyName,
    validatePersonName,
    validateEmail,
    validatePassword,
} from "@/lib/validators";
import { redirectByRole } from "@/pages/Login";

const FEATURES = [
    "An independent, isolated workspace for your company",
    "Instant Administrator account with sensible defaults",
    "HR can register employees and issue their logins",
    "Attendance, leave and payroll ready from day one",
];

export default function Setup() {
    const navigate = useNavigate();
    const { registerCompany } = useAuth();

    const [form, setForm] = useState({
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        industry: "Information Technology",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function updateField(key, value) {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((p) => ({ ...p, [key]: undefined }));
    }

    function validate() {
        const next = {};
        const cNameErr = validateCompanyName(form.companyName);
        if (cNameErr) next.companyName = cNameErr;

        const aNameErr = validatePersonName(form.adminName);
        if (aNameErr) next.adminName = aNameErr;

        const emailErr = validateEmail(form.adminEmail);
        if (emailErr) next.adminEmail = emailErr;

        const passErr = validatePassword(form.adminPassword);
        if (passErr) next.adminPassword = passErr;

        if (form.confirmPassword !== form.adminPassword) {
            next.confirmPassword = "Passwords do not match";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const user = await registerCompany({
                companyName: form.companyName.trim(),
                companyAddress: form.companyAddress.trim(),
                companyPhone: form.companyPhone.trim(),
                industry: form.industry,
                adminName: form.adminName.trim(),
                adminEmail: form.adminEmail.trim().toLowerCase(),
                adminPassword: form.adminPassword,
            });
            toast.success("Organization created successfully");
            redirectByRole(user.role, navigate);
        } catch (err) {
            toast.error(err.message || "Failed to create company");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
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
                        Set up your organization in minutes
                    </h1>
                    <p className="text-primary-foreground/80 text-sm">
                        Create your company workspace with its own policies, departments, attendance rules and payroll — completely separate from every other organization on the platform.
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

            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <Logo size="sm" />
                        <span className="text-lg font-bold">HCM Lite</span>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">Register your company</h2>
                    <p className="text-sm text-muted-foreground mt-1 mb-7">
                        Set up a new organization and configure its primary Administrator account.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Organization Details
                            </h3>
                            <Field
                                icon={Building2}
                                label="Company Name"
                                value={form.companyName}
                                onChange={(v) => updateField("companyName", v)}
                                placeholder="e.g. Acme Corp"
                                error={errors.companyName}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Field
                                    icon={Briefcase}
                                    label="Industry"
                                    value={form.industry}
                                    onChange={(v) => updateField("industry", v)}
                                    placeholder="Technology"
                                    error={errors.industry}
                                />
                                <Field
                                    icon={Phone}
                                    label="Phone (optional)"
                                    value={form.companyPhone}
                                    onChange={(v) => updateField("companyPhone", v)}
                                    placeholder="03001234567"
                                    error={errors.companyPhone}
                                />
                            </div>
                            <Field
                                icon={MapPin}
                                label="Office Address (optional)"
                                value={form.companyAddress}
                                onChange={(v) => updateField("companyAddress", v)}
                                placeholder="Main Boulevard, City"
                                error={errors.companyAddress}
                            />
                        </div>

                        <div className="space-y-4 pt-5 border-t">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Administrator Credentials
                            </h3>
                            <Field
                                icon={User}
                                label="Full Name"
                                value={form.adminName}
                                onChange={(v) => updateField("adminName", v)}
                                placeholder="e.g. Alex Johnson"
                                error={errors.adminName}
                            />
                            <Field
                                icon={Mail}
                                label="Work Email"
                                type="email"
                                value={form.adminEmail}
                                onChange={(v) => updateField("adminEmail", v)}
                                placeholder="admin@company.com"
                                error={errors.adminEmail}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Field
                                    icon={Lock}
                                    label="Password"
                                    type="password"
                                    value={form.adminPassword}
                                    onChange={(v) => updateField("adminPassword", v)}
                                    placeholder="Min 8 characters"
                                    error={errors.adminPassword}
                                />
                                <Field
                                    icon={Lock}
                                    label="Confirm"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(v) => updateField("confirmPassword", v)}
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

                    <div className="pt-6 mt-6 border-t text-center text-sm text-muted-foreground space-y-2">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                                <LogIn className="h-3.5 w-3.5" />
                                Sign in
                            </Link>
                        </p>
                        <p className="text-xs">
                            Joining an existing company as an employee? Ask your HR team to add you — they'll issue your login.
                        </p>
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