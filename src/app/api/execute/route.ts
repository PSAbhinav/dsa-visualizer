import { type NextRequest, NextResponse } from "next/server";

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

const languageIds = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  go: 60,
} as const;

type SupportedLanguage = keyof typeof languageIds;

function isSupportedLanguage(language: string): language is SupportedLanguage {
  return language in languageIds;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      code?: string;
      language?: string;
      stdin?: string;
    };

    const code = body.code?.trim();
    const language = body.language?.trim().toLowerCase();

    if (!code) {
      return NextResponse.json({ error: "Code is required." }, { status: 400 });
    }

    if (!language || !isSupportedLanguage(language)) {
      return NextResponse.json({ error: "Unsupported language selected." }, { status: 400 });
    }

    const response = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageIds[language],
        stdin: body.stdin ?? "",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "The execution service is currently unavailable. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as {
      stdout?: string | null;
      stderr?: string | null;
      compile_output?: string | null;
      message?: string | null;
      time?: string | null;
      memory?: number | null;
      status?: { id?: number; description?: string };
    };

    return NextResponse.json({
      stdout: payload.stdout ?? null,
      stderr: payload.stderr ?? null,
      compileOutput: payload.compile_output ?? null,
      message: payload.message ?? null,
      executionTime: payload.time ? `${payload.time}s` : null,
      memory: payload.memory ?? null,
      status: payload.status?.description ?? "Completed",
      passed: payload.status?.id === 3,
      output:
        payload.stdout ?? payload.stderr ?? payload.compile_output ?? payload.message ?? "Program finished with no output.",
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    return NextResponse.json(
      {
        error: isTimeout
          ? "Execution timed out. Try simplifying the program or reducing the input size."
          : "Unable to execute the code right now. Please check your connection and try again.",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
