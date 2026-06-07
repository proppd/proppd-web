import { MapPin, School, TreePine, ShoppingBag, Train } from 'lucide-react';

interface NeighborhoodContextProps {
  location: string;
  city: string;
}

const mockNeighborhoodData = {
  walkScore: 72,
  transitScore: 58,
  bikeScore: 45,
  nearbySchools: [
    { name: 'Local Primary School', rating: 'A', distance: '0.8 km' },
    { name: 'Community High School', rating: 'B+', distance: '1.2 km' },
    { name: 'Private Academy', rating: 'A+', distance: '2.1 km' },
  ],
  amenities: [
    { name: 'Shopping Centre', distance: '0.5 km', icon: ShoppingBag },
    { name: 'Park / Green Space', distance: '0.3 km', icon: TreePine },
    { name: 'Public Transport', distance: '0.7 km', icon: Train },
  ],
};

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 70 ? '#00C9A7' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="text-center">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="5" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" className="fill-[#1A1A2E] text-sm font-bold">
          {score}
        </text>
      </svg>
      <p className="mt-1 text-xs font-bold text-[#6B7280]">{label}</p>
    </div>
  );
}

export function NeighborhoodContext({ location, city }: NeighborhoodContextProps) {
  const data = mockNeighborhoodData;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-[#4A3AFF]" />
        <h3 className="text-base font-bold text-[#1A1A2E]">Neighbourhood</h3>
      </div>
      <p className="mt-1 text-sm text-[#6B7280]">{location}</p>

      {/* Walkability scores */}
      <div className="mt-4 flex items-center justify-around rounded-lg bg-[#F7F8FA] py-3">
        <ScoreRing score={data.walkScore} label="Walk" />
        <ScoreRing score={data.transitScore} label="Transit" />
        <ScoreRing score={data.bikeScore} label="Bike" />
      </div>

      {/* Nearby schools */}
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Nearby schools</p>
        <div className="mt-2 grid gap-2">
          {data.nearbySchools.map((school) => (
            <div key={school.name} className="flex items-center justify-between rounded-lg border border-[#F3F4F6] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <School size={14} className="text-[#4A3AFF]" />
                <span className="text-sm font-bold text-[#1A1A2E]">{school.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#E6FBF7] px-2 py-0.5 text-[10px] font-bold text-[#00C9A7]">{school.rating}</span>
                <span className="text-xs text-[#9CA3AF]">{school.distance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Nearby amenities</p>
        <div className="mt-2 grid gap-2">
          {data.amenities.map((amenity) => (
            <div key={amenity.name} className="flex items-center justify-between rounded-lg border border-[#F3F4F6] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <amenity.icon size={14} className="text-[#6B7280]" />
                <span className="text-sm font-bold text-[#1A1A2E]">{amenity.name}</span>
              </div>
              <span className="text-xs text-[#9CA3AF]">{amenity.distance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
