import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { Mail, Lock, Loader2, CheckCircle2, LogIn, Building2, FlaskConical } from "lucide-react";
import toast from "react-hot-toast";
import { validateEmail } from "@/lib/validators";

const FEATURES = [
    "Multi-company enterprise Human Capital Management",
    "Role-based portals for Administrators, HR teams, and Employees",
    "Attendance tracking, leave workflow, and one-click payroll",
    "AI assistant answering from real company data with tools",
];

const TEST_ACCOUNTS = [
    { role: "Admin", email: "azeefashraf22@gmail.com", password: "Azeef@456" },
    { role: "HR", email: "azeef@gmail.com", password: "Azeef@456" },
    { role: "Employee", email: "ali@gmail.com", password: "Ali@4567" },
];

export function redirectByRole(role, navigate) {
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "hr") navigate("/hr", { replace: true });
    else navigate("/employee", { replace: true });
}

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function validate() {
        const next = {};
        const emailErr = validateEmail(email);
        if (emailErr) next.email = emailErr;
        if (!password || password.includes(" ")) {
            next.password = "Password is required and cannot contain spaces";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const user = await login(email.trim().toLowerCase(), password);
            toast.success(`Welcome back, ${user.name}`);
            redirectByRole(user.role, navigate);
        } catch (err) {
            toast.error(err.message || "Invalid email or password");
        } finally {
            setSubmitting(false);
        }
    }

    function useTestAccount(acc) {
        setEmail(acc.email);
        setPassword(acc.password);
        setErrors({});
        toast.success(`${acc.role} demo credentials filled — hit Sign In`);
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground p-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo size="md" />
                        <span className="text-xl font-bold tracking-tight">HCM Lite</span>
                    </div>
                    <ThemeToggle className="text-primary-foreground hover:bg-primary-foreground/10" />
                </div>
                <div className="space-y-6 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-semibold backdrop-blur-xs">
                        <Building2 className="h-3.5 w-3.5" />
                        Multi-Company Platform
                    </div>
                    <h1 className="text-4xl font-bold leading-tight">
                        Modern Human Capital Management, powered by AI
                    </h1>
                    <p className="text-primary-foreground/80 text-sm">
                        Seamlessly operate organizations of any scale with automated attendance, approval workflows, and transparent analytics.
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
            </div>

            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Logo size="sm" />
                            <span className="text-lg font-bold">HCM Lite</span>
                        </div>
                        <ThemeToggle />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                        Enter your credentials to access your organization dashboard.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                                    placeholder="you@company.com"
                                    className="pl-9 h-11"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Password</label>
                                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                                    placeholder="Enter your password"
                                    className="pl-9 h-11"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                            Sign In
                        </Button>

                        <div className="pt-4 border-t space-y-2 text-center text-sm">
                            <p className="text-muted-foreground">
                                Need a workspace for your company?{" "}
                                <Link to="/signup" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    Register Company
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-3">
                            <FlaskConical className="h-3.5 w-3.5" />
                            Testing Accounts
                        </div>
                        <div className="space-y-2">
                            {TEST_ACCOUNTS.map((acc) => (
                                <button
                                    key={acc.role}
                                    type="button"
                                    onClick={() => useTestAccount(acc)}
                                    className="w-full flex items-center justify-between gap-2 rounded-lg bg-background border px-3 py-2 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold">{acc.role}</p>
                                        <p className="text-xs text-muted-foreground truncate font-mono">{acc.email} / {acc.password}</p>
                                    </div>
                                    <span className="text-[11px] font-medium text-primary shrink-0">Use →</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}