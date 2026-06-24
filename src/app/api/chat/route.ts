import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  prompt: string;
  taskTitle: string;
  taskGoal: string;
  branch: string;
  model?: string;
  effort?: "low" | "medium" | "high" | "max";
}

// POST /api/chat — ask the LLM for a follow-up code change plan
// Returns a structured assistant message describing what it would do.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const prompt = (body.prompt || "").trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const system = `You are ZCode, an AI coding agent working inside a developer's IDE.
You operate on a code task. You write code, run commands, and report concise progress.
Always reply in 2-4 short sentences. Do not use markdown headers.
Do not show code blocks. Speak as the agent ("I will ...", "I'm ...").
Match the user's language (English or Chinese).`;

    const user = `Task: ${body.taskTitle}
Goal: ${body.taskGoal}
Branch: ${body.branch}
Model: ${body.model ?? "GLM-5.2"}
Effort: ${body.effort ?? "max"}

User follow-up request:
${prompt}

Reply with a short plan of the next concrete change you would make.`;

    let content: string;
    let tokensUsed = 0;

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
        max_tokens: 220,
      });
      content =
        completion.choices?.[0]?.message?.content?.trim() ??
        simulatedReply(body);
      tokensUsed = completion.usage?.total_tokens ?? 0;
    } catch {
      // No ZAI credentials configured (missing .z-ai-config) or the model
      // call failed. Fall back to a deterministic simulated reply so the
      // offline composer path keeps working instead of returning a 500.
      content = simulatedReply(body);
      tokensUsed = 60 + Math.floor(Math.random() * 180);
    }

    // Simulate a small file touch so the UI feels alive
    const add = 8 + Math.floor(Math.random() * 24);
    const del = 1 + Math.floor(Math.random() * 6);

    return NextResponse.json({
      content,
      command: `Ran git diff --stat ${body.branch}`,
      diffAdd: add,
      diffDel: del,
      files: [
        { name: "index.ts", color: "blue" as const },
        { name: "README.md", color: "blue" as const },
      ],
      tokensUsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Deterministic fallback used when the ZAI model can't be reached. */
function simulatedReply(body: ChatRequestBody): string {
  const short = body.prompt.slice(0, 60);
  return `Looking at "${short}". I'll read the relevant files, apply the smallest safe change to ${body.branch}, and show you the diff before committing.`;
}
