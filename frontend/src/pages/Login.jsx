import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import {
    Mail,
    Lock,
    Loader2,
    CheckCircle2,
    LogIn,
    Building2,
    FlaskConical,
    Sparkles,
    ArrowRight,
} from "lucide-react";
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
        <div className="min-h-screen grid lg:grid-cols-12 bg-background selection:bg-primary/20">
            {/* Left Promotional Panel */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/95 text-primary-foreground p-10 xl:p-14 shadow-2xl">
                {/* Background decorative glow elements */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                            <Logo size="md" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">HCM Lite</span>
                    </div>
                    <ThemeToggle className="text-white hover:bg-white/15 rounded-xl border border-white/15 backdrop-blur-xs" />
                </div>

                <div className="relative z-10 space-y-8 my-auto py-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                        Multi-Company Platform
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.15] text-white">
                            Modern Human Capital Management, powered by AI
                        </h1>
                        <p className="text-primary-foreground/90 text-sm xl:text-base leading-relaxed">
                            Seamlessly operate organizations of any scale with automated attendance, approval workflows, and transparent analytics.
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

            {/* Right Login Panel */}
            <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-7">
                    <div className="lg:hidden flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Logo size="sm" />
                            <span className="text-lg font-bold tracking-tight">HCM Lite</span>
                        </div>
                        <ThemeToggle />
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Sign in to your account
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1.5">
                            Enter your credentials to access your organization dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-2xl bg-muted/30 border border-border/60 shadow-xs backdrop-blur-xs">
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-medium text-foreground">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors((p) => ({ ...p, email: undefined }));
                                    }}
                                    placeholder="you@company.com"
                                    className={`pl-9 h-11 bg-background/60 border-input focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""
                                        }`}
                                />
                            </div>
                            {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs sm:text-sm font-medium text-foreground">Password</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors((p) => ({ ...p, password: undefined }));
                                    }}
                                    placeholder="Enter your password"
                                    className={`pl-9 h-11 bg-background/60 border-input focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""
                                        }`}
                                />
                            </div>
                            {errors.password && <p className="text-xs font-medium text-destructive">{errors.password}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/45 transition-all duration-200 cursor-pointer"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                <LogIn className="h-5 w-5 mr-2" />
                            )}
                            Sign In
                        </Button>

                        <div className="pt-4 border-t border-border/60 text-center text-sm">
                            <p className="text-muted-foreground">
                                Need a workspace for your company?{" "}
                                <Link
                                    to="/signup"
                                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                    <Building2 className="h-3.5 w-3.5" />
                                    Register Company
                                </Link>
                            </p>
                        </div>
                    </form>

                    {/* Testing Accounts Card */}
                    <div className="rounded-2xl border border-dashed border-primary/35 bg-primary/4 p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                                <FlaskConical className="h-4 w-4" />
                                Quick Demo Access
                            </div>
                            <span className="text-[11px] text-muted-foreground">Click to auto-fill</span>
                        </div>

                        <div className="space-y-2">
                            {TEST_ACCOUNTS.map((acc) => (
                                <button
                                    key={acc.role}
                                    type="button"
                                    onClick={() => useTestAccount(acc)}
                                    className="group w-full flex items-center justify-between gap-3 rounded-xl bg-background/90 border border-border/80 px-3.5 py-2.5 text-left hover:border-primary/50 hover:bg-primary/4 hover:shadow-xs transition-all duration-150 cursor-pointer"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary">
                                                {acc.role}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate font-mono pt-0.5">
                                            {acc.email} <span className="text-border">•</span> {acc.password}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary shrink-0 group-hover:translate-x-0.5 transition-transform">
                                        Fill
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}