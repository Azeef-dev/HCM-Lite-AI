import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Mail, Loader2, ArrowLeft, Send, Copy, Check, MailCheck } from "lucide-react";
import { validateEmail } from "@/lib/validators";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [devLink, setDevLink] = useState(null);
    const [copied, setCopied] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const err = validateEmail(email);
        if (err) { setError(err); return; }
        setError("");
        setSubmitting(true);
        try {
            const res = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
            setSent(true);
            setDevLink(res?.devResetUrl || null);
        } catch (err) {
            toast.error(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(devLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy — please copy it manually.");
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
                    {!sent ? (
                        <>
                            <h1 className="text-xl font-bold tracking-tight">Forgot your password?</h1>
                            <p className="text-sm text-muted-foreground mt-1.5 mb-6">
                                Enter your work email and we'll send you a link to reset it.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                            placeholder="you@company.com"
                                            className="pl-9 h-11"
                                            autoFocus
                                        />
                                    </div>
                                    {error && <p className="text-xs text-destructive">{error}</p>}
                                </div>

                                <Button type="submit" className="w-full h-11" disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                    Send Reset Link
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                <MailCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight">Check your email</h1>
                                <p className="text-sm text-muted-foreground mt-1.5">
                                    If an account exists for <span className="font-medium text-foreground">{email}</span>, a reset link has been sent. It expires in 30 minutes.
                                </p>
                            </div>

                            {devLink && (
                                <div className="text-left rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3.5 space-y-2">
                                    <p className="text-xs font-semibold text-primary">
                                        Dev mode — SMTP isn't configured yet, so here's your link directly:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 text-[11px] bg-background border rounded-md px-2 py-1.5 truncate">{devLink}</code>
                                        <Button type="button" size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={copyLink}>
                                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        This only appears because the server has no SMTP_HOST/SMTP_USER/SMTP_PASS set. Configure those env vars to send real emails instead — see the README.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}