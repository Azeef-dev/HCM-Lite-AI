import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { validateCompanyName, validatePersonName, validateEmail, validatePassword } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Building2, User, Mail, Lock, Sparkles, ShieldCheck } from "lucide-react";

const initial = { companyName: "", adminName: "", adminEmail: "", adminPassword: "", confirmPassword: "" };

export default function Setup() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        authApi.status()
            .then((res) => {
                if (res.isSetupComplete) navigate("/login", { replace: true });
                else setChecking(false);
            })
            .catch(() => setChecking(false));
    }, [navigate]);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function validate() {
        const e = {};
        e.companyName = validateCompanyName(form.companyName);
        e.adminName = validatePersonName(form.adminName, { label: "Admin name" });
        e.adminEmail = validateEmail(form.adminEmail);
        e.adminPassword = validatePassword(form.adminPassword, { strong: true });
        if (!e.adminPassword && form.adminPassword !== form.confirmPassword) {
            e.confirmPassword = "Passwords do not match";
        }
        Object.keys(e).forEach((k) => !e[k] && delete e[k]);
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await authApi.setup({
                companyName: form.companyName.trim(),
                adminName: form.adminName.trim(),
                adminEmail: form.adminEmail.trim(),
                adminPassword: form.adminPassword,
            });
            toast.success("Company setup complete. Please login.");
            navigate("/login", { replace: true });
        } catch (err) {
            toast.error(err.message || "Setup failed");
            if (err.errors?.length) {
                const fe = {};
                err.errors.forEach((e) => (fe[e.field] = e.message));
                setErrors((old) => ({ ...old, ...fe }));
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Checking setup status…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/30 p-4 sm:p-8">
            <div className="w-full max-w-lg">
                <div className="flex flex-col items-center mb-8 text-center">
                    <Logo size="lg" />
                    <h1 className="text-2xl sm:text-3xl font-bold mt-4">Welcome to HCM Lite</h1>
                    <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                        First-time setup — create your company workspace and the administrator account.
                    </p>
                </div>

                <div className="bg-card border rounded-2xl shadow-xl shadow-primary/5 p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <SectionLabel icon={Building2} text="Company Details" />
                        <Field
                            label="Company Name" name="companyName" icon={Building2}
                            value={form.companyName} onChange={handleChange} error={errors.companyName}
                            placeholder="e.g. Saylani Mock Company"
                        />

                        <div className="h-px bg-border my-2" />

                        <SectionLabel icon={ShieldCheck} text="Administrator Account" />
                        <Field
                            label="Admin Full Name" name="adminName" icon={User}
                            value={form.adminName} onChange={handleChange} error={errors.adminName}
                            placeholder="e.g. Ali Khan"
                        />
                        <Field
                            label="Admin Email" name="adminEmail" type="email" icon={Mail}
                            value={form.adminEmail} onChange={handleChange} error={errors.adminEmail}
                            placeholder="admin@company.com"
                        />
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field
                                label="Password" name="adminPassword" type="password" icon={Lock}
                                value={form.adminPassword} onChange={handleChange} error={errors.adminPassword}
                                placeholder="••••••••"
                            />
                            <Field
                                label="Confirm Password" name="confirmPassword" type="password" icon={Lock}
                                value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
                                placeholder="••••••••"
                            />
                        </div>

                        <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
                            Password must be 8+ characters with uppercase, lowercase, number & special character.
                        </p>

                        <Button type="submit" className="w-full h-11 text-base gap-2" disabled={submitting}>
                            <Sparkles className="h-4 w-4" />
                            {submitting ? "Setting up…" : "Create Company & Admin"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <Icon className="h-4 w-4 text-primary" />
            {text}
        </div>
    );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder, icon: Icon }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor={name}>{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                <Input
                    id={name} name={name} type={type} value={value} onChange={onChange}
                    placeholder={placeholder} autoComplete="off" className={Icon ? "pl-9" : ""}
                />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}