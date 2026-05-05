"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { getOpenRouterService } from "@/lib/ai/openrouter-service";
import { useEffect } from "react";
import type * as monaco from "monaco-editor";

export function useAIAutocomplete(editor: monaco.editor.IStandaloneCodeEditor | null) {
    const { isAutocompleteEnabled, autocompleteDelay, language } = useCodeEditorStore();
    const openRouterService = getOpenRouterService();

    useEffect(() => {
        if (!editor || !isAutocompleteEnabled) return;

        let timeoutId: NodeJS.Timeout;
        let isProcessing = false;

        const provider = {
            provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
                console.log("[AI Autocomplete] provideInlineCompletions called!");

                return new Promise((resolve) => {
                    clearTimeout(timeoutId);

                    timeoutId = setTimeout(async () => {
                        if (isProcessing || token.isCancellationRequested) {
                            resolve({ items: [] });
                            return;
                        }

                        try {
                            isProcessing = true;

                            const textBeforeCursor = model.getValueInRange({
                                startLineNumber: 1,
                                startColumn: 1,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column,
                            });

                            const textAfterCursor = model.getValueInRange({
                                startLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endLineNumber: Math.min(position.lineNumber + 5, model.getLineCount()),
                                endColumn: 1,
                            });

                            const currentLine = model.getLineContent(position.lineNumber);
                            const currentChar = currentLine[position.column - 1];
                            if (currentChar && /\w/.test(currentChar)) {
                                resolve({ items: [] });
                                isProcessing = false;
                            } else {
                                console.log("[AI Autocomplete] Requesting completion from OpenRouter...");
                                const completion = await openRouterService.getCompletion({
                                    code: textBeforeCursor + textAfterCursor,
                                    language,
                                    cursorPosition: textBeforeCursor.length,
                                    contextBefore: textBeforeCursor,
                                    contextAfter: textAfterCursor,
                                });

                                console.log("[AI Autocomplete] Got completion:", completion);

                                if (completion && !token.isCancellationRequested) {
                                    const cleanedCompletion = completion.trim().split("\n")[0];

                                    if (cleanedCompletion) {
                                        console.log("[AI Autocomplete] Providing suggestion:", cleanedCompletion);
                                        resolve({
                                            items: [
                                                {
                                                    insertText: cleanedCompletion,
                                                    range: {
                                                        startLineNumber: position.lineNumber,
                                                        startColumn: position.column,
                                                        endLineNumber: position.lineNumber,
                                                        endColumn: position.column,
                                                    },
                                                },
                                            ],
                                        });
                                        isProcessing = false;
                                    } else {
                                        resolve({ items: [] });
                                    }
                                } else {
                                    resolve({ items: [] });
                                }
                            }
                        } catch (error) {
                            console.error("[AI Autocomplete] Error:", error);
                            resolve({ items: [] });
                        } finally {
                            isProcessing = false;
                        }
                    }, autocompleteDelay);
                });
            },
            freeInlineCompletions() { },
        };

        console.log("[AI Autocomplete] Attempting to register provider...");

        if (typeof window === "undefined") {
            console.log("[AI Autocomplete] Window not defined (SSR)");
            return;
        }

        if (!(window as any).monaco) {
            console.log("[AI Autocomplete] Monaco not found on window object");
            return;
        }

        console.log("[AI Autocomplete] Monaco found, registering provider");
        const monacoInstance = (window as any).monaco;
        const disposable = monacoInstance.languages.registerInlineCompletionsProvider(
            { pattern: "**" },
            provider
        );

        console.log("[AI Autocomplete] Provider registered successfully");

        return () => {
            console.log("[AI Autocomplete] Cleanup");
            clearTimeout(timeoutId);
            disposable.dispose();
        };
    }, [editor, isAutocompleteEnabled, autocompleteDelay, language, openRouterService]);
}