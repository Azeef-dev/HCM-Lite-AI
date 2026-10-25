import { useState, useRef, useEffect } from "react";
import { aiApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Send, Sparkles, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const SUGGESTIONS = {
    admin: [
        "What is our current headcount by department?",
        "What is the attrition rate this year?",
        "Summarize this month's payroll cost.",
    ],
    hr: [
        "How many employees are on leave today?",
        "Who has pending leave requests?",
        "Show me today's attendance summary.",
    ],
    employee: [
        "What is my leave balance?",
        "When was my last payslip issued?",
        "What is my attendance status this month?",
    ],
};

function withTimeout(promise, ms = 15000) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
    ]);
}

export default function AiAssistant() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const suggestions = SUGGESTIONS[user?.role] || SUGGESTIONS.employee;

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, sending]);

    async function handleSend(text) {
        const content = (text ?? input).trim();
        if (!content) return;
        if (content.length > 1000) {
            toast.error("Message is too long. Keep it under 1000 characters.");
            return;
        }

        setMessages((prev) => [...prev, { role: "user", content, ts: Date.now() }]);
        setInput("");
        setSending(true);

        try {
            const res = await withTimeout(aiApi.chat(content), 15000);
            const reply =
                res?.data?.reply ?? res?.reply ?? res?.data?.message ?? res?.message ?? "I could not generate a response.";
            setMessages((prev) => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
        } catch (err) {
            let fallback = "Something went wrong while contacting the AI assistant. Please try again.";
            if (err.message === "TIMEOUT") {
                fallback = "The AI assistant took too long to respond. Please try again in a moment.";
            } else if (err.status === 429) {
                fallback = "You have reached the hourly limit for AI requests. Please try again later.";
            }
            setMessages((prev) => [...prev, { role: "assistant", content: fallback, ts: Date.now(), isError: true }]);
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
                    <p className="text-sm text-muted-foreground">
                        Ask questions about your HR data. Responses are AI-generated and may require verification.
                    </p>
                </div>
                {messages.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setMessages([])}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Chat
                    </Button>
                )}
            </div>

            <Card className="flex flex-col h-[70vh] p-0 overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">How can I help you today?</p>
                                <p className="text-sm text-muted-foreground">
                                    Try a suggestion below or type your own question.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSend(s)}
                                        className="text-sm px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m, idx) => (
                                <div key={idx} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                                    <div
                                        className={cn(
                                            "h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                                            m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}
                                    >
                                        {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={cn("max-w-[75%] flex flex-col gap-1", m.role === "user" && "items-end")}>
                                        <div
                                            className={cn(
                                                "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                                                m.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : m.isError
                                                        ? "bg-destructive/10 text-destructive rounded-tl-sm"
                                                        : "bg-muted rounded-tl-sm"
                                            )}
                                        >
                                            {m.content}
                                        </div>
                                        {m.role === "assistant" && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1 px-1">
                                                {m.isError ? <AlertTriangle className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                                                AI-generated
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {sending && (
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="border-t p-4 flex items-end gap-3">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about leave, attendance, payroll, or policies..."
                        className="min-h-12 max-h-32 resize-none"
                        disabled={sending}
                    />
                    <Button onClick={() => handleSend()} disabled={sending || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
}