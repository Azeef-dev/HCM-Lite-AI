import { X, Sparkles, ArrowRight, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeActionMarker, humanizeAuditState, humanizeAuditDiff } from "@/lib/auditFormat";

export default function AuditDiffModal({ open, onClose, log }) {
    if (!open || !log) return null;

    const actorName = log.actor?.name || log.actorName || "System";
    const action = (log.action || "").toUpperCase();
    const entity = log.entity || "Record";
    const recordedAt = log.createdAt ? new Date(log.createdAt).toLocaleString() : "—";

    const wasCreated = typeof log.before === "string" || !log.before;
    const marker = describeActionMarker(log.after);
    const diff = !wasCreated ? humanizeAuditDiff(log.before, log.after) : null;
    const createdFields = wasCreated ? humanizeAuditState(log.after) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs" onClick={onClose}>
            <div
                className="bg-background rounded-2xl border w-full max-w-lg shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
                    <div>
                        <h3 className="font-semibold text-base">Change Details</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{action} · {entity}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="px-5 py-4 border-b shrink-0 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground">Performed by</p>
                        <p className="font-medium mt-0.5">{actorName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Date & Time</p>
                        <p className="font-medium mt-0.5">{recordedAt}</p>
                    </div>
                </div>

                <div className="p-5 overflow-y-auto space-y-4">
                    {marker ? (
                        <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
                            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground">{marker}</p>
                        </div>
                    ) : wasCreated ? (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FilePlus2 className="h-4 w-4 text-emerald-600" />
                                <p className="text-sm font-medium">New {entity.toLowerCase()} created with these details</p>
                            </div>
                            {createdFields && createdFields.length > 0 ? (
                                <div className="rounded-xl border divide-y">
                                    {createdFields.map((f) => (
                                        <div key={f.label} className="flex items-center justify-between gap-4 px-3.5 py-2 text-sm">
                                            <span className="text-muted-foreground">{f.label}</span>
                                            <span className="font-medium text-right">{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No additional details were recorded.</p>
                            )}
                        </div>
                    ) : diff && diff.length > 0 ? (
                        <div>
                            <p className="text-sm font-medium mb-3">{diff.length} field{diff.length > 1 ? "s" : ""} changed</p>
                            <div className="rounded-xl border divide-y">
                                {diff.map((c) => (
                                    <div key={c.label} className="px-3.5 py-2.5 text-sm">
                                        <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs line-through">{c.from}</span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 text-xs font-medium">{c.to}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No changes could be summarized for this entry.</p>
                    )}
                </div>

                <div className="px-5 py-3.5 border-t shrink-0 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}