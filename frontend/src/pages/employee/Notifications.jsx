import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { commsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import {
    Bell,
    CheckCheck,
    Calendar,
    Wallet,
    Megaphone,
    Clock,
    Check,
} from "lucide-react";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // "all" | "unread"

    function loadNotifications() {
        setLoading(true);
        commsApi.myNotifications()
            .then((data) => {
                setNotifications(Array.isArray(data) ? data : data.data || []);
            })
            .catch((err) => toast.error(err.message || "Failed to load notifications"))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadNotifications();
    }, []);

    async function handleMarkRead(id) {
        try {
            await commsApi.markRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            toast.error(err.message || "Failed to update notification");
        }
    }

    async function handleMarkAllRead() {
        try {
            await commsApi.markAllRead();
            toast.success("All notifications marked as read");
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            toast.error(err.message || "Failed to mark all as read");
        }
    }

    const filtered = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getIcon = (type) => {
        switch (type) {
            case "leave":
                return <Calendar className="h-5 w-5 text-indigo-500" />;
            case "payslip":
                return <Wallet className="h-5 w-5 text-emerald-500" />;
            case "announcement":
                return <Megaphone className="h-5 w-5 text-amber-500" />;
            default:
                return <Bell className="h-5 w-5 text-primary" />;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Alerts for leave approvals, published payslips, and company notices
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
                        <CheckCheck className="h-4 w-4" />
                        Mark All as Read ({unreadCount})
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b pb-2">
                <button
                    onClick={() => setFilter("all")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                        filter === "all"
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                    All Notifications ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                        filter === "unread"
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="No notifications yet"
                    description={
                        filter === "unread"
                            ? "You are all caught up! No unread notifications."
                            : "System alerts regarding leave requests and payroll will appear here."
                    }
                />
            ) : (
                <div className="space-y-3">
                    {filtered.map((item) => {
                        const dateStr = item.createdAt
                            ? new Date(item.createdAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "";

                        return (
                            <Card
                                key={item._id}
                                className={`transition-colors shadow-xs ${
                                    item.isRead
                                        ? "bg-card hover:bg-muted/30"
                                        : "bg-primary/5 border-primary/30"
                                }`}
                            >
                                <CardContent className="p-4 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div
                                            className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                                item.isRead ? "bg-muted" : "bg-primary/10"
                                            }`}
                                        >
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-foreground">
                                                    {item.title}
                                                </h4>
                                                {!item.isRead && (
                                                    <Badge variant="default" className="text-[10px] h-4 px-1.5 font-normal">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-normal">
                                                {item.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {dateStr}
                                            </p>
                                        </div>
                                    </div>

                                    {!item.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkRead(item._id)}
                                            className="h-8 text-xs shrink-0 text-muted-foreground hover:text-foreground"
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
