import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { commsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import {
    Megaphone,
    Plus,
    X,
    Send,
    Calendar,
    User,
    Users,
    Tag,
    Clock,
    Loader2,
} from "lucide-react";

export default function Announcements() {
    const { user } = useAuth();
    const canCreate = user?.role === "admin" || user?.role === "hr";

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [showCreate, setShowCreate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        message: "",
        audience: "all",
    });
    const [errors, setErrors] = useState({});

    function loadAnnouncements() {
        setLoading(true);
        commsApi.listAnnouncements()
            .then((data) => {
                setAnnouncements(Array.isArray(data) ? data : data.data || []);
            })
            .catch((err) => toast.error(err.message || "Failed to load announcements"))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadAnnouncements();
    }, []);

    function validate() {
        const errs = {};
        if (!form.title.trim()) errs.title = "Title is required";
        if (!form.message.trim()) errs.message = "Message is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await commsApi.createAnnouncement({
                title: form.title.trim(),
                message: form.message.trim(),
                audience: form.audience,
            });
            toast.success("Announcement published");
            setForm({ title: "", message: "", audience: "all" });
            setShowCreate(false);
            loadAnnouncements();
        } catch (err) {
            toast.error(err.message || "Failed to publish announcement");
        } finally {
            setSubmitting(false);
        }
    }

    const filtered = announcements.filter((item) => {
        if (filter === "all") return true;
        return item.audience === filter;
    });

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Company-wide news, broadcasts, and policy updates
                    </p>
                </div>
                {canCreate && (
                    <Button onClick={() => setShowCreate((s) => !s)} className="gap-2">
                        {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {showCreate ? "Close" : "Post Announcement"}
                    </Button>
                )}
            </div>

            {showCreate && (
                <Card className="border-primary/20 shadow-sm animate-in fade-in duration-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-primary" />
                            Broadcast New Announcement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Office Relocation & Eid Holidays Schedule"
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Target Audience</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: "all", label: "All Members" },
                                        { id: "employee", label: "Employees Only" },
                                        { id: "hr", label: "HR Team Only" },
                                    ].map((opt) => (
                                        <button
                                            type="button"
                                            key={opt.id}
                                            onClick={() => setForm((p) => ({ ...p, audience: opt.id }))}
                                            className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                                                form.audience === opt.id
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background hover:bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Announcement Message</label>
                                <Textarea
                                    value={form.message}
                                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                                    placeholder="Write your announcement details here..."
                                    rows={4}
                                />
                                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting} className="gap-2">
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    Publish Broadcast
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {[
                    { id: "all", label: "All Announcements" },
                    { id: "employee", label: "Employees" },
                    { id: "hr", label: "HR" },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setFilter(t.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                            filter === t.id
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Megaphone}
                    title="No announcements found"
                    description="Stay tuned! Important announcements and updates from administration will be published here."
                />
            ) : (
                <div className="space-y-4">
                    {filtered.map((item) => {
                        const dateStr = item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "";
                        const timeStr = item.createdAt
                            ? new Date(item.createdAt).toLocaleTimeString(undefined, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "";

                        return (
                            <Card key={item._id} className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="pb-2">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base font-semibold">
                                                    {item.title}
                                                </CardTitle>
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize text-xs font-normal"
                                                >
                                                    <Users className="h-3 w-3 mr-1 opacity-70" />
                                                    {item.audience === "all" ? "All Staff" : `${item.audience} Only`}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {item.postedBy?.name || "Admin"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {dateStr} {timeStr}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {item.message}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

