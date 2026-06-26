import { ChevronRight } from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo/schema';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  // Build JSON-LD structured data — only include items that have href or are the current page
  const schemaItems = items
    .filter((item) => item.href || items.indexOf(item) === items.length - 1)
    .map((item) => ({
      name: item.label,
      url: item.href ?? '',
    }));

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-[#9CA3AF]" />}
              {item.href ? (
                <a href={item.href} className="text-[#6B7280] transition hover:text-[#4A3AFF]">
                  {item.label}
                </a>
              ) : (
                <span className="font-bold text-[#1A1A2E]">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {schemaItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(schemaItems)) }}
        />
      )}
    </>
  );
}
