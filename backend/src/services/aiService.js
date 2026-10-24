import { toolDefinitions, toolRegistry } from "./aiTools.js";

const SYSTEM_POLICY = `
You are the HCM Lite AI Assistant for an HR system. Rules you must always follow:
- Only answer using data returned by the tools, or the policy rules below. Never invent numbers.
- If you don't know something, say so honestly.
- Employees can only see their OWN data. If asked about another employee's salary or personal data, politely refuse.
- Label data-based answers as AI-generated. Keep answers short and clear (English or Roman Urdu, matching the user).

Company policy (Policy Q&A):
- Office start 09:00, grace 15 minutes, late after 09:15. Half day if worked less than 5 hours. Weekend: Sat & Sun.
- Leave quotas: annual 14, sick 8, casual 10, unpaid unlimited. Counted on working days only.
- Leave cannot overlap existing requests or exceed remaining balance.
- Payroll: gross = 1.5 x basic (HRA 40% + medical 10%). Deductions for absent/unpaid/half days. Tax on annual slab.
- Only Admin can finalize payroll; finalized runs are locked.
`;

const callLLM = async (messages, tools) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(process.env.AI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
            body: JSON.stringify({
                model: process.env.AI_MODEL || "gpt-4o-mini",
                messages, tools, tool_choice: tools?.length ? "auto" : undefined, temperature: 0.3,
            }),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`AI provider error (${response.status}): ${await response.text()}`);
        return response.json();
    } finally {
        clearTimeout(timeout);
    }
};

export const runAssistant = async (userMessage, ctx) => {
    const toolsUsed = [];
    const messages = [
        { role: "system", content: SYSTEM_POLICY },
        { role: "user", content: userMessage },
    ];

    for (let step = 0; step < 4; step++) {
        const data = await callLLM(messages, toolDefinitions);
        const choice = data.choices?.[0]?.message;
        if (!choice) throw new Error("No response from AI provider");

        if (choice.tool_calls?.length) {
            messages.push(choice);
            for (const call of choice.tool_calls) {
                const fn = toolRegistry[call.function.name];
                let result;
                try {
                    const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
                    result = fn ? await fn(args, ctx) : { error: "Unknown tool" };
                    toolsUsed.push(call.function.name);
                } catch (err) {
                    result = { error: err.message };
                }
                messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
            }
            continue;
        }
        return { content: choice.content, toolsUsed };
    }
    throw new Error("AI assistant exceeded tool-call steps");
};

export const summarizeDashboard = async (kpiJson) => {
    const messages = [
        { role: "system", content: SYSTEM_POLICY + "\nGiven dashboard KPI JSON, return 3-5 short insight bullets using ONLY these numbers." },
        { role: "user", content: `KPI data: ${JSON.stringify(kpiJson)}` },
    ];
    const data = await callLLM(messages, []);
    return data.choices?.[0]?.message?.content;
};

export const parseSmartLeave = async (text, leaveTypes) => {
    const today = new Date().toISOString().split("T")[0];
    const messages = [
        { role: "system", content: `Today's date is ${today}. Convert the user's leave request into STRICT JSON only (no extra text): {"leaveType": "<one of: ${leaveTypes.map((l) => l.name).join(", ")}>", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "reason": "<short reason>"}. Reply reason in Roman Urdu if the user wrote in Roman Urdu.` },
        { role: "user", content: text },
    ];
    const data = await callLLM(messages, []);
    const cleaned = (data.choices?.[0]?.message?.content || "{}").replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
};