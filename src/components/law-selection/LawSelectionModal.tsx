import { Search, Grid3X3, List, RotateCcw, Globe, Flag, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLawSelectionStore } from '@/stores/lawSelectionStore';
import { useLaws } from '@/hooks/useLaws';
import { useFilteredLaws } from '@/hooks/useFilteredLaws';
import { FilterPill } from './FilterPill';
import { DateRangeFilter } from './DateRangeFilter';
import { LawCard } from './LawCard';
import { SelectionDock } from './SelectionDock';
import { Law, JURISDICTION_LABELS, CATEGORY_LABELS, STATUS_LABELS } from '@/types/law';
import { cn } from '@/lib/utils';

const jurisdictionOptions = Object.entries(JURISDICTION_LABELS).map(([value, label]) => ({
  value: value as Law['jurisdiction'],
  label,
}));

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as Law['category'],
  label,
}));

const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value: value as Law['status'],
  label,
}));

const jurisdictionIcons: Record<Law['jurisdiction'], React.ReactNode> = {
  EU: <Globe className="w-3.5 h-3.5" />,
  Italy: <Flag className="w-3.5 h-3.5" />,
  Regional: <MapPin className="w-3.5 h-3.5" />,
};

export function LawSelectionModal() {
  const {
    isModalOpen,
    closeModal,
    filters,
    setFilters,
    resetFilters,
    viewMode,
    setViewMode,
    toggleLaw,
    isLawSelected,
    confirmSelection,
    selectedLaws,
  } = useLawSelectionStore();

  const { data: laws, isLoading } = useLaws();
  const filteredLaws = useFilteredLaws(laws, filters);

  const activeFilterCount =
    filters.jurisdictions.length +
    filters.categories.length +
    filters.statuses.length +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Select Laws & Regulations
          </DialogTitle>
        </DialogHeader>

        {/* Sticky Filter Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search laws by title, short name, or tags..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10 h-10"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <FilterPill
              label="Jurisdiction"
              options={jurisdictionOptions}
              selected={filters.jurisdictions}
              onSelectionChange={(values) => setFilters({ jurisdictions: values })}
              icon={jurisdictionIcons.EU}
            />
            <FilterPill
              label="Category"
              options={categoryOptions}
              selected={filters.categories}
              onSelectionChange={(values) => setFilters({ categories: values })}
            />
            <FilterPill
              label="Status"
              options={statusOptions}
              selected={filters.statuses}
              onSelectionChange={(values) => setFilters({ statuses: values })}
            />
            <DateRangeFilter
              from={filters.dateRange.from}
              to={filters.dateRange.to}
              onChange={(range) => setFilters({ dateRange: range })}
            />

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 text-muted-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}

            <div className="flex-1" />

            {/* View Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 rounded-none px-3',
                  viewMode === 'grid' && 'bg-muted'
                )}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 rounded-none px-3',
                  viewMode === 'list' && 'bg-muted'
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Results count */}
            <span className="text-sm text-muted-foreground">
              {filteredLaws.length} results
            </span>
          </div>
        </div>

        {/* Laws Grid/List */}
        <ScrollArea className="flex-1 px-6">
          <div
            className={cn(
              'py-4 overflow-visible',
              viewMode === 'grid' && 'px-2',
              selectedLaws.length > 0 && 'pb-24'
            )}
          >
            {isLoading ? (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible'
                    : 'space-y-2'
                )}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={viewMode === 'grid' ? 'h-48' : 'h-16'}
                  />
                ))}
              </div>
            ) : filteredLaws.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No laws match your filters.</p>
                <Button
                  variant="link"
                  onClick={resetFilters}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
                )}
              >
                {filteredLaws.map((law) => (
                  <LawCard
                    key={law.id}
                    law={law}
                    isSelected={isLawSelected(law.id)}
                    onToggle={() => toggleLaw(law)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Selection Dock - Full Width at bottom */}
        {selectedLaws.length > 0 && (
          <SelectionDock onConfirm={confirmSelection} variant="modal" />
        )}
      </DialogContent>
    </Dialog>
  );
}
