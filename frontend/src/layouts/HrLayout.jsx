import DashboardLayout from "./DashboardLayout";
import { LayoutDashboard, Users, Calendar, ClipboardCheck, Wallet, Bot, Megaphone } from "lucide-react";

const navItems = [
    { to: "/hr", label: "Dashboard", icon: LayoutDashboard },
    { to: "/hr/employees", label: "Employees", icon: Users },
    { to: "/hr/attendance", label: "Attendance", icon: Calendar },
    { to: "/hr/leave", label: "Leave Requests", icon: ClipboardCheck },
    { to: "/hr/payroll", label: "Payroll", icon: Wallet },
    { to: "/hr/ai", label: "AI Assistant", icon: Bot },
    { to: "/hr/comms", label: "Announcements", icon: Megaphone },
    { to: "/hr/attendance/corrections", label: "Corrections", icon: ClipboardCheck },
];

export default function HrLayout() {
    return <DashboardLayout navItems={navItems} roleLabel="HR" />;
}