# Ollama AI Integration Skill

## When to Use
Use this skill when working on AI features — code completion, chat, code explanation, fixing, or optimization.

## Key Files
- **Service**: `src/lib/ai/ollama-service.ts` — Ollama API integration
- **Types**: `src/lib/ai/types.ts` — AIMessage, AIConfig, CompletionRequest
- **Store**: `src/store/useCodeEditorStore.ts` — AI state (chatMessages, isChatPanelOpen, isAIThinking, aiConfig)

## Ollama Details
- **URL**: `http://localhost:11434` (via `NEXT_PUBLIC_OLLAMA_ENDPOINT`)
- **Default Model**: `deepseek-coder:1.3b` (via `NEXT_PUBLIC_AI_MODEL`)
- **Streaming**: Supported via `aiConfig.stream` flag

## AI Features
- **Inline Code Completion** — autocomplete in Monaco Editor
- **Code Explanation** — explain selected code
- **Code Fixing** — fix bugs in selected code
- **Code Optimization** — improve performance/readability
- **AI Chat** — conversational assistant panel

## Store AI State
```ts
chatMessages: AIMessage[]
isChatPanelOpen: boolean
isAIThinking: boolean
selectedCode: string
aiConfig: AIConfig  // endpoint, model, temperature, maxTokens, stream
isAutocompleteEnabled: boolean
autocompleteDelay: number  // default 300ms
```

## Patterns

### Adding a new AI action
1. Add action type to `ChatActionType` in `src/lib/ai/types.ts`
2. Handle in Ollama service method
3. Add UI trigger in AI chat panel or editor context menu

### Autocomplete flow
1. User pauses typing (delay from `autocompleteDelay`)
2. Request sent to Ollama with current code context
3. Suggestion rendered inline in Monaco
4. User accepts (Tab) or dismisses (Escape)

## Common Issues
- **Ollama not running**: Check with `curl http://localhost:11434/api/tags`
- **Model not found**: Pull it first with `ollama pull deepseek-coder:1.3b`
- **Slow responses**: Consider smaller model or increase timeout
- **Connection check**: Use `ollamaService.checkConnection()` before operations
