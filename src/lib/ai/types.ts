export interface AIMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface AIConfig {
    endpoint: string;
    model: string;
    temperature: number;
    maxTokens: number;
    stream: boolean;
}

export interface CompletionRequest {
    code: string;
    language: string;
    cursorPosition: number;
    contextBefore: string;
    contextAfter: string;
}

export interface ChatActionType {
    type: "explain" | "fix" | "optimize" | "test" | "comment" | "custom";
    selectedCode?: string;
    error?: string;
    prompt?: string;
}

export interface OpenRouterMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface OpenRouterResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        delta?: {
            content: string;
        };
    }>;
}
