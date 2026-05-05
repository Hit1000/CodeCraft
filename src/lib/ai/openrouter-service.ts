import { AIConfig, CompletionRequest } from "./types";

export class OpenRouterService {
  private config: AIConfig;
  private abortController: AbortController | null = null;

constructor(config?: Partial<AIConfig>) {
    this.config = {
      endpoint: config?.endpoint || "/api/openrouter",
      model: config?.model || "openai/gpt-oss-120b:free",
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
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
          stream: false,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("OpenRouter connection check failed:", error);
      return false;
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
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
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.statusText} - ${errorText}`);
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
    onStream?: (chunk: string) => void,
    onReasoning?: (reasoning: string) => void
  ): AsyncGenerator<string, void, unknown> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: true,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[OpenRouter] API error:", response.status, errorText);
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        yield content;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          if (this.abortController?.signal.aborted) break;

          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            
            if (!trimmed) continue;
            if (!trimmed.startsWith("data:")) continue;

            const dataStr = trimmed.slice(5).trim();
            if (dataStr === "[DONE]") break;
            if (dataStr === "") continue;

            try {
              const json = JSON.parse(dataStr);
              const chunk = json.choices?.[0]?.delta?.content || "";
              const reasoning = json.choices?.[0]?.delta?.reasoning || "";
              
              if (reasoning && onReasoning) {
                onReasoning(reasoning);
              }
              
              if (chunk) {
                onStream?.(chunk);
                yield chunk;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Chat error:", error);
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  async explainCode(code: string, language: string): Promise<AsyncGenerator<string, void, unknown>> {
    const messages = [
      { role: "system", content: "You are a helpful code assistant. Provide clear, concise explanations." },
      { role: "user", content: `Explain this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ];
    return this.chat(messages);
  }

  async fixCode(code: string, language: string, error?: string): Promise<AsyncGenerator<string, void, unknown>> {
    const errorContext = error ? `\nError: ${error}` : "";
    const messages = [
      { role: "system", content: "You are a code expert. Fix errors and explain briefly." },
      { role: "user", content: `Fix this ${language} code:${errorContext}\n\`\`\`${language}\n${code}\n\`\`\`` },
    ];
    return this.chat(messages);
  }

  async optimizeCode(code: string, language: string): Promise<AsyncGenerator<string, void, unknown>> {
    const messages = [
      { role: "system", content: "You are a code expert. Optimize for performance and readability." },
      { role: "user", content: `Optimize this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ];
    return this.chat(messages);
  }

  private buildCompletionPrompt(request: CompletionRequest): string {
    return `You are a code completion engine. Complete this code snippet.

Code before cursor:
${request.contextBefore}

Code after cursor:
${request.contextAfter || "(none)"}

Provide only the completion (no explanations).`;
  }

  private extractCompletion(response: string): string {
    const cleaned = response.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
    const lines = cleaned.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^(It seems|Here is|Note:|Explanation:)/i.test(trimmed)) continue;
      if (/[{}\[\]();=><]/.test(trimmed)) return trimmed;
    }
    
    return cleaned.split("\n")[0]?.trim() || "";
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