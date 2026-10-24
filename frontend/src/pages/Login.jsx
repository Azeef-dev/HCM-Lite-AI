import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePassword } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Sparkles, Users, Clock, Wallet, Mail, Lock } from "lucide-react";

export function redirectByRole(role, navigate) {
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "hr") navigate("/hr", { replace: true });
    else navigate("/employee", { replace: true });
}

const features = [
    { icon: Users, text: "Manage employees, departments & roles" },
    { icon: Clock, text: "Track attendance with smart grace rules" },
    { icon: Wallet, text: "Automated payroll & tax calculation" },
    { icon: Sparkles, text: "AI assistant for instant HR insights" },
];

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function validate() {
        const e = {};
        const emailErr = validateEmail(form.email);
        if (emailErr) e.email = emailErr;
        const passErr = validatePassword(form.password, { strong: false });
        if (passErr) e.password = passErr;
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const user = await login(form.email.trim(), form.password);
            toast.success(`Welcome back, ${user.name}`);
            if (user.mustChangePassword) {
                navigate("/change-password", { replace: true });
                return;
            }
            redirectByRole(user.role, navigate);
        } catch (err) {
            toast.error(err.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            {/* Left branding panel */}
            <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-linear-to-br from-primary via-primary to-accent p-12 text-primary-foreground">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
                <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">HCM Lite</span>
                </div>

                <div className="relative space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold leading-tight mb-3">
                            AI-Assisted HR,<br />made simple.
                        </h1>
                        <p className="text-primary-foreground/80 text-sm max-w-sm">
                            One platform for attendance, leave, payroll and analytics —
                            built for Admin, HR and Employees alike.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {features.map((f) => (
                            <div key={f.text} className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                                    <f.icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm text-primary-foreground/90">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-xs text-primary-foreground/60">
                    © {new Date().getFullYear()} HCM Lite — Saylani Hackathon
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex lg:hidden justify-center mb-6">
                        <Logo size="lg" />
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-2xl font-bold">Sign in to your account</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email" name="email" type="email" value={form.email} onChange={handleChange}
                                    autoComplete="username" placeholder="you@company.com" className="pl-9"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password" name="password" type="password" value={form.password} onChange={handleChange}
                                    autoComplete="current-password" placeholder="••••••••" className="pl-9"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 text-base" disabled={submitting}>
                            {submitting ? "Signing in…" : "Sign In"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Setting up for the first time?{" "}
                            <Link to="/setup" className="text-primary font-medium hover:underline">
                                Create company
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}