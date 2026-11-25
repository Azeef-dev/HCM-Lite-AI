import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { redirectByRole } from "@/pages/Login";
import { Lock, Loader2, KeyRound, Eye, EyeOff, ShieldAlert, Check } from "lucide-react";
import { validatePassword } from "@/lib/validators";

function PasswordField({ label, value, onChange, placeholder, error, autoFocus }) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium">{label}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="pl-9 pr-9 h-11"
                    autoFocus={autoFocus}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

export default function ChangePassword() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const forced = Boolean(user?.mustChangePassword);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const requirements = [
        { label: "At least 8 characters", met: newPassword.length >= 8 },
        { label: "No spaces", met: newPassword.length > 0 && !newPassword.includes(" ") },
        { label: "Matches confirmation", met: newPassword.length > 0 && newPassword === confirmPassword },
    ];

    function validate() {
        const next = {};
        if (!currentPassword) next.currentPassword = "Current password is required";
        const pwErr = validatePassword(newPassword);
        if (pwErr) next.newPassword = pwErr;
        if (newPassword !== confirmPassword) next.confirmPassword = "Passwords do not match";
        if (newPassword && currentPassword && newPassword === currentPassword) {
            next.newPassword = "New password must be different from the current one";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await authApi.changePassword({ currentPassword, newPassword });
            toast.success("Password changed successfully");
            if (user?.role) {
                redirectByRole(user.role, navigate);
            } else {
                navigate("/login", { replace: true });
            }
        } catch (err) {
            toast.error(err.message || "Failed to change password");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <Logo size="sm" />
                    <span className="text-lg font-bold">HCM Lite</span>
                </div>

                <div className="bg-background border rounded-2xl shadow-sm p-6 sm:p-8">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <KeyRound className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Change Password</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">
                        {forced
                            ? "You must set a new password before continuing."
                            : "Update the password you use to sign in."}
                    </p>

                    {forced && (
                        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3">
                            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                This account was created with a temporary password. Set your own password to continue using HCM Lite.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        <PasswordField
                            label="Current Password"
                            value={currentPassword}
                            onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => ({ ...p, currentPassword: undefined })); }}
                            placeholder="Enter your current password"
                            error={errors.currentPassword}
                            autoFocus
                        />

                        <PasswordField
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: undefined })); }}
                            placeholder="At least 8 characters"
                            error={errors.newPassword}
                        />

                        <PasswordField
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                            placeholder="Re-enter your new password"
                            error={errors.confirmPassword}
                        />

                        {newPassword.length > 0 && (
                            <ul className="space-y-1 pt-1">
                                {requirements.map((r) => (
                                    <li key={r.label} className="flex items-center gap-1.5 text-xs">
                                        <Check className={r.met ? "h-3.5 w-3.5 text-emerald-600" : "h-3.5 w-3.5 text-muted-foreground/40"} />
                                        <span className={r.met ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Button type="submit" className="w-full h-11" disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
                            Update Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}