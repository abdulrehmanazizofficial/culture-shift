import React from 'react';
import { Globe, GitCompare, MapPin, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { CrossMarketComparison, QlooEntity } from '../types';

interface CrossMarketComparisonViewProps {
  comparison: CrossMarketComparison;
  marketPlaces: Record<string, QlooEntity[]>;
}

export const CrossMarketComparisonView: React.FC<CrossMarketComparisonViewProps> = ({
  comparison,
  marketPlaces,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#202532] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#CCFF00]" />
            <h3 className="font-editorial text-lg text-[#F4F3EF] uppercase tracking-wider font-semibold">
              Cross-Market Cultural Comparison
            </h3>
          </div>
          <p className="text-xs text-[#7F8697]">
            Empirical comparison across target creative hubs: {comparison.marketsCompared.join(', ')}
          </p>
        </div>
      </div>

      {/* Market Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparison.marketsCompared.map((market, idx) => {
          const profile = comparison.marketProfiles[market];
          const localPlaces = marketPlaces[market] || [];

          return (
            <div
              key={market}
              className="p-4 rounded-sm bg-[#0E1015] border border-[#202532] space-y-3 font-mono-code text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1A1F2B]">
                <div className="flex items-center gap-1.5 font-semibold text-[#F4F3EF]">
                  <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>{market}</span>
                </div>
                <span className="text-[10px] text-[#697182]">HUB 0{idx + 1}</span>
              </div>

              {profile?.culturalToneNuance && (
                <p className="text-[#9FA7B8] text-[11px] leading-relaxed">
                  {profile.culturalToneNuance}
                </p>
              )}

              {/* Local Qloo Place Nodes */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-[#636B7C] uppercase block">
                  Retrieved Qloo Place Nodes ({localPlaces.length}):
                </span>
                {localPlaces.length > 0 ? (
                  <div className="space-y-1">
                    {localPlaces.slice(0, 4).map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="px-2 py-1 rounded-xs bg-[#090A0E] border border-[#191D26] flex items-center justify-between text-[11px]"
                      >
                        <span className="text-[#D8DCE5] truncate">{p.name}</span>
                        {p.affinity !== undefined && (
                          <span className="text-[#CCFF00] text-[10px]">
                            {(p.affinity * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#555C6D] italic">
                    Aggregated regional taste signals
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Cultural Bridges */}
      {comparison.sharedCulturalBridges && comparison.sharedCulturalBridges.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <h4 className="text-xs font-mono-code uppercase tracking-wider font-semibold text-[#86EFAC]">
              Shared Cultural Bridges (Cross-Market Overlap)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comparison.sharedCulturalBridges.map((bridge, idx) => (
              <div
                key={idx}
                className="p-4 rounded-sm bg-[#0B100D] border border-[#1E3B24] space-y-2 font-mono-code text-xs"
              >
                <div className="text-sm font-semibold text-[#F4F3EF] font-editorial">
                  {bridge.culturalBridge}
                </div>
                <div className="flex flex-wrap gap-1">
                  {bridge.supportingEntities.map((ent, entIdx) => (
                    <span
                      key={entIdx}
                      className="px-2 py-0.5 rounded-xs bg-[#131A14] border border-[#27452D] text-[#86EFAC] text-[10px]"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#A4B5A5] leading-relaxed pt-1">
                  {bridge.applicability}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divergent Cultural Nuances */}
      {comparison.divergentCulturalNuances && comparison.divergentCulturalNuances.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-3.5 h-3.5 text-[#FBBF24]" />
            <h4 className="text-xs font-mono-code uppercase tracking-wider font-semibold text-[#FDE68A]">
              Divergent Cultural Nuances (Avoid Flat Copy-Paste)
            </h4>
          </div>

          <div className="space-y-3">
            {comparison.divergentCulturalNuances.map((div, idx) => (
              <div
                key={idx}
                className="p-4 rounded-sm bg-[#120F0B] border border-[#3A2D16] space-y-3 font-mono-code text-xs"
              >
                <div className="text-xs font-semibold text-[#F4F3EF] uppercase tracking-wide">
                  Dimension: {div.dimension}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-[#0A0806] border border-[#261E0F] space-y-1">
                    <span className="text-[10px] text-[#EAB308] font-bold block uppercase">
                      {div.marketA.market}:
                    </span>
                    <p className="text-[#D9CFC4] text-[11px] leading-relaxed">
                      {div.marketA.nuance}
                    </p>
                  </div>

                  <div className="p-3 rounded bg-[#0A0806] border border-[#261E0F] space-y-1">
                    <span className="text-[10px] text-[#EAB308] font-bold block uppercase">
                      {div.marketB.market}:
                    </span>
                    <p className="text-[#D9CFC4] text-[11px] leading-relaxed">
                      {div.marketB.nuance}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-[#CCFF00] pt-1">
                  <strong>Strategic Takeaway: </strong>
                  <span>{div.strategicTakeaway}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty & Anti-Stereotype Safeguard */}
      {comparison.uncertaintyNotes && (
        <div className="p-3.5 rounded-sm bg-[#090A0E] border border-[#1A1F2B] font-mono-code text-[11px] text-[#868E9F] flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#ECEBE6]">Methodological Guardrail: </strong>
            {comparison.uncertaintyNotes} CultureShift does not infer national stereotypes or treat entire countries as culturally uniform.
          </span>
        </div>
      )}
    </div>
  );
};
