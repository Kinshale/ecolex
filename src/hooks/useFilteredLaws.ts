import { useMemo } from 'react';
import { Law, LawFilters } from '@/types/law';

export function useFilteredLaws(laws: Law[] | undefined, filters: LawFilters) {
  return useMemo(() => {
    if (!laws) return [];

    return laws.filter((law) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          law.title.toLowerCase().includes(searchLower) ||
          law.short_name.toLowerCase().includes(searchLower) ||
          law.summary.toLowerCase().includes(searchLower) ||
          law.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Jurisdiction filter
      if (filters.jurisdictions.length > 0) {
        if (!filters.jurisdictions.includes(law.jurisdiction)) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(law.category)) return false;
      }

      // Status filter
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(law.status)) return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const lawDate = new Date(law.publication_date);
        if (filters.dateRange.from && lawDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && lawDate > filters.dateRange.to) return false;
      }

      return true;
    });
  }, [laws, filters]);
}
