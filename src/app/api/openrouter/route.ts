import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": req.headers.get("referer") || "http://localhost:3000",
        "X-Title": "CodeCraft IDE",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OpenRouter Proxy] Error:", response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    if (body.stream) {
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to connect to OpenRouter";
    console.error("[OpenRouter Proxy] Error:", message);
    return NextResponse.json(
      { error: `OpenRouter proxy error: ${message}` },
      { status: 502 }
    );
  }
}
