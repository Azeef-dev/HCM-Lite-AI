import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { validatePassword } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { redirectByRole } from "./Login";

export default function ChangePassword() {
    const { user, refresh } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function validate() {
        const e = {};
        if (!form.currentPassword) e.currentPassword = "Current password is required";
        const err = validatePassword(form.newPassword, { strong: true });
        if (err) e.newPassword = err;
        if (!e.newPassword && form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
            toast.success("Password changed successfully");
            const refreshedUser = await refresh();
            redirectByRole((refreshedUser || user)?.role, navigate);
        } catch (err) {
            toast.error(err.message || "Failed to change password");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Change Password</CardTitle>
                    <p className="text-sm text-muted-foreground">You must set a new password before continuing.</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <Field label="Current Password" name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} error={errors.currentPassword} />
                        <Field label="New Password" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} error={errors.newPassword} />
                        <Field label="Confirm New Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Updating…" : "Update Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

function Field({ label, name, value, onChange, error, type = "text" }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor={name}>{label}</label>
            <Input id={name} name={name} type={type} value={value} onChange={onChange} autoComplete="new-password" />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}