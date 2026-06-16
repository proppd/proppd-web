import Anthropic from '@anthropic-ai/sdk';

export type ListingFacts = {
  title?: string;
  purpose?: 'sale' | 'rent';
  propertyType?: string;
  suburb?: string;
  city?: string;
  province?: string;
  price?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  parking?: number | string;
  floorSizeSqm?: number | string;
  erfSizeSqm?: number | string;
  features?: string[];
};

export type AiEnv = Record<string, string | undefined>;

export const AI_MODEL = 'claude-opus-4-8';

export function isAiConfigured(env: AiEnv = process.env): boolean {
  return Boolean(env.ANTHROPIC_API_KEY?.trim());
}

const SYSTEM_PROMPT = [
  'You are a senior South African estate agent writing property listing descriptions for the Proppd portal.',
  'Write one polished, accurate description from the facts provided.',
  'Rules:',
  '- 110-180 words, two short paragraphs, warm and professional — no hype, no clichés like "dream home" or "nestled".',
  '- Use only the facts given. Never invent rooms, finishes, schools, security, or distances that are not provided.',
  '- South African English and ZAR context. Do not restate the exact price; refer to it naturally only if helpful.',
  '- Do not include contact details, agent names, or any personal information (POPIA).',
  '- Return only the description text — no headings, no preamble, no quotation marks.',
].join('\n');

export function buildListingFactSheet(facts: ListingFacts): string {
  const lines: string[] = [];
  const add = (label: string, value: unknown) => {
    if (value === undefined || value === null) return;
    const text = String(value).trim();
    if (text) lines.push(`${label}: ${text}`);
  };

  add('Listing title', facts.title);
  add('Purpose', facts.purpose === 'rent' ? 'For rent' : facts.purpose === 'sale' ? 'For sale' : undefined);
  add('Property type', facts.propertyType);
  const location = [facts.suburb, facts.city, facts.province].map((part) => (part ? String(part).trim() : '')).filter(Boolean).join(', ');
  add('Location', location);
  add('Bedrooms', facts.bedrooms);
  add('Bathrooms', facts.bathrooms);
  add('Parking / garages', facts.parking);
  add('Floor size (m²)', facts.floorSizeSqm);
  add('Erf size (m²)', facts.erfSizeSqm);
  add('Price (ZAR)', facts.price);
  if (facts.features && facts.features.length > 0) {
    add('Features', facts.features.map((f) => String(f).trim()).filter(Boolean).join(', '));
  }

  return lines.join('\n');
}

export function hasEnoughFacts(facts: ListingFacts): boolean {
  // A title or property type is enough to write something useful; the model is
  // instructed not to invent any fact (including location) that isn't provided.
  return Boolean((facts.title && String(facts.title).trim()) || (facts.propertyType && String(facts.propertyType).trim()));
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  townhouse: 'Townhouse',
  'vacant-land': 'Vacant land',
  farm: 'Farm',
  commercial: 'Commercial',
  industrial: 'Industrial',
  office: 'Office',
  retail: 'Retail',
  development: 'Development',
  'room-share': 'Room / share',
};

function coerceFactString(value: unknown): string | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  return undefined;
}

/** Parse untrusted request JSON into a safe, bounded ListingFacts. */
export function parseListingFactsFromBody(body: unknown): ListingFacts {
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const purpose = input.purpose === 'rent' ? 'rent' : input.purpose === 'sale' ? 'sale' : undefined;
  const typeSlug = coerceFactString(input.propertyTypeSlug);
  const propertyType = coerceFactString(input.propertyType) ?? (typeSlug ? PROPERTY_TYPE_LABELS[typeSlug] ?? typeSlug : undefined);

  const features = Array.isArray(input.features)
    ? input.features.map((f) => coerceFactString(f)).filter((f): f is string => Boolean(f)).slice(0, 30)
    : undefined;

  return {
    title: coerceFactString(input.title)?.slice(0, 200),
    purpose,
    propertyType: propertyType?.slice(0, 60),
    suburb: coerceFactString(input.suburb)?.slice(0, 100),
    city: coerceFactString(input.city)?.slice(0, 100),
    province: coerceFactString(input.province)?.slice(0, 100),
    price: coerceFactString(input.price),
    bedrooms: coerceFactString(input.bedrooms),
    bathrooms: coerceFactString(input.bathrooms),
    parking: coerceFactString(input.parking),
    floorSizeSqm: coerceFactString(input.floorSizeSqm),
    erfSizeSqm: coerceFactString(input.erfSizeSqm),
    features,
  };
}

export type GenerateResult =
  | { ok: true; description: string }
  | { ok: false; error: string };

export async function generateListingDescription(facts: ListingFacts, env: AiEnv = process.env): Promise<GenerateResult> {
  const apiKey = env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: 'AI description is not configured on this deployment.' };
  }
  if (!hasEnoughFacts(facts)) {
    return { ok: false, error: 'Add a property type and location first, then generate.' };
  }

  const client = new Anthropic({ apiKey });
  const factSheet = buildListingFactSheet(facts);

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Write the listing description from these facts:\n\n${factSheet}` },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return { ok: false, error: 'The description could not be generated for this listing. Please write it manually.' };
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    if (!text) {
      return { ok: false, error: 'No description was generated. Try again.' };
    }

    return { ok: true, description: text };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return { ok: false, error: `AI service error (${error.status ?? 'unknown'}). Try again shortly.` };
    }
    return { ok: false, error: 'Could not reach the AI service. Try again.' };
  }
}
