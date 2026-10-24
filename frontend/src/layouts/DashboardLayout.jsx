import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ navItems, roleLabel }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <div className="min-h-screen flex bg-muted/20">
            <aside className="w-64 shrink-0 border-r bg-background flex flex-col">
                <div className="px-5 py-4 border-b">
                    <h1 className="text-lg font-bold">HCM Lite</h1>
                    <p className="text-xs text-muted-foreground">{roleLabel} Portal</p>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const active = location.pathname === item.to;
                        const Icon = item.icon;
                        return (
                            <Link key={item.to} to={item.to}
                                className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b bg-background flex items-center justify-end px-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <User className="h-4 w-4" /> {user?.name} <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate("/change-password")}>Change Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                <LogOut className="h-4 w-4 mr-2" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}