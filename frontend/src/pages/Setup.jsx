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
    Sparkles,
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
        <div className="min-h-screen grid lg:grid-cols-12 bg-background selection:bg-primary/20">
            {/* Left Promotional Panel */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/95 text-primary-foreground p-10 xl:p-14 shadow-2xl">
                {/* Background decorative glow elements */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                        <Logo size="md" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">HCM Lite</span>
                </div>

                <div className="relative z-10 space-y-8 my-auto py-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                        Multi-Company Architecture
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.15] text-white">
                            Set up your organization in minutes
                        </h1>
                        <p className="text-primary-foreground/90 text-sm xl:text-base leading-relaxed">
                            Create your company workspace with its own policies, departments, attendance rules and payroll — completely separate from every other organization on the platform.
                        </p>
                    </div>

                    <ul className="space-y-4 pt-2">
                        {FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-3.5 text-sm font-medium text-white/95">
                                <div className="p-1 rounded-full bg-white/15 text-white mt-0.5 shrink-0 backdrop-blur-xs border border-white/25">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                </div>
                                <span className="leading-snug">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 text-xs text-primary-foreground/70 font-medium">
                    © {new Date().getFullYear()} HCM Lite. Enterprise Workspace Solution.
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-xl space-y-8">
                    <div className="lg:hidden flex items-center gap-3">
                        <Logo size="sm" />
                        <span className="text-lg font-bold tracking-tight">HCM Lite</span>
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Register your company</h2>
                        <p className="text-sm text-muted-foreground mt-1.5">
                            Set up a new organization and configure its primary Administrator account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Organization Section */}
                        <div className="space-y-4 p-5 rounded-2xl bg-muted/30 border border-border/60 shadow-xs backdrop-blur-xs">
                            <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                                <Building2 className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    Organization Details
                                </h3>
                            </div>

                            <Field
                                icon={Building2}
                                label="Company Name"
                                value={form.companyName}
                                onChange={(v) => updateField("companyName", v)}
                                placeholder="e.g. Acme Corp"
                                error={errors.companyName}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    type="tel"
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

                        {/* Admin Credentials Section */}
                        <div className="space-y-4 p-5 rounded-2xl bg-muted/30 border border-border/60 shadow-xs backdrop-blur-xs">
                            <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                                <User className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    Administrator Credentials
                                </h3>
                            </div>

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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    label="Confirm Password"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(v) => updateField("confirmPassword", v)}
                                    placeholder="Re-enter password"
                                    error={errors.confirmPassword}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/45 transition-all duration-200 cursor-pointer"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                <Building2 className="h-5 w-5 mr-2" />
                            )}
                            Create Organization Workspace
                        </Button>
                    </form>

                    <div className="pt-4 border-t text-center text-sm text-muted-foreground space-y-2">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                                <LogIn className="h-3.5 w-3.5" />
                                Sign in
                            </Link>
                        </p>
                        <p className="text-xs text-muted-foreground/80">
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
            <label className="text-xs sm:text-sm font-medium text-foreground">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                <Input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`pl-9 h-11 bg-background/50 border-input focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${error ? "border-destructive focus-visible:ring-destructive/20" : ""
                        }`}
                />
            </div>
            {error && <p className="text-xs font-medium text-destructive mt-1 animate-shake">{error}</p>}
        </div>
    );
}