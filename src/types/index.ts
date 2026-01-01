export type RegulatoryScope = 'european' | 'national' | 'lombardy';

export type AreaOfInterest = 
  | 'sewage' 
  | 'air_quality' 
  | 'waste_management' 
  | 'water_resources' 
  | 'noise_pollution' 
  | 'soil_contamination' 
  | 'energy' 
  | 'general';

export interface NormItem {
  id: string;
  name: string;
  url: string;
}

export interface FilterState {
  regulatoryScopes: RegulatoryScope[];
  areaOfInterest: AreaOfInterest | null;
  selectedNorms: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt: Date;
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  excerpt: string;
  regulatoryScope: RegulatoryScope;
}

export interface Conversation {
  id: string;
  title: string;
  regulatoryFilters: RegulatoryScope[];
  areaFilter: AreaOfInterest | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  fileName: string;
  regulatoryScope: RegulatoryScope;
  areaOfInterest: AreaOfInterest;
  contentSummary?: string;
  isProcessed: boolean;
  createdAt: Date;
}


export const REGULATORY_SCOPE_LABELS: Record<RegulatoryScope, string> = {
  european: 'European Union',
  national: 'National (Italy)',
  lombardy: 'Lombardy Region',
};

export const AREA_OF_INTEREST_LABELS: Record<AreaOfInterest, string> = {
  sewage: 'Sewage & Wastewater',
  air_quality: 'Air Quality',
  waste_management: 'Waste Management',
  water_resources: 'Water Resources',
  noise_pollution: 'Noise Pollution',
  soil_contamination: 'Soil Contamination',
  energy: 'Energy & Emissions',
  general: 'General',
};
