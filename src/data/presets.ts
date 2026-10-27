import { AnalysisInput } from '../types';

export interface PresetBrief extends AnalysisInput {
  tagline: string;
}

export const PRESET_BRIEFS: PresetBrief[] = [
  {
    productName: 'Kinetic Brew',
    category: 'Functional Beverage & Nootropics',
    tagline: 'Precision cold-extracted focus tonic for systems architects and creative builders',
    description:
      'A cold-extracted, single-origin botanical nootropic beverage designed to provide sustained cognitive flow state without jitter or crash, packaged in matte smoked glass.',
    targetMarkets: ['Tokyo', 'San Francisco', 'London'],
    primaryMarket: 'Tokyo',
    targetAudience: 'Software engineers, design system leads, boutique agency founders, creative technologists (ages 24-38)',
    proposedPositioning:
      'Positioned as an elite bio-computational cognitive enhancer for deep work and high-output creative sprints.',
    launchObjective: 'cult_status',
    seedKeywords: ['Blue Bottle', 'Nike', 'Patagonia', 'Acne Studios'],
  },
  {
    productName: 'VaultArchive',
    category: 'Archival Fashion & Luxury Resale',
    tagline: 'Authenticated peer-to-peer exchange for runway grails and vintage Japanese garments',
    description:
      'A decentralized physical-authentication registry and private auction house connecting collectors of archival garments (Maison Margiela 1990s, Comme des Garçons, Undercover) with museum-grade provenance.',
    targetMarkets: ['London', 'New York', 'Paris'],
    primaryMarket: 'London',
    targetAudience: 'Cultural curators, fashion archivists, industrial designers, electronic musicians (ages 22-35)',
    proposedPositioning:
      'Positioned as a subversive cultural institution celebrating material preservation, anti-fast-fashion intellect, and subcultural heritage.',
    launchObjective: 'counter_cultural',
    seedKeywords: ['Comme des Garçons', 'A24', 'Dover Street Market', 'Monocle'],
  },
  {
    productName: 'Lumina Circadian',
    category: 'Ambient Hardware & Spatial Tech',
    tagline: 'Screenless desktop monolith emitting dynamic solar spectra and spatial brown noise',
    description:
      'An aluminum-milled monolithic desktop fixture that synchronizes room color temperature with natural solar arc and broadcasts subtle generative acoustic masking for deep sensory focus.',
    targetMarkets: ['Austin', 'Berlin', 'New York'],
    primaryMarket: 'Austin',
    targetAudience: 'Remote tech founders, audio producers, modernist architects, wellness minimalists (ages 28-45)',
    proposedPositioning:
      'Positioned as a quiet architectural luxury object reclaiming human biological rhythm from chaotic digital screens.',
    launchObjective: 'category_creation',
    seedKeywords: ['Sonos', 'Teenage Engineering', 'Aesop', 'Dieter Rams'],
  },
];
