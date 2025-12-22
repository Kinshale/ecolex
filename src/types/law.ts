// Law data structure from norms.json
export interface Law {
  id: string;
  title: string;
  short_name: string;
  jurisdiction: 'EU' | 'Italy' | 'Regional';
  category: 'Water' | 'Air' | 'Waste' | 'Soil' | 'Noise' | 'Energy' | 'General';
  publication_date: string;
  status: 'Active' | 'Amended' | 'Repealed';
  summary: string;
  pdf_url: string;
  tags: string[];
}

// Filter state for the law selection modal
export interface LawFilters {
  search: string;
  jurisdictions: Law['jurisdiction'][];
  categories: Law['category'][];
  statuses: Law['status'][];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export const JURISDICTION_LABELS: Record<Law['jurisdiction'], string> = {
  EU: 'European Union',
  Italy: 'National (Italy)',
  Regional: 'Regional',
};

export const CATEGORY_LABELS: Record<Law['category'], string> = {
  Water: 'Water',
  Air: 'Air Quality',
  Waste: 'Waste Management',
  Soil: 'Soil',
  Noise: 'Noise',
  Energy: 'Energy',
  General: 'General',
};

export const STATUS_LABELS: Record<Law['status'], string> = {
  Active: 'Active',
  Amended: 'Amended',
  Repealed: 'Repealed',
};

export const DEFAULT_LAW_FILTERS: LawFilters = {
  search: '',
  jurisdictions: [],
  categories: [],
  statuses: [],
  dateRange: {
    from: null,
    to: null,
  },
};
