import DashboardLayout from "./DashboardLayout";
import { LayoutDashboard, Building2, Users, Calendar, Wallet, Bot, Megaphone, ShieldCheck } from "lucide-react";

const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/organization", label: "Organization", icon: Building2 },
    { to: "/admin/employees", label: "Employees", icon: Users },
    { to: "/admin/attendance", label: "Attendance", icon: Calendar },
    { to: "/admin/leave", label: "Leave", icon: Calendar },
    { to: "/admin/payroll", label: "Payroll", icon: Wallet },
    { to: "/admin/ai", label: "AI Assistant", icon: Bot },
    { to: "/admin/comms", label: "Announcements", icon: Megaphone },
    { to: "/admin/audit", label: "Audit Log", icon: ShieldCheck },
];

export default function AdminLayout() {
    return <DashboardLayout navItems={navItems} roleLabel="Admin" />;
}