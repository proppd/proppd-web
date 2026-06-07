'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';

const LOCATIONS = [
  'Sandton, Johannesburg',
  'Sea Point, Cape Town',
  'Umhlanga, Durban',
  'Rosebank, Johannesburg',
  'Waterfront, Cape Town',
  'Fourways, Johannesburg',
  'Bryanston, Johannesburg',
  'Claremont, Cape Town',
  'Morningside, Johannesburg',
  'Camps Bay, Cape Town',
  'Ballito, Durban',
  'Stellenbosch, Western Cape',
  'Paarl, Western Cape',
  'Centurion, Pretoria',
  'Menlyn, Pretoria',
  'Randburg, Johannesburg',
  'Roodepoort, Johannesburg',
  'Kempton Park, Johannesburg',
  'Bedfordview, Johannesburg',
  'Bloubergstrand, Cape Town',
];

interface SearchAutocompleteProps {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
}

export function SearchAutocomplete({
  name = 'q',
  defaultValue = '',
  placeholder = 'Enter a suburb, city, or address',
  onSelect,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filtered = LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectSuggestion = (value: string) => {
    setQuery(value);
    setIsOpen(false);
    onSelect?.(value);
    inputRef.current?.form?.requestSubmit();
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        name={name}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-sm text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF] sm:text-base"
        placeholder={placeholder}
        aria-label="Search properties"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
      />

      {query && (
        <button
          type="button"
          onClick={() => { setQuery(''); setSuggestions([]); setIsOpen(false); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#1A1A2E]"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition ${
                index === highlightedIndex ? 'bg-[#4A3AFF]/5 text-[#4A3AFF]' : 'text-[#1A1A2E] hover:bg-[#F7F8FA]'
              }`}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <MapPin size={14} className="shrink-0 text-[#9CA3AF]" />
              <span className="font-semibold">{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
