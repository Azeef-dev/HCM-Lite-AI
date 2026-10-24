import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { validateCompanyName, validatePersonName, validateEmail, validatePassword } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

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

    if (checking) return <div className="min-h-screen flex items-center justify-center">Checking setup status…</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to HCM Lite</CardTitle>
                    <p className="text-sm text-muted-foreground">First-time setup — create your company and admin account.</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <Field label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} />
                        <Field label="Admin Full Name" name="adminName" value={form.adminName} onChange={handleChange} error={errors.adminName} placeholder="e.g. Ali Khan" />
                        <Field label="Admin Email" name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} error={errors.adminEmail} />
                        <Field label="Admin Password" name="adminPassword" type="password" value={form.adminPassword} onChange={handleChange} error={errors.adminPassword} />
                        <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Setting up…" : "Create Company & Admin"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor={name}>{label}</label>
            <Input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete="off" />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}