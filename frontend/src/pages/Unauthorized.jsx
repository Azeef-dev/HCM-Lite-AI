// Unauthorized.jsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { LogIn, ArrowLeft, ShieldAlert } from "lucide-react";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-background overflow-hidden selection:bg-primary/20">
            {/* Subtle Ambient Background Glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-destructive/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Logo size="sm" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">HCM Lite</span>
            </div>

            {/* Main Glass Card */}
            <div className="relative z-10 w-full max-w-md text-center space-y-6 p-8 sm:p-10 rounded-3xl bg-muted/30 border border-border/60 shadow-xl backdrop-blur-md">
                {/* Floating Security Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Access Restricted • 403
                </div>

                {/* Big Gradient 403 Typography */}
                <div className="space-y-2">
                    <h1 className="text-7xl sm:text-8xl font-black tracking-tighter bg-gradient-to-br from-destructive via-destructive/80 to-primary/60 bg-clip-text text-transparent select-none">
                        403
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Unauthorized Access
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                        You don't have permission to view this page. Please sign in with an authorized role or contact your administrator.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto h-11 px-5 rounded-xl border-border/80 hover:bg-muted/60 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>

                    <Button
                        asChild
                        className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    >
                        <Link to="/login">
                            <LogIn className="h-4 w-4 mr-2" />
                            Back to Login
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Subtle Footer */}
            <p className="absolute bottom-6 text-xs text-muted-foreground/70">
                © {new Date().getFullYear()} HCM Lite. Enterprise Workspace Solution.
            </p>
        </div>
    );
}