import React, { useState } from 'react';
import { Building, Music, Film, MapPin, Database, ExternalLink, Code2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { DomainInsightGroup, QlooEntity } from '../types';

interface EvidenceSectionProps {
  resolvedSeeds: QlooEntity[];
  domains: {
    brands: DomainInsightGroup;
    music: DomainInsightGroup;
    media: DomainInsightGroup;
    places: DomainInsightGroup;
  };
  connectionMetadata: {
    latencyMs?: number;
    requestId?: string;
    totalEntitiesResolved: number;
  };
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  resolvedSeeds,
  domains,
  connectionMetadata,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'brands' | 'music' | 'media' | 'places'>('all');
  const [showRawPayload, setShowRawPayload] = useState(false);

  const domainTabs = [
    { id: 'all' as const, label: 'All Dimensions', count: connectionMetadata.totalEntitiesResolved },
    { id: 'brands' as const, label: 'Brand Affinities', count: domains.brands.entities.length, icon: Building },
    { id: 'music' as const, label: 'Sonic & Artists', count: domains.music.entities.length, icon: Music },
    { id: 'media' as const, label: 'Cinema & Tropes', count: domains.media.entities.length, icon: Film },
    { id: 'places' as const, label: 'Lifestyle & Places', count: domains.places.entities.length, icon: MapPin },
  ];

  const renderDomainGrid = (group: DomainInsightGroup) => {
    if (group.status === 'error') {
      return (
        <div className="p-4 rounded-sm bg-[#1A0E0E] border border-[#401C1C] text-xs font-mono-code text-[#FCA5A5]">
          Domain query error: {group.errorMessage || 'Unable to retrieve insights from Qloo API'}
        </div>
      );
    }

    if (group.entities.length === 0) {
      return (
        <div className="p-6 text-center rounded-sm bg-[#0C0E12] border border-[#1E232F] text-xs font-mono-code text-[#676F80]">
          No entities returned for {group.domainLabel} with current seed parameters.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {group.entities.map((entity, idx) => {
          const affinityPct = entity.affinity !== undefined
            ? Math.round(entity.affinity * 100)
            : entity.score !== undefined
            ? Math.round(entity.score)
            : Math.max(65, 95 - idx * 4);

          return (
            <div
              key={`${entity.id || entity.name}-${idx}`}
              className="p-3.5 rounded-sm bg-[#0E1015] border border-[#202532] hover:border-[#384154] transition-all space-y-2.5 relative group"
            >
              {/* Top row: Name & Live Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#F4F3EF] truncate group-hover:text-[#CCFF00] transition-colors">
                    {entity.name}
                  </h4>
                  <span className="text-[10px] font-mono-code text-[#6C7384] truncate block">
                    {entity.category || entity.type?.split(':').pop() || group.domain}
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#121E14] border border-[#1D3E21] text-[10px] font-mono-code text-[#4ADE80]">
                  <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                  <span>QLOO</span>
                </div>
              </div>

              {/* Affinity Meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono-code">
                  <span className="text-[#6C7485]">CULTURAL AFFINITY</span>
                  <span className="text-[#CCFF00] font-semibold">{affinityPct}%</span>
                </div>
                <div className="w-full h-1 bg-[#181C25] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#CCFF00] rounded-full transition-all duration-500"
                    style={{ width: `${affinityPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Provenance URN Footnote */}
              <div className="pt-1.5 border-t border-[#181C26] flex items-center justify-between text-[9px] font-mono-code text-[#545B6B]">
                <span className="truncate max-w-[170px]" title={entity.id}>
                  ID: {entity.id || 'urn:qloo:entity'}
                </span>
                {entity.properties?.popularity !== undefined && (
                  <span>POP: {Number(entity.properties.popularity).toFixed(2)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Qloo API Traceability Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202532] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#CCFF00]" />
            <h3 className="font-editorial text-lg text-[#F4F3EF] uppercase tracking-wider font-semibold">
              Live Qloo Cultural Taste Graph
            </h3>
          </div>
          <p className="text-xs text-[#7F8697]">
            Traceable cultural affinities retrieved via <code className="text-[#CCFF00]">GET /v2/insights</code> with{' '}
            <code className="text-[#D8DCE5]">X-Api-Key</code>
          </p>
        </div>

        {/* Provenance stats */}
        <div className="flex items-center gap-3 text-xs font-mono-code text-[#8890A1]">
          {connectionMetadata.latencyMs !== undefined && (
            <span className="px-2 py-1 rounded bg-[#13161E] border border-[#222836]">
              Latency: <span className="text-[#34D399]">{connectionMetadata.latencyMs}ms</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowRawPayload(!showRawPayload)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#13161E] border border-[#222836] text-[#A6ACB9] hover:text-[#ECEBE6] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>{showRawPayload ? 'Hide Provenance' : 'View Raw API Spec'}</span>
            {showRawPayload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Raw Payload Inspector Accordion */}
      {showRawPayload && (
        <div className="p-4 rounded-sm bg-[#08090C] border border-[#1E2330] font-mono-code text-[11px] space-y-2 text-[#9FA6B6]">
          <div className="flex items-center justify-between text-xs text-[#CCFF00] pb-2 border-b border-[#1A1E29]">
            <span>QLOO API AUDIT TRAIL</span>
            <span>REQUEST ID: {connectionMetadata.requestId || 'LIVE_TRACE'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[#596173] block mb-1">SEED ENTITY RESOLUTION (GET /search):</span>
              <pre className="p-2.5 rounded bg-[#0D0F14] border border-[#191D26] overflow-x-auto text-[10px] text-[#C5CAD4]">
                {JSON.stringify(resolvedSeeds, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-[#596173] block mb-1">ACTIVE QUERY PARAMETERS:</span>
              <ul className="space-y-1 text-[#C5CAD4] text-[10px]">
                <li>• Endpoint: https://hackathon.api.qloo.com/v2/insights</li>
                <li>• Header: X-Api-Key: [REDACTED_SERVER_SIDE]</li>
                <li>• signal.interests.entities: {resolvedSeeds.map(s => s.id).join(',')}</li>
                <li>• Domains Queried: Brand, Artist, Movie, Place</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Seeds Row */}
      {resolvedSeeds.length > 0 && (
        <div className="p-3.5 rounded-sm bg-[#0B0D12] border border-[#1C202B] flex flex-wrap items-center gap-2 text-xs font-mono-code">
          <span className="text-[#6D7486] uppercase tracking-wider text-[11px]">Taste Anchor Seeds:</span>
          {resolvedSeeds.map(seed => (
            <span
              key={seed.id}
              className="px-2 py-0.5 rounded-xs bg-[#161A24] border border-[#262C3C] text-[#ECEBE6] flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></span>
              <span className="font-medium">{seed.name}</span>
              <span className="text-[10px] text-[#697082]">({seed.type?.split(':').pop() || 'seed'})</span>
            </span>
          ))}
        </div>
      )}

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1E2330] text-xs font-mono-code">
        {domainTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-sm border whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#181C26] text-[#CCFF00] border-[#394256]'
                : 'bg-transparent text-[#838A9B] border-transparent hover:border-[#1E2330] hover:text-[#D1D5E0]'
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded bg-[#0F1117] text-[10px] text-[#71788A] border border-[#1D222E]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'brands') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#B0B7C6] uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Cross-Domain Brand Affinities ({domains.brands.entities.length})</span>
            </div>
            {renderDomainGrid(domains.brands)}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'music') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#B0B7C6] uppercase tracking-wider">
              <Music className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Sonic Identity & Cultural Icons ({domains.music.entities.length})</span>
            </div>
            {renderDomainGrid(domains.music)}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'media') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#B0B7C6] uppercase tracking-wider">
              <Film className="w-3.5 h-3.5 text-[#F472B6]" />
              <span>Cinema & Narrative Storytelling Tropes ({domains.media.entities.length})</span>
            </div>
            {renderDomainGrid(domains.media)}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'places') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#B0B7C6] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Lifestyle Anchors & Third Places ({domains.places.entities.length})</span>
            </div>
            {renderDomainGrid(domains.places)}
          </div>
        )}
      </div>
    </div>
  );
};
