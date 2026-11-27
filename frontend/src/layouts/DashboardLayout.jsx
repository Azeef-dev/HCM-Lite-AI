import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Building2,
    Bell,
    KeyRound,
    Menu,
    X,
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ navItems, roleLabel }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("hcm_sidebar_collapsed") === "true";
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("hcm_sidebar_collapsed", String(collapsed));
    }, [collapsed]);

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    const companyName = user?.company?.name || "HCM Lite Workspace";

    return (
        <TooltipProvider delayDuration={150}>
            <div className="h-screen flex bg-muted/20 overflow-hidden">
                {/* Mobile Backdrop */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 md:static shrink-0 border-r bg-background flex flex-col shadow-lg md:shadow-xs transition-all duration-200",
                        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                        collapsed ? "w-64 md:w-18" : "w-64"
                    )}
                >
                    <div
                        className={cn(
                            "h-16 px-4 border-b flex items-center overflow-hidden",
                            collapsed ? "justify-between md:justify-center" : "justify-between gap-3"
                        )}
                    >
                        <div className={cn("flex items-center gap-3 min-w-0", collapsed && "md:hidden")}>
                            <Logo size="sm" />
                            <div className="min-w-0">
                                <h1 className="text-base font-bold leading-tight truncate">HCM Lite</h1>
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                                    {roleLabel} Console
                                </p>
                            </div>
                        </div>

                        {/* Desktop Collapse Button */}
                        <button
                            type="button"
                            onClick={() => setCollapsed((c) => !c)}
                            className="hidden md:flex h-7 w-7 shrink-0 rounded-md items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="flex md:hidden h-8 w-8 shrink-0 rounded-md items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Close sidebar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto overflow-x-hidden">
                        {navItems.map((item) => {
                            const active = location.pathname === item.to;
                            const Icon = item.icon;
                            const link = (
                                <Link
                                    to={item.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        collapsed && "md:justify-center md:px-0",
                                        active
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span className={cn("truncate", collapsed && "md:hidden")}>{item.label}</span>
                                </Link>
                            );

                            if (!collapsed) return <div key={item.to}>{link}</div>;

                            return (
                                <Tooltip key={item.to}>
                                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                                    <TooltipContent side="right" className="hidden md:block">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </nav>

                    <div className="p-3.5 border-t shrink-0">
                        <div className={cn("rounded-xl bg-muted/50 p-3 flex items-center gap-2.5", collapsed && "md:justify-center md:p-2")}>
                            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div className={cn("min-w-0 flex-1", collapsed && "md:hidden")}>
                                <p className="text-xs font-semibold truncate text-foreground">{companyName}</p>
                                <p className="text-[11px] text-muted-foreground capitalize">{user?.role} Access</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 shrink-0 border-b bg-background flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileOpen(true)}
                                className="md:hidden h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 min-w-0">
                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="font-semibold truncate max-w-35 sm:max-w-xs">{companyName}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                            <ThemeToggle className="text-muted-foreground hover:text-foreground" />

                            {user?.role === "employee" && (
                                <Link to="/employee/notifications">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                        <Bell className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-2.5 h-9">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-xs border shrink-0">
                                            {user?.name ? user.name[0].toUpperCase() : "U"}
                                        </div>
                                        <span className="hidden sm:inline text-sm font-medium max-w-30 truncate">{user?.name}</span>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
                                    <div className="px-4 py-3.5 bg-muted/40 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                                            {user?.name ? user.name[0].toUpperCase() : "U"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 border-b border-t">
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize",
                                                user?.role === "admin" && "bg-violet-500/10 text-violet-600",
                                                user?.role === "hr" && "bg-blue-500/10 text-blue-600",
                                                user?.role === "employee" && "bg-emerald-500/10 text-emerald-600"
                                            )}
                                        >
                                            {user?.role} access
                                        </span>
                                    </div>
                                    <div className="p-1.5">
                                        <DropdownMenuItem onClick={() => navigate("/change-password")} className="gap-2.5 py-2">
                                            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                                <KeyRound className="h-3.5 w-3.5" />
                                            </div>
                                            Change Password
                                        </DropdownMenuItem>
                                    </div>
                                    <DropdownMenuSeparator className="my-0" />
                                    <div className="p-1.5">
                                        <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2.5 py-2 focus:text-destructive">
                                            <div className="h-7 w-7 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
                                                <LogOut className="h-3.5 w-3.5" />
                                            </div>
                                            Logout
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}