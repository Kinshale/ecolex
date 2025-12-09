import { FilterState, RegulatoryScope, AreaOfInterest, REGULATORY_SCOPE_LABELS, AREA_OF_INTEREST_LABELS } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Globe, Flag, MapPin, Filter, Layers } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const scopeIcons: Record<RegulatoryScope, React.ReactNode> = {
  european: <Globe className="w-4 h-4" />,
  national: <Flag className="w-4 h-4" />,
  lombardy: <MapPin className="w-4 h-4" />,
};

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const handleScopeToggle = (scope: RegulatoryScope) => {
    const newScopes = filters.regulatoryScopes.includes(scope)
      ? filters.regulatoryScopes.filter(s => s !== scope)
      : [...filters.regulatoryScopes, scope];
    
    onFiltersChange({
      ...filters,
      regulatoryScopes: newScopes,
    });
  };

  const handleAreaChange = (value: string) => {
    onFiltersChange({
      ...filters,
      areaOfInterest: value === 'all' ? null : value as AreaOfInterest,
    });
  };

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-sidebar-accent">
          <Filter className="w-4 h-4 text-sidebar-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-sidebar-foreground">Knowledge Filters</h2>
          <p className="text-xs text-muted-foreground">Refine your search scope</p>
        </div>
      </div>

      {/* Regulatory Scope */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-sidebar-foreground">Regulatory Scope</Label>
        </div>
        
        <div className="space-y-2">
          {(Object.keys(REGULATORY_SCOPE_LABELS) as RegulatoryScope[]).map((scope) => (
            <label
              key={scope}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer group"
            >
              <Checkbox
                checked={filters.regulatoryScopes.includes(scope)}
                onCheckedChange={() => handleScopeToggle(scope)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-muted-foreground group-hover:text-sidebar-foreground transition-colors">
                {scopeIcons[scope]}
              </span>
              <span className="text-sm text-sidebar-foreground flex-1">
                {REGULATORY_SCOPE_LABELS[scope]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="my-5 bg-sidebar-border" />

      {/* Area of Interest */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-sidebar-foreground">Area of Interest</Label>
        <Select
          value={filters.areaOfInterest || 'all'}
          onValueChange={handleAreaChange}
        >
          <SelectTrigger className="bg-background border-sidebar-border">
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {(Object.keys(AREA_OF_INTEREST_LABELS) as AreaOfInterest[]).map((area) => (
              <SelectItem key={area} value={area}>
                {AREA_OF_INTEREST_LABELS[area]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-5 bg-sidebar-border" />

      {/* Active Filters Summary */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-sidebar-foreground">Active Filters</Label>
        <div className="flex flex-wrap gap-1.5">
          {filters.regulatoryScopes.length === 0 ? (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              No scope selected
            </Badge>
          ) : (
            filters.regulatoryScopes.map((scope) => (
              <Badge
                key={scope}
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-0"
              >
                {scopeIcons[scope]}
                <span className="ml-1">{scope}</span>
              </Badge>
            ))
          )}
          {filters.areaOfInterest && (
            <Badge
              variant="secondary"
              className="text-xs bg-accent/20 text-accent-foreground border-0"
            >
              {AREA_OF_INTEREST_LABELS[filters.areaOfInterest]}
            </Badge>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer info */}
      <div className="pt-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Filters apply to chat queries and compliance analysis
        </p>
      </div>
    </aside>
  );
}
