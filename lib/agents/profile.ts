import { slugifyDirectoryName } from '@/lib/directory';

export type AgentProfileInput = Record<string, unknown>;

export type ValidAgentProfileInput = {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  bio?: string;
  agencyName: string;
  areasServed: string[];
};

export type AgentProfileValidation =
  | { success: true; data: ValidAgentProfileInput }
  | { success: false; errors: string[] };

export function parseAreasServed(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeAreas(value.map((item) => String(item)));
  }
  if (typeof value === 'string') {
    return dedupeAreas(value.split(/[,;\n]/));
  }
  return [];
}

export function validateAgentProfileInput(input: AgentProfileInput): AgentProfileValidation {
  const errors: string[] = [];
  const name = coerceString(input.name);
  const phone = coerceString(input.phone);
  const whatsapp = coerceString(input.whatsapp);
  const email = coerceString(input.email);
  const bio = coerceString(input.bio);
  const agencyName = coerceString(input.agencyName);
  const areasServed = parseAreasServed(input.areasServed);

  if (name.length < 3) errors.push('Enter your full name.');
  if (phone.length < 7) errors.push('Enter a contact phone number.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push('Enter a valid email address.');
  if (agencyName.length < 2) errors.push('Enter your agency name (or your own name if independent).');
  if (areasServed.length === 0) errors.push('Add at least one area you serve, e.g. Sandton.');

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      phone,
      whatsapp: whatsapp || undefined,
      email: email || undefined,
      bio: bio || undefined,
      agencyName,
      areasServed,
    },
  };
}

export function slugifyAgentName(value: string): string {
  return slugifyDirectoryName(value);
}

export function buildProfilePrefill(metadata: Record<string, unknown> | null | undefined, email?: string | null): Partial<ValidAgentProfileInput> {
  const firstName = coerceString(metadata?.first_name);
  const lastName = coerceString(metadata?.last_name);
  const name = [firstName, lastName].filter(Boolean).join(' ');

  return {
    name: name || undefined,
    phone: coerceString(metadata?.phone) || undefined,
    email: email?.trim() || undefined,
    agencyName: coerceString(metadata?.agency) || undefined,
    areasServed: parseAreasServed(metadata?.area),
  };
}

function coerceString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function dedupeAreas(values: string[]): string[] {
  const seen = new Set<string>();
  const areas: string[] = [];
  for (const raw of values) {
    const area = raw.trim();
    if (!area) continue;
    const key = area.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    areas.push(area);
  }
  return areas;
}
