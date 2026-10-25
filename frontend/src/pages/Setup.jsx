import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
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
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    RefreshCw,
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

const FEATURES = [
    "Set up your organization in minutes",
    "Create the first Administrator account",
    "Start managing employees, attendance, leave and payroll",
];

export default function Setup() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [checkError, setCheckError] = useState(null);
    const [alreadySetup, setAlreadySetup] = useState(false);

    const [form, setForm] = useState({
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    async function checkStatus() {
        setChecking(true);
        setCheckError(null);
        try {
            const res = await authApi.status();
            const isComplete = res?.data?.isSetupComplete ?? res?.isSetupComplete ?? false;
            setAlreadySetup(Boolean(isComplete));
        } catch (err) {
            setCheckError(err.message || "Could not reach the server. Please try again.");
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        checkStatus();
    }, []);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function validate() {
        const next = {};
        const companyNameErr = validateCompanyName(form.companyName);
        if (companyNameErr) next.companyName = companyNameErr;

        const addressErr = validateFreeText(form.companyAddress, { required: true, label: "Address" });
        if (addressErr) next.companyAddress = addressErr;

        const phoneErr = validatePhone(form.companyPhone, { required: true });
        if (phoneErr) next.companyPhone = phoneErr;

        const nameErr = validatePersonName(form.adminName);
        if (nameErr) next.adminName = nameErr;

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
            await authApi.setup({
                companyName: form.companyName.trim(),
                companyAddress: form.companyAddress.trim(),
                companyPhone: form.companyPhone.trim(),
                adminName: form.adminName.trim(),
                adminEmail: form.adminEmail.trim().toLowerCase(),
                adminPassword: form.adminPassword,
            });
            toast.success("Company created successfully. Please sign in.");
            navigate("/login");
        } catch (err) {
            toast.error(err.message || "Setup failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            {/* Left branding panel */}
            <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-primary via-primary to-primary/80 text-primary-foreground p-12">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <span className="text-lg font-semibold">HCM Lite</span>
                </div>
                <div className="space-y-6 max-w-sm">
                    <h1 className="text-3xl font-semibold leading-tight">
                        Set up your company workspace
                    </h1>
                    <ul className="space-y-3">
                        {FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-3 text-sm text-primary-foreground/90">
                                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-xs text-primary-foreground/70">
                    Only one Administrator setup is required per company.
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <Logo size="sm" />
                        <span className="text-base font-semibold">HCM Lite</span>
                    </div>

                    {checking ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p className="text-sm">Checking setup status...</p>
                        </div>
                    ) : checkError ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
                            <div className="flex items-center gap-3 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                <h2 className="font-semibold">Could not connect to server</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">{checkError}</p>
                            <Button onClick={checkStatus} variant="outline" className="w-full">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    ) : alreadySetup ? (
                        <div className="rounded-xl border p-6 space-y-4 text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">Company already set up</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    This workspace has already been configured. Please sign in to continue.
                                </p>
                            </div>
                            <Link to="/login">
                                <Button className="w-full">
                                    Go to Sign In
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold tracking-tight">Create your company</h2>
                            <p className="text-sm text-muted-foreground mt-1 mb-6">
                                This sets up your organization and the first Administrator account.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <section className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Company Details
                                    </h3>
                                    <Field
                                        icon={Building2}
                                        label="Company Name"
                                        value={form.companyName}
                                        onChange={(v) => updateField("companyName", v)}
                                        placeholder="Acme Corporation"
                                        error={errors.companyName}
                                    />
                                    <Field
                                        icon={MapPin}
                                        label="Company Address"
                                        value={form.companyAddress}
                                        onChange={(v) => updateField("companyAddress", v)}
                                        placeholder="123 Business Street, City"
                                        error={errors.companyAddress}
                                    />
                                    <Field
                                        icon={Phone}
                                        label="Company Phone"
                                        value={form.companyPhone}
                                        onChange={(v) => updateField("companyPhone", v)}
                                        placeholder="03001234567"
                                        error={errors.companyPhone}
                                    />
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Administrator Account
                                    </h3>
                                    <Field
                                        icon={User}
                                        label="Full Name"
                                        value={form.adminName}
                                        onChange={(v) => updateField("adminName", v)}
                                        placeholder="Jane Doe"
                                        error={errors.adminName}
                                    />
                                    <Field
                                        icon={Mail}
                                        label="Email"
                                        type="email"
                                        value={form.adminEmail}
                                        onChange={(v) => updateField("adminEmail", v)}
                                        placeholder="you@company.com"
                                        error={errors.adminEmail}
                                    />
                                    <Field
                                        icon={Lock}
                                        label="Password"
                                        type="password"
                                        value={form.adminPassword}
                                        onChange={(v) => updateField("adminPassword", v)}
                                        placeholder="Minimum 8 characters"
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
                                </section>

                                <Button type="submit" className="w-full h-11" disabled={submitting}>
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Building2 className="h-4 w-4 mr-2" />
                                    )}
                                    Create Company
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Already set up?{" "}
                                    <Link to="/login" className="text-primary font-medium hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}
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