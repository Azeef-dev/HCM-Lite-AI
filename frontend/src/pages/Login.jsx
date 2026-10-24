import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePassword } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export function redirectByRole(role, navigate) {
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "hr") navigate("/hr", { replace: true });
    else navigate("/employee", { replace: true });
}

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
            toast.success(`Welcome, ${user.name}`);
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
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">HCM Lite</CardTitle>
                    <p className="text-sm text-muted-foreground">Sign in to continue</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="username" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Signing in…" : "Sign In"}
                        </Button>
                        <Link to="/setup" className="text-xs text-muted-foreground hover:underline">
                            First time? Set up company
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}