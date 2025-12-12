import { useState } from 'react';
import { FilterState, RegulatoryScope, AreaOfInterest, REGULATORY_SCOPE_LABELS, AREA_OF_INTEREST_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronUp, ChevronDown, Globe, Flag, MapPin, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const scopeIcons: Record<RegulatoryScope, React.ReactNode> = {
  european: <Globe className="w-4 h-4" />,
  national: <Flag className="w-4 h-4" />,
  lombardy: <MapPin className="w-4 h-4" />,
};

export function BottomFilterPanel({ filters, onFiltersChange }: BottomFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const activeFilterCount = filters.regulatoryScopes.length + (filters.areaOfInterest ? 1 : 0);

  return (
    <div className={cn(
      "border-t border-border bg-card transition-all duration-300 ease-out",
      isExpanded ? "max-h-80" : "max-h-14"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-sm">Select Laws/Documents</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Quick filter badges when collapsed */}
          {!isExpanded && filters.regulatoryScopes.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {filters.regulatoryScopes.slice(0, 2).map((scope) => (
                <Badge key={scope} variant="outline" className="text-xs">
                  {scopeIcons[scope]}
                </Badge>
              ))}
              {filters.regulatoryScopes.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{filters.regulatoryScopes.length - 2}
                </Badge>
              )}
            </div>
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "opacity-100" : "opacity-0"
      )}>
        <div className="px-4 pb-4">
          <Separator className="mb-4" />
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Regulatory Scope */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Regulatory Scope</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(REGULATORY_SCOPE_LABELS) as RegulatoryScope[]).map((scope) => (
                  <label
                    key={scope}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all",
                      filters.regulatoryScopes.includes(scope)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={filters.regulatoryScopes.includes(scope)}
                      onCheckedChange={() => handleScopeToggle(scope)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    {scopeIcons[scope]}
                    <span className="text-sm">{REGULATORY_SCOPE_LABELS[scope]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Area of Interest */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Area of Interest</Label>
              <Select
                value={filters.areaOfInterest || 'all'}
                onValueChange={handleAreaChange}
              >
                <SelectTrigger className="w-full">
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
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Active:</span>
              {filters.regulatoryScopes.map((scope) => (
                <Badge
                  key={scope}
                  variant="secondary"
                  className="gap-1 pl-2 pr-1"
                >
                  {scopeIcons[scope]}
                  <span className="text-xs">{REGULATORY_SCOPE_LABELS[scope]}</span>
                  <button
                    onClick={() => handleScopeToggle(scope)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.areaOfInterest && (
                <Badge
                  variant="secondary"
                  className="gap-1 pl-2 pr-1"
                >
                  <span className="text-xs">{AREA_OF_INTEREST_LABELS[filters.areaOfInterest]}</span>
                  <button
                    onClick={() => handleAreaChange('all')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
