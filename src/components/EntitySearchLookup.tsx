import React, { useState } from 'react';
import { Search, Plus, Check, Loader2, Sparkles, Building, Music, Film, MapPin, Tag } from 'lucide-react';
import { QlooEntity } from '../types';

interface EntitySearchLookupProps {
  onSelectEntity: (entity: QlooEntity) => void;
  selectedEntityIds: string[];
}

export const EntitySearchLookup: React.FC<EntitySearchLookupProps> = ({
  onSelectEntity,
  selectedEntityIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<QlooEntity[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ query });
      if (selectedType) {
        params.append('types', selectedType);
      }

      const res = await fetch(`/api/qloo/search?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Search failed with status ${res.status}`);
      }
      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (err: unknown) {
      setSearchError((err as Error).message || 'Failed to search Qloo entities');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getCategoryIcon = (type?: string, category?: string) => {
    const combined = `${type || ''} ${category || ''}`.toLowerCase();
    if (combined.includes('artist') || combined.includes('music')) return <Music className="w-3.5 h-3.5 text-[#A78BFA]" />;
    if (combined.includes('movie') || combined.includes('film')) return <Film className="w-3.5 h-3.5 text-[#F472B6]" />;
    if (combined.includes('place') || combined.includes('location')) return <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />;
    if (combined.includes('brand')) return <Building className="w-3.5 h-3.5 text-[#CCFF00]" />;
    return <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />;
  };

  return (
    <div className="bg-[#0E1015] border border-[#222734] rounded-sm p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono-code uppercase tracking-wider text-[#F4F3EF] flex items-center gap-1.5 font-medium">
            <Search className="w-3.5 h-3.5 text-[#CCFF00]" />
            Live Qloo Entity Explorer (GET /search)
          </span>
          <p className="text-[11px] text-[#717887]">
            Search real taste anchors from Qloo's cultural database to calibrate the analysis
          </p>
        </div>
      </div>

      {/* Search Input & Category Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search cultural entity (e.g. Patagonia, A24, Taylor Swift, Blue Bottle...)"
              className="w-full px-3.5 py-2 text-xs font-mono-code bg-[#08090C] border border-[#272D3D] text-[#ECEBE6] placeholder:text-[#505766] rounded-sm focus:outline-none focus:border-[#CCFF00] transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-[#1C202B] border border-[#2E3547] text-[#ECEBE6] hover:border-[#CCFF00] hover:text-[#CCFF00] text-xs font-mono-code rounded-sm flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Lookup</span>
          </button>
        </div>

        {/* Domain filter tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono-code text-[#7B8292]">
          <span className="text-[#555C6C]">Filter Type:</span>
          {[
            { label: 'All Domains', val: '' },
            { label: 'Brands', val: 'urn:entity:brand' },
            { label: 'Artists', val: 'urn:entity:artist' },
            { label: 'Films', val: 'urn:entity:movie' },
            { label: 'Places', val: 'urn:entity:place' },
          ].map(tab => (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setSelectedType(tab.val);
                if (searchQuery.trim()) {
                  setTimeout(() => handleSearch(), 50);
                }
              }}
              className={`px-2 py-0.5 rounded-sm border transition-colors ${
                selectedType === tab.val
                  ? 'bg-[#1C202C] text-[#CCFF00] border-[#3F485E]'
                  : 'bg-transparent text-[#7B8292] border-transparent hover:border-[#222734] hover:text-[#B3B9C7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Error Message */}
      {searchError && (
        <div className="p-2.5 rounded-sm bg-[#1E0F0F] border border-[#482020] text-xs font-mono-code text-[#FCA5A5]">
          Error: {searchError}
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#1C202C]">
          <div className="flex items-center justify-between text-[11px] font-mono-code text-[#737A8B]">
            <span>VERIFIED QLOO ENTITIES ({results.length} RETURNED):</span>
            <span className="text-[#4E5463]">CLICK + TO ANCHOR</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {results.map((entity, idx) => {
              const isSelected = selectedEntityIds.includes(entity.id);
              return (
                <div
                  key={`${entity.id || entity.name}-${idx}`}
                  className={`p-2.5 rounded-sm border flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#131914] border-[#294B2E] text-[#9EE4A0]'
                      : 'bg-[#0B0C10] border-[#212634] text-[#D8DCE5] hover:border-[#384054]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded bg-[#151821] border border-[#252A38] shrink-0">
                      {getCategoryIcon(entity.type, entity.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#ECEBE6] truncate">
                        {entity.name}
                      </div>
                      <div className="text-[10px] font-mono-code text-[#697080] truncate">
                        {entity.type || entity.category || 'Cultural Entity'}
                        {entity.properties?.popularity !== undefined && (
                          <span className="ml-1.5 text-[#8890A2]">
                            • Pop: {Number(entity.properties.popularity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectEntity(entity)}
                    className={`p-1.5 rounded-sm border transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#1D3221] border-[#36683D] text-[#86EFAC]'
                        : 'bg-[#151822] border-[#2B3142] text-[#A6ACB9] hover:border-[#CCFF00] hover:text-[#CCFF00]'
                    }`}
                    title={isSelected ? 'Already selected as seed' : 'Add to analysis seed anchors'}
                    aria-label={`Select ${entity.name}`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasSearched && !isSearching && results.length === 0 && !searchError && (
        <div className="p-4 text-center text-xs font-mono-code text-[#737A8B] border border-dashed border-[#222734] rounded-sm">
          No cultural entities found matching "{searchQuery}". Try broader brand or artist names.
        </div>
      )}
    </div>
  );
};
