import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check, KeyRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function CredentialToastCard({ t, label, value, sub }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy automatically — please copy it manually.");
        }
    }

    return (
        <div
            className={`pointer-events-auto w-[92vw] max-w-sm rounded-xl border border-primary/20 bg-background p-4 shadow-lg ${t.visible ? "animate-in fade-in slide-in-from-top-2" : "animate-out fade-out slide-out-to-top-2"
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <KeyRound className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm font-semibold">{label}</p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            {sub && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{sub}</p>}

            <div className="flex items-center gap-2 mt-3">
                <code className="flex-1 min-w-0 truncate rounded-lg bg-muted px-2.5 py-1.5 font-mono text-sm">
                    {value}
                </code>
                <Button
                    type="button"
                    size="icon"
                    variant={copied ? "default" : "outline"}
                    className="h-8 w-8 shrink-0"
                    onClick={handleCopy}
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
            </div>
        </div>
    );
}

export function showCredentialToast({ label = "Temporary Password", value, sub }) {
    if (!value) return;
    toast.custom((t) => <CredentialToastCard t={t} label={label} value={value} sub={sub} />, {
        duration: 20000,
    });
}