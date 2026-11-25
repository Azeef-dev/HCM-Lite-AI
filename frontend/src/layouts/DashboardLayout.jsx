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
            <div className="min-h-screen flex bg-muted/20">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "relative shrink-0 border-r bg-background flex flex-col shadow-xs transition-[width] duration-200",
                        collapsed ? "w-18" : "w-64"
                    )}
                >
                    {/* h-16 matches the top bar's h-16 exactly, so the two
                        border-bottom lines sit at the same height and read
                        as one continuous line across the page. */}
                    <div className="h-16 px-4 border-b flex items-center gap-3 overflow-hidden">
                        <Logo size="sm" />
                        {!collapsed && (
                            <div className="min-w-0">
                                <h1 className="text-base font-bold leading-tight truncate">HCM Lite</h1>
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                                    {roleLabel} Console
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setCollapsed((c) => !c)}
                        className="absolute -right-3 top-13 h-6 w-6 rounded-full border bg-background shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors z-10"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                    </button>

                    <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto overflow-x-hidden">
                        {navItems.map((item) => {
                            const active = location.pathname === item.to;
                            const Icon = item.icon;
                            const link = (
                                <Link
                                    to={item.to}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        collapsed && "justify-center px-0",
                                        active
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );

                            if (!collapsed) {
                                return <div key={item.to}>{link}</div>;
                            }

                            return (
                                <Tooltip key={item.to}>
                                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                                    <TooltipContent side="right">{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </nav>

                    <div className="p-3.5 border-t">
                        <div className={cn("rounded-xl bg-muted/50 p-3 flex items-center gap-2.5", collapsed && "justify-center p-2")}>
                            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Building2 className="h-4 w-4" />
                            </div>
                            {!collapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold truncate text-foreground">{companyName}</p>
                                    <p className="text-[11px] text-muted-foreground capitalize">{user?.role} Access</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sm:px-8 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                <Building2 className="h-3.5 w-3.5" />
                                <span className="font-semibold">{companyName}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                                    <Button variant="ghost" className="flex items-center gap-2 px-2.5 h-9">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-xs border">
                                            {user?.name ? user.name[0].toUpperCase() : "U"}
                                        </div>
                                        <span className="text-sm font-medium">{user?.name}</span>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-3 py-2 border-b">
                                        <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                        <p className="text-[10px] text-primary font-medium capitalize mt-0.5">Role: {user?.role}</p>
                                    </div>
                                    <DropdownMenuItem onClick={() => navigate("/change-password")} className="gap-2">
                                        <KeyRound className="h-4 w-4" /> Change Password
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2">
                                        <LogOut className="h-4 w-4" /> Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}