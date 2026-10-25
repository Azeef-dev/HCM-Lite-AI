import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Mail, Lock, Loader2, CheckCircle2, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { validateEmail } from "@/lib/validators";

const FEATURES = [
    "Role-based dashboards for Admin, HR and Employees",
    "Attendance, leave and payroll in one place",
    "AI assistant for instant answers about your HR data",
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
            toast.success("Welcome back");
            redirectByRole(user.role, navigate);
        } catch (err) {
            toast.error(err.message || "Invalid email or password");
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
                        AI-assisted HR management, simplified
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
                    Built for Saylani Hackathon — HCM Lite
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <Logo size="sm" />
                        <span className="text-base font-semibold">HCM Lite</span>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                        Enter your credentials to access your dashboard.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors((p) => ({ ...p, email: undefined }));
                                    }}
                                    placeholder="you@company.com"
                                    className="pl-9 h-11"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors((p) => ({ ...p, password: undefined }));
                                    }}
                                    placeholder="Enter your password"
                                    className="pl-9 h-11"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={submitting}>
                            {submitting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <LogIn className="h-4 w-4 mr-2" />
                            )}
                            Sign In
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