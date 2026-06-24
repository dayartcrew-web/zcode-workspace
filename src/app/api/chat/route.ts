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

    const zai = await ZAI.create();

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

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      max_tokens: 220,
    });

    const content =
      completion.choices?.[0]?.message?.content?.trim() ??
      "I'll review the request and apply the smallest safe change next.";

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
      tokensUsed: completion.usage?.total_tokens ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
