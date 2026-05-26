/**
 * Claude runner — wraps @anthropic-ai/sdk streaming Messages API.
 * Yields typed AgentRunnerEvent objects as they arrive.
 * The SSE route in app/api/agents/stream/[id]/route.ts consumes this generator.
 *
 * Designed to be swap-compatible with @anthropic-ai/claude-agent-sdk when available.
 */

import Anthropic from "@anthropic-ai/sdk";

export type AgentRunnerEvent =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; toolUseId: string; content: string }
  | { type: "usage"; inputTokens: number; outputTokens: number }
  | { type: "error"; message: string }
  | { type: "done" };

export interface RunAgentOptions {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  signal?: AbortSignal;
  maxTokens?: number;
}

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 8192;

const SYSTEM_PROMPT = `You are a Claude Code agent running inside Helm Dashboard.
You are working on software engineering tasks in the user's local environment.
Think carefully, explain your reasoning, and be concise.`;

export async function* runAgent(options: RunAgentOptions): AsyncGenerator<AgentRunnerEvent> {
  const {
    prompt,
    model = process.env.CLAUDE_DEFAULT_MODEL ?? DEFAULT_MODEL,
    systemPrompt = SYSTEM_PROMPT,
    signal,
    maxTokens = DEFAULT_MAX_TOKENS,
  } = options;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    yield { type: "error", message: "ANTHROPIC_API_KEY is not set" };
    yield { type: "done" };
    return;
  }

  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream(
      {
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      },
      { signal },
    );

    for await (const event of stream) {
      if (signal?.aborted) break;
      if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          yield { type: "text", text: event.delta.text };
        }
      } else if (event.type === "content_block_start") {
        if (event.content_block.type === "tool_use") {
          // NOTE: tool_use.input is always {} because the Anthropic Messages API streams
          // input_json_delta events separately. Input aggregation is a TODO for the
          // claude-agent-sdk integration in Sprint 06.
          yield {
            type: "tool_use",
            id: event.content_block.id,
            name: event.content_block.name,
            input: {},
          };
        }
      } else if (event.type === "message_delta" && event.usage) {
        yield {
          type: "usage",
          inputTokens: 0, // input tokens come from message_start
          outputTokens: event.usage.output_tokens,
        };
      } else if (event.type === "message_start" && event.message.usage) {
        yield {
          type: "usage",
          inputTokens: event.message.usage.input_tokens,
          outputTokens: 0,
        };
      }
    }

    yield { type: "done" };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      yield { type: "done" };
      return;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    yield { type: "error", message };
    yield { type: "done" };
  }
}
