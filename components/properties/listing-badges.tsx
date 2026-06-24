import { Clock, TrendingDown, Eye, ShieldCheck } from 'lucide-react';

type BadgeType = 'new' | 'price-drop' | 'open-house' | 'featured' | 'verified';

interface ListingBadge {
  type: BadgeType;
  label: string;
}

export function getListingBadges(listing: {
  featured?: boolean;
  isVerified?: boolean;
  listedAt?: string;
  priceReduced?: boolean;
}): ListingBadge[] {
  const badges: ListingBadge[] = [];

  if (listing.isVerified) {
    badges.push({ type: 'verified', label: 'Verified' });
  }

  if (listing.featured) {
    badges.push({ type: 'featured', label: 'Featured' });
  }

  // "New" if listed within 7 days
  if (listing.listedAt) {
    const listed = new Date(listing.listedAt);
    const daysSince = Math.floor((Date.now() - listed.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 7) {
      badges.push({ type: 'new', label: 'New' });
    }
  }

  if (listing.priceReduced) {
    badges.push({ type: 'price-drop', label: 'Price reduced' });
  }

  return badges;
}

export function ListingBadgeDisplay({ badges }: { badges: ListingBadge[] }) {
  if (!badges.length) return null;

  return (
    <div className="flex gap-1.5">
      {badges.map((badge) => (
        <Badge key={badge.type} badge={badge} />
      ))}
    </div>
  );
}

function Badge({ badge }: { badge: ListingBadge }) {
  const styles: Record<BadgeType, string> = {
    'new': 'bg-[#4A3AFF] text-white',
    'price-drop': 'bg-red-500 text-white',
    'open-house': 'bg-[#DBEAFE] text-[#1A1A2E]',
    'featured': 'bg-[#F59E0B] text-white',
    'verified': 'bg-[#166534] text-white',
  };

  const icons: Record<BadgeType, React.ReactNode> = {
    'new': <Clock size={10} />,
    'price-drop': <TrendingDown size={10} />,
    'open-house': <Eye size={10} />,
    'featured': null,
    'verified': <ShieldCheck size={10} />,
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[badge.type]}`}>
      {icons[badge.type]} {badge.label}
    </span>
  );
}
