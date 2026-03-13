import { NextRequest, NextResponse } from "next/server";

const PISTON_URL =
  process.env.PISTON_API_URL ||
  process.env.NEXT_PUBLIC_PISTON_API_URL ||
  "http://localhost:2000/api/v2/execute";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[Piston Proxy] Sending to:", PISTON_URL);
    console.log("[Piston Proxy] Payload:", JSON.stringify(body).substring(0, 200));

    const payload = {
      ...body,
      compile_timeout: 10000,
      run_timeout: 3000,
    };

    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("[Piston Proxy] Response status:", response.status);

    const text = await response.text();
    console.log("[Piston Proxy] Raw response:", text.substring(0, 500));

    try {
      const data = JSON.parse(text);

      // Surface time limit exceeded as a clear error
      if (data.run?.status === "TO") {
        return NextResponse.json({
          message: data.run.message || "Time limit exceeded",
          run: data.run,
        });
      }

      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { message: `Invalid response from Piston: ${text.substring(0, 200)}` },
        { status: 502 }
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to connect to Piston";
    console.error("[Piston Proxy] Error:", message);
    return NextResponse.json(
      { message: `Execution server error: ${message}` },
      { status: 502 }
    );
  }
}
