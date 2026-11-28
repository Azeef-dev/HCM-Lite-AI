import { toolDefinitions, toolRegistry } from "./aiTools.js";

const SYSTEM_POLICY = `
You are the HCM Lite AI Assistant for an enterprise HR system. Rules you must always follow:
- Only answer using data returned by the tools, or the policy rules below. Never invent numbers.
- If you don't know something, say so honestly.
- Employees can only see their OWN data. If asked about another employee's salary or personal data, politely refuse.
- Label data-based answers as AI-generated. Keep answers short and clear (English or Roman Urdu, matching the user).
- CRITICAL: Never use emojis in any responses or bullet points. Use clean, professional text only.
- CRITICAL: Once a tool returns data to you, you MUST respond with a final text answer summarizing that data for the user in your very next turn. Never end a turn with only tool calls and no text.

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
                model: process.env.AI_MODEL || "openai/gpt-oss-120b",
                messages,
                tools: tools?.length ? tools : undefined,
                tool_choice: tools?.length ? "auto" : undefined,
                temperature: 0.3,
            }),
            signal: controller.signal,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[AI] Provider error ${response.status}:`, errorBody);
            throw new Error(`AI provider error (${response.status})`);
        }
        return response.json();
    } catch (err) {
        if (err.name === "AbortError") {
            console.error("[AI] Request timed out after 15s");
            throw new Error("AI provider timed out");
        }
        throw err;
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

        // Some models occasionally return an empty/whitespace-only final
        // message after a round of tool calls, instead of summarizing the
        // data — this is what was silently producing "I could not generate
        // a response" with no error anywhere. Give it ONE explicit nudge
        // before giving up, rather than returning empty content straight
        // to the frontend.
        if ((!choice.content || !choice.content.trim()) && toolsUsed.length > 0) {
            messages.push({ role: "assistant", content: choice.content || "" });
            messages.push({
                role: "user",
                content: "Please answer my original question now, in plain text, using the data already returned above.",
            });
            const retry = await callLLM(messages, []); // no tools this time — force a text answer
            const retryChoice = retry.choices?.[0]?.message;
            if (retryChoice?.content?.trim()) {
                return { content: retryChoice.content, toolsUsed };
            }
        }

        if (!choice.content || !choice.content.trim()) {
            throw new Error("AI provider returned an empty response");
        }
        return { content: choice.content, toolsUsed };
    }
    throw new Error("AI assistant exceeded tool-call steps");
};

export const summarizeDashboard = async (kpiJson) => {
    const messages = [
        { role: "system", content: SYSTEM_POLICY + "\nGiven dashboard KPI JSON, return 3-5 short insight bullets using ONLY these numbers. Do NOT use emojis." },
        { role: "user", content: `KPI data: ${JSON.stringify(kpiJson)}` },
    ];
    const data = await callLLM(messages, []);
    return data.choices?.[0]?.message?.content;
};

export const parseSmartLeave = async (text, leaveTypes) => {
    const today = new Date().toISOString().split("T")[0];
    const messages = [
        { role: "system", content: `Today's date is ${today}. Convert the user's leave request into STRICT JSON only (no extra text, no markdown backticks): {"leaveType": "<one of: ${leaveTypes.map((l) => l.name).join(", ")}>", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "reason": "<short reason>"}. Reply reason in Roman Urdu if the user wrote in Roman Urdu. Do not use emojis.` },
        { role: "user", content: text },
    ];
    const data = await callLLM(messages, []);
    const cleaned = (data.choices?.[0]?.message?.content || "{}").replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
};