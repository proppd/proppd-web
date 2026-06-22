// Client-side workspace storage for sellers and landlords. Mirrors the
// saved-homes localStorage pattern so owners get a CRM without needing an
// agent account or backend persistence.

export const OWNER_PROPERTIES_STORAGE_KEY = 'proppd.owner-properties';
export const OWNER_PROPERTIES_CHANGE_EVENT = 'proppd:owner-properties-change';

export type OwnerIntent = 'sell' | 'rent';
export type OwnerStage = 'researching' | 'preparing' | 'valuing' | 'listed' | 'under_offer' | 'closed';

export type OwnerProperty = {
  id: string;
  nickname: string;
  suburb: string;
  city: string;
  propertyType: string;
  bedrooms: number;
  bathrooms?: number;
  floorSize?: number;
  intent: OwnerIntent;
  askingPrice?: number;
  stage: OwnerStage;
  notes?: string;
  createdAt: string;
};

export type OwnerStageMeta = { value: OwnerStage; label: string; helper: string };

export const OWNER_STAGES: OwnerStageMeta[] = [
  { value: 'researching', label: 'Researching', helper: 'Deciding whether to sell or rent' },
  { value: 'preparing', label: 'Preparing', helper: 'Getting the property ready' },
  { value: 'valuing', label: 'Valuing', helper: 'Settling on a price' },
  { value: 'listed', label: 'Listed', helper: 'On the market' },
  { value: 'under_offer', label: 'Under offer', helper: 'Negotiating with a buyer or tenant' },
  { value: 'closed', label: 'Closed', helper: 'Sold or let' },
];

export const OWNER_PROPERTY_TYPES = ['House', 'Apartment', 'Townhouse', 'Flat', 'Vacant land', 'Commercial'];

export function ownerStageLabel(stage: OwnerStage): string {
  return OWNER_STAGES.find((entry) => entry.value === stage)?.label ?? 'Researching';
}

export function ownerStageIndex(stage: OwnerStage): number {
  const index = OWNER_STAGES.findIndex((entry) => entry.value === stage);
  return index < 0 ? 0 : index;
}

function coerceProperty(value: unknown): OwnerProperty | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === 'string' ? raw.id : '';
  const suburb = typeof raw.suburb === 'string' ? raw.suburb : '';
  const city = typeof raw.city === 'string' ? raw.city : '';
  const propertyType = typeof raw.propertyType === 'string' ? raw.propertyType : '';
  if (!id || !suburb || !city || !propertyType) return null;

  const intent: OwnerIntent = raw.intent === 'rent' ? 'rent' : 'sell';
  const stage = OWNER_STAGES.some((entry) => entry.value === raw.stage) ? (raw.stage as OwnerStage) : 'researching';

  return {
    id,
    nickname: typeof raw.nickname === 'string' ? raw.nickname : '',
    suburb,
    city,
    propertyType,
    bedrooms: toPositiveNumber(raw.bedrooms) ?? 1,
    bathrooms: toPositiveNumber(raw.bathrooms),
    floorSize: toPositiveNumber(raw.floorSize),
    intent,
    askingPrice: toPositiveNumber(raw.askingPrice),
    stage,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
  };
}

function toPositiveNumber(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function readOwnerProperties(): OwnerProperty[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(OWNER_PROPERTIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceProperty).filter((entry): entry is OwnerProperty => entry !== null);
  } catch {
    return [];
  }
}

export function writeOwnerProperties(items: OwnerProperty[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(OWNER_PROPERTIES_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(OWNER_PROPERTIES_CHANGE_EVENT));
}

export function subscribeOwnerProperties(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onChange();
  window.addEventListener('storage', handler);
  window.addEventListener(OWNER_PROPERTIES_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(OWNER_PROPERTIES_CHANGE_EVENT, handler);
  };
}

export function createOwnerPropertyId(): string {
  return `op_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function upsertOwnerProperty(property: OwnerProperty): OwnerProperty[] {
  const items = readOwnerProperties();
  const exists = items.some((entry) => entry.id === property.id);
  const next = exists ? items.map((entry) => (entry.id === property.id ? property : entry)) : [property, ...items];
  writeOwnerProperties(next);
  return next;
}

export function removeOwnerProperty(id: string): OwnerProperty[] {
  const next = readOwnerProperties().filter((entry) => entry.id !== id);
  writeOwnerProperties(next);
  return next;
}
