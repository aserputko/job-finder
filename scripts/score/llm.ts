import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { LLM_API_KEY, LLM_MODEL, LLM_PROVIDER } from '../config.ts';

let openaiClient: OpenAI | undefined;
let anthropicClient: Anthropic | undefined;

function getOpenAI(): OpenAI {
  openaiClient ??= new OpenAI({ apiKey: LLM_API_KEY });
  return openaiClient;
}

function getAnthropic(): Anthropic {
  anthropicClient ??= new Anthropic({ apiKey: LLM_API_KEY });
  return anthropicClient;
}

/**
 * Provider-agnostic single-shot completion.
 * Returns the model's plain text output.
 */
export async function llm(prompt: string): Promise<string> {
  if (LLM_PROVIDER === 'anthropic') {
    const res = await getAnthropic().messages.create({
      model: LLM_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const first = res.content[0];
    if (first?.type === 'text') return first.text;
    return '';
  }

  // default: openai
  const res = await getOpenAI().chat.completions.create({
    model: LLM_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  return res.choices[0]?.message.content ?? '';
}
