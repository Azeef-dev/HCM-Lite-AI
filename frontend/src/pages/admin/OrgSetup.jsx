import { useEffect, useState } from "react";
import { orgApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DropdownSelect from "@/components/DropdownSelect";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { showCredentialToast } from "@/components/CredentialToast";
import {
    Building2,
    Briefcase,
    CalendarDays,
    CalendarClock,
    Settings,
    Users,
    Plus,
    Loader2,
    Trash2,
    Pencil,
    Check,
    X,
    KeyRound,
    Ban,
    CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { validatePersonName, validateEmail, validateFreeText } from "@/lib/validators";

const TABS = [
    { key: "departments", label: "Departments", icon: Building2 },
    { key: "designations", label: "Designations", icon: Briefcase },
    { key: "leaveTypes", label: "Leave Types", icon: CalendarDays },
    { key: "holidays", label: "Holidays", icon: CalendarClock },
    { key: "settings", label: "Company Settings", icon: Settings },
    { key: "hrUsers", label: "HR Users", icon: Users },
];

export default function OrgSetup() {
    const [active, setActive] = useState("departments");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Organization Setup</h1>
                <p className="text-sm text-muted-foreground">
                    Configure departments, designations, leave types, holidays, company policies and HR accounts.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 border-b pb-3">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const isActive = active === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setActive(t.key)}
                            className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {active === "departments" && <SimpleListTab kind="departments" title="Department" />}
            {active === "designations" && <SimpleListTab kind="designations" title="Designation" />}
            {active === "leaveTypes" && <LeaveTypesTab />}
            {active === "holidays" && <HolidaysTab />}
            {active === "settings" && <CompanySettingsTab />}
            {active === "hrUsers" && <HrUsersTab />}
        </div>
    );
}

/* ---------------- Departments / Designations ---------------- */

function SimpleListTab({ kind, title }) {
    const api = orgApi[kind];
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    async function load() {
        setLoading(true);
        try {
            const res = await api.list();
            setItems(res?.data ?? res ?? []);
        } catch (err) {
            toast.error(err.message || `Failed to load ${title.toLowerCase()}s`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kind]);

    async function handleAdd() {
        const nameErr = validateFreeText(name, { required: true, label: title + " name" });
        if (nameErr) return toast.error(nameErr);

        setSaving(true);
        try {
            await api.create({ name: name.trim(), code: code.trim() || undefined });
            toast.success(`${title} added`);
            setName("");
            setCode("");
            load();
        } catch (err) {
            toast.error(err.message || `Failed to add ${title.toLowerCase()}`);
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(id) {
        const nameErr = validateFreeText(editName, { required: true, label: title + " name" });
        if (nameErr) return toast.error(nameErr);
        try {
            await api.update(id, { name: editName.trim() });
            toast.success(`${title} updated`);
            setEditingId(null);
            load();
        } catch (err) {
            toast.error(err.message || "Update failed");
        }
    }

    async function handleDelete(id) {
        if (!window.confirm(`Delete this ${title.toLowerCase()}?`)) return;
        try {
            await api.remove(id);
            toast.success(`${title} deleted`);
            load();
        } catch (err) {
            toast.error(err.message || "Delete failed");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}s</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">{title} Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`e.g. ${title === "Department" ? "Engineering" : "Software Engineer"}`} className="w-56" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Code (optional)</label>
                        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ENG" className="w-32" />
                    </div>
                    <Button onClick={handleAdd} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add
                    </Button>
                </div>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState icon={Building2} title={`No ${title.toLowerCase()}s yet`} description={`Add your first ${title.toLowerCase()} above.`} />
                ) : (
                    <div className="divide-y rounded-lg border">
                        {items.map((item) => {
                            const id = item._id || item.id;
                            const isEditing = editingId === id;
                            return (
                                <div key={id} className="flex items-center justify-between px-4 py-3">
                                    {isEditing ? (
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 max-w-xs" autoFocus />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{item.name}</span>
                                            {item.code && <Badge variant="muted">{item.code}</Badge>}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        {isEditing ? (
                                            <>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdate(id)}>
                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => {
                                                        setEditingId(id);
                                                        setEditName(item.name);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ---------------- Leave Types ---------------- */

function LeaveTypesTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [quota, setQuota] = useState("");
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await orgApi.leaveTypes.list();
            setItems(res?.data ?? res ?? []);
        } catch (err) {
            toast.error(err.message || "Failed to load leave types");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleAdd() {
        const nameErr = validateFreeText(name, { required: true, label: "Leave type name" });
        if (nameErr) return toast.error(nameErr);
        if (!quota || Number(quota) <= 0) return toast.error("Annual quota must be a positive number");

        setSaving(true);
        try {
            await orgApi.leaveTypes.create({ name: name.trim(), annualQuota: Number(quota) });
            toast.success("Leave type added");
            setName("");
            setQuota("");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to add leave type");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this leave type?")) return;
        try {
            await orgApi.leaveTypes.remove(id);
            toast.success("Leave type deleted");
            load();
        } catch (err) {
            toast.error(err.message || "Delete failed");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Leave Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Leave Type Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Annual Leave" className="w-56" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Annual Quota (days)</label>
                        <Input type="number" min="0" value={quota} onChange={(e) => setQuota(e.target.value)} placeholder="14" className="w-32" />
                    </div>
                    <Button onClick={handleAdd} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add
                    </Button>
                </div>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState icon={CalendarDays} title="No leave types yet" description="Add leave types such as Annual, Sick or Casual leave." />
                ) : (
                    <div className="divide-y rounded-lg border">
                        {items.map((item) => {
                            const id = item._id || item.id;
                            return (
                                <div key={id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <span className="font-medium text-sm">{item.name}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {item.annualQuota ?? "—"} days/year
                                        </span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ---------------- Holidays ---------------- */

function HolidaysTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await orgApi.holidays.list();
            setItems(res?.data ?? res ?? []);
        } catch (err) {
            toast.error(err.message || "Failed to load holidays");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleAdd() {
        const nameErr = validateFreeText(name, { required: true, label: "Holiday name" });
        if (nameErr) return toast.error(nameErr);
        if (!date) return toast.error("Holiday date is required");

        setSaving(true);
        try {
            await orgApi.holidays.create({ name: name.trim(), date });
            toast.success("Holiday added");
            setName("");
            setDate("");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to add holiday");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this holiday?")) return;
        try {
            await orgApi.holidays.remove(id);
            toast.success("Holiday deleted");
            load();
        } catch (err) {
            toast.error(err.message || "Delete failed");
        }
    }

    const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Holidays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Holiday Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Independence Day" className="w-56" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Date</label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
                    </div>
                    <Button onClick={handleAdd} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add
                    </Button>
                </div>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : sorted.length === 0 ? (
                    <EmptyState icon={CalendarClock} title="No holidays added" description="Add public holidays for the calendar year." />
                ) : (
                    <div className="divide-y rounded-lg border">
                        {sorted.map((item) => {
                            const id = item._id || item.id;
                            return (
                                <div key={id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <span className="font-medium text-sm">{item.name}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {new Date(item.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                        </span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ---------------- Company Settings ---------------- */

function CompanySettingsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        officeStartTime: "09:00",
        officeEndTime: "18:00",
        graceMinutes: 15,
        halfDayThresholdHours: 4,
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await orgApi.getSettings();
                const data = res?.data ?? res;
                if (data) {
                    setSettings((prev) => ({ ...prev, ...data }));
                }
            } catch (err) {
                toast.error(err.message || "Failed to load company settings");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function update(key, value) {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            await orgApi.updateSettings(settings);
            toast.success("Company settings updated");
        } catch (err) {
            toast.error(err.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="py-12 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Office Hours & Attendance Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Office Start Time</label>
                        <Input type="time" value={settings.officeStartTime} onChange={(e) => update("officeStartTime", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Office End Time</label>
                        <Input type="time" value={settings.officeEndTime} onChange={(e) => update("officeEndTime", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Grace Period (minutes)</label>
                        <Input
                            type="number"
                            min="0"
                            value={settings.graceMinutes}
                            onChange={(e) => update("graceMinutes", Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Half-Day Threshold (hours)</label>
                        <Input
                            type="number"
                            min="0"
                            value={settings.halfDayThresholdHours}
                            onChange={(e) => update("halfDayThresholdHours", Number(e.target.value))}
                        />
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Save Settings
                </Button>
            </CardContent>
        </Card>
    );
}

/* ---------------- HR Users ---------------- */

function HrUsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [creating, setCreating] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await orgApi.listUsers();
            setUsers(res?.data ?? res ?? []);
        } catch (err) {
            toast.error(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate() {
        const nameErr = validatePersonName(name);
        if (nameErr) return toast.error(nameErr);
        const emailErr = validateEmail(email);
        if (emailErr) return toast.error(emailErr);

        setCreating(true);
        try {
            const res = await orgApi.createHr({ name: name.trim(), email: email.trim().toLowerCase() });
            const tempPassword = res?.data?.tempPassword ?? res?.tempPassword;
            toast.success("HR account created");
            if (tempPassword) {
                showCredentialToast({
                    label: "Temporary Password",
                    value: tempPassword,
                    sub: `Share this with ${name.trim()} — they'll be asked to change it on first sign-in.`,
                });
            }
            setName("");
            setEmail("");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to create HR account");
        } finally {
            setCreating(false);
        }
    }

    async function handleToggleActive(user) {
        const id = user._id || user.id;
        const nextActive = !(user.isActive ?? true);
        try {
            await orgApi.setUserActive(id, nextActive);
            toast.success(nextActive ? "Account activated" : "Account deactivated");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to update account");
        }
    }

    async function handleResetPassword(user) {
        const id = user._id || user.id;
        if (!window.confirm(`Reset password for ${user.name}?`)) return;
        try {
            const res = await orgApi.resetPassword(id);
            const tempPassword = res?.data?.tempPassword ?? res?.tempPassword;
            toast.success("Password reset");
            if (tempPassword) {
                showCredentialToast({
                    label: "New Temporary Password",
                    value: tempPassword,
                    sub: `Share this with ${user.name} — they'll be asked to change it on next sign-in.`,
                });
            }
        } catch (err) {
            toast.error(err.message || "Failed to reset password");
        }
    }

    const hrUsers = users.filter((u) => u.role === "hr");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">HR Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="w-56" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" className="w-64" />
                    </div>
                    <Button onClick={handleCreate} disabled={creating}>
                        {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Create HR Account
                    </Button>
                </div>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : hrUsers.length === 0 ? (
                    <EmptyState icon={Users} title="No HR accounts yet" description="Create an HR account so they can log in and manage employees." />
                ) : (
                    <div className="divide-y rounded-lg border">
                        {hrUsers.map((u) => {
                            const id = u._id || u.id;
                            const isActive = u.isActive ?? true;
                            return (
                                <div key={id} className="flex items-center justify-between px-4 py-3 flex-wrap gap-2">
                                    <div>
                                        <p className="font-medium text-sm">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={isActive ? "success" : "destructive"}>{isActive ? "Active" : "Inactive"}</Badge>
                                        <Button variant="outline" size="sm" onClick={() => handleResetPassword(u)}>
                                            <KeyRound className="h-4 w-4 mr-1.5" />
                                            Reset Password
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleToggleActive(u)}>
                                            {isActive ? (
                                                <>
                                                    <Ban className="h-4 w-4 mr-1.5" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}