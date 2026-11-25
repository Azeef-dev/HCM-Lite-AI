import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Lock, Loader2, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";
import { validatePassword } from "@/lib/validators";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const email = params.get("email") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const linkMissing = !token || !email;

    function validate() {
        const next = {};
        const pwErr = validatePassword(newPassword);
        if (pwErr) next.newPassword = pwErr;
        if (newPassword !== confirmPassword) next.confirmPassword = "Passwords do not match";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await authApi.resetPassword({ email, token, newPassword });
            setDone(true);
            toast.success("Password reset successfully");
            setTimeout(() => navigate("/login", { replace: true }), 1800);
        } catch (err) {
            toast.error(err.message || "This reset link is invalid or has expired.");
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
                    {linkMissing ? (
                        <div className="text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                                <KeyRound className="h-6 w-6" />
                            </div>
                            <h1 className="text-lg font-bold tracking-tight">Invalid reset link</h1>
                            <p className="text-sm text-muted-foreground">
                                This link is missing required information. Please request a new one.
                            </p>
                            <Link to="/forgot-password">
                                <Button variant="outline" className="mt-2">Request New Link</Button>
                            </Link>
                        </div>
                    ) : done ? (
                        <div className="text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h1 className="text-lg font-bold tracking-tight">Password reset</h1>
                            <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold tracking-tight">Set a new password</h1>
                            <p className="text-sm text-muted-foreground mt-1.5 mb-6">
                                Resetting the password for <span className="font-medium text-foreground">{email}</span>
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: undefined })); }}
                                            placeholder="At least 8 characters"
                                            className="pl-9 h-11"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                                            placeholder="Re-enter your new password"
                                            className="pl-9 h-11"
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                                </div>

                                <Button type="submit" className="w-full h-11" disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
                                    Reset Password
                                </Button>
                            </form>
                        </>
                    )}

                    {!done && (
                        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}