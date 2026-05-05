import { AIConfig, CompletionRequest } from "./types";

export class OpenRouterService {
  private config: AIConfig;

  constructor(config?: Partial<AIConfig>) {
    this.config = {
      endpoint: config?.endpoint || "/api/openrouter",
      model: config?.model || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "openrouter/free",
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2000,
      stream: config?.stream ?? true,
    };
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5,
          stream: false,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("OpenRouter connection check failed:", error);
      return false;
    }
  }

  async getCompletion(request: CompletionRequest): Promise<string> {
    const prompt = this.buildCompletionPrompt(request);

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
          max_tokens: 48,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const completion = data.choices?.[0]?.message?.content || "";
      return this.extractCompletion(completion);
    } catch (error) {
      console.error("Completion error:", error);
      return "";
    }
  }

  async *chat(
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: this.config.stream,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      if (!this.config.stream || !response.body) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        yield content;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") break;

          try {
            const json = JSON.parse(data);
            const chunk = json.choices?.[0]?.delta?.content || "";
            if (chunk) {
              onStream?.(chunk);
              yield chunk;
            }
          } catch (e) {
            console.error("Error parsing SSE chunk:", e);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  }

  async explainCode(code: string, language: string): Promise<AsyncGenerator<string, void, unknown>> {
    const messages = [
      { role: "system", content: "You are a code expert. Explain code concisely." },
      { role: "user", content: `Explain this ${language} code briefly:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ];
    return this.chat(messages);
  }

  async fixCode(code: string, language: string, error?: string): Promise<AsyncGenerator<string, void, unknown>> {
    const errorContext = error ? `\n\nError message:\n${error}` : "";
    const messages = [
      { role: "system", content: "You are a code expert. Fix errors and be concise." },
      { role: "user", content: `Fix this ${language} code:${errorContext}\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide corrected code and brief explanation.` },
    ];
    return this.chat(messages);
  }

  async optimizeCode(code: string, language: string): Promise<AsyncGenerator<string, void, unknown>> {
    const messages = [
      { role: "system", content: "You are a code expert. Optimize code and be concise." },
      { role: "user", content: `Optimize this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide optimized version and key improvements.` },
    ];
    return this.chat(messages);
  }

  private buildCompletionPrompt(request: CompletionRequest): string {
    const system = `You are an INLINE CODE AUTOCOMPLETE ENGINE.
You will receive a "prefix" which is the code currently before the cursor.
Return ONLY the continuation text to insert at the cursor position.
DO NOT return any explanation, commentary, or markdown.
Return raw code only.`;

    return `${system}

Prefix:
${request.contextBefore}

Suffix:
${request.contextAfter || ""}

Return the single best completion (no explanations). Short is good — keep it <= 48 tokens.`;
  }

  private extractCompletion(response: string): string {
    let cleaned = response;

    cleaned = cleaned.replace(/```[\w]*\n?/g, "").replace(/```/g, "");

    const lines = cleaned.split(/\r?\n/);
    const filtered = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;

      if (/^(It seems|It looks|Here is|Here's|Note:|Explanation:|Your code|The code|This|Sure|I've|I have|Certainly|Of course)/i.test(trimmed)) {
        return false;
      }

      const hasCodeChars = /[{}\[\]();=><]/.test(trimmed);
      if (!hasCodeChars) {
        const hasCodeKeywords = /\b(return|function|const|let|var|if|else|for|while|class|import|export|async|await)\b/.test(trimmed);
        if (!hasCodeKeywords) return false;
      }

      return true;
    });

    if (filtered.length === 0) return "";

    let codeLine = "";
    for (const line of filtered) {
      if (/[{};=()\[\]]/.test(line)) {
        codeLine = line.trim();
        break;
      }
    }

    if (!codeLine && filtered.length > 0) {
      codeLine = filtered[0].trim();
    }

    codeLine = codeLine.replace(/\s*\/\/.*$/g, "");
    codeLine = codeLine.replace(/\/\*.*?\*\//g, "");

    return codeLine.trim();
  }

  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }
}

let openRouterServiceInstance: OpenRouterService | null = null;

export const getOpenRouterService = (): OpenRouterService => {
  if (!openRouterServiceInstance) {
    openRouterServiceInstance = new OpenRouterService();
  }
  return openRouterServiceInstance;
};
