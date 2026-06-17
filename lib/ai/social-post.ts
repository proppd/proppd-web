import Anthropic from '@anthropic-ai/sdk';
import {
  AI_MODEL,
  buildListingFactSheet,
  hasEnoughFacts,
  type AiEnv,
  type GenerateResult,
  type ListingFacts,
} from './listing-description';

const SYSTEM_PROMPT = [
  'You are a property marketer writing a short social media post for a South African listing on the Proppd portal.',
  'Write one upbeat, scroll-stopping post from the facts provided.',
  'Rules:',
  '- 2 to 4 short lines plus 3-5 relevant hashtags on the final line.',
  '- A few tasteful emojis are welcome; do not overdo it.',
  '- Use only the facts given. Never invent rooms, finishes, schools, security, or distances.',
  '- South African English. You may mention the suburb/city if provided.',
  '- End the copy with a clear call to action to enquire on Proppd (before the hashtags).',
  '- No contact details, agent names, phone numbers, or any personal information (POPIA).',
  '- Return only the post text — no headings, no preamble, no surrounding quotation marks.',
].join('\n');

export async function generateListingSocialPost(facts: ListingFacts, env: AiEnv = process.env): Promise<GenerateResult> {
  const apiKey = env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: 'AI social posts are not configured on this deployment.' };
  }
  if (!hasEnoughFacts(facts)) {
    return { ok: false, error: 'Add a property type or title first, then generate.' };
  }

  const client = new Anthropic({ apiKey });
  const factSheet = buildListingFactSheet(facts);

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Write the social media post from these facts:\n\n${factSheet}` },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return { ok: false, error: 'A post could not be generated for this listing. Please write it manually.' };
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    if (!text) {
      return { ok: false, error: 'No post was generated. Try again.' };
    }

    return { ok: true, description: text };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return { ok: false, error: `AI service error (${error.status ?? 'unknown'}). Try again shortly.` };
    }
    return { ok: false, error: 'Could not reach the AI service. Try again.' };
  }
}
