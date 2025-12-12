import { useState } from 'react';
import { FilterState, RegulatoryScope, AreaOfInterest, REGULATORY_SCOPE_LABELS, AREA_OF_INTEREST_LABELS } from '@/types';
import { NORMS_DATA } from '@/data/norms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ChevronDown, Globe, Flag, MapPin, Filter, X, ExternalLink } from 'lucide-react';
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

  const handleNormToggle = (normId: string) => {
    const newNorms = filters.selectedNorms.includes(normId)
      ? filters.selectedNorms.filter(n => n !== normId)
      : [...filters.selectedNorms, normId];
    
    onFiltersChange({
      ...filters,
      selectedNorms: newNorms,
    });
  };

  const activeFilterCount = filters.regulatoryScopes.length + (filters.areaOfInterest ? 1 : 0) + filters.selectedNorms.length;

  return (
    <div className={cn(
      "border-t border-border bg-card transition-all duration-300 ease-out",
      isExpanded ? "max-h-[70vh]" : "max-h-14"
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
          {(filters.regulatoryScopes.length > 0 || filters.areaOfInterest) && (
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

          {/* Document Selection Section */}
          <Separator className="my-4" />
          <Label className="text-sm font-medium mb-3 block">Select Specific Norms</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* European Union */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-blue-500/10 px-3 py-2 flex items-center gap-2 border-b border-border">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">European Union</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {filters.selectedNorms.filter(id => id.startsWith('eu-')).length}/{NORMS_DATA.european.length}
                </Badge>
              </div>
              <ScrollArea className="h-48">
                <div className="p-2 space-y-1">
                  {NORMS_DATA.european.map((norm) => (
                    <div key={norm.id} className="flex items-start gap-2 p-1.5 rounded hover:bg-muted/50">
                      <Checkbox
                        id={norm.id}
                        checked={filters.selectedNorms.includes(norm.id)}
                        onCheckedChange={() => handleNormToggle(norm.id)}
                        className="mt-0.5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <a
                        href={norm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-foreground hover:text-blue-500 hover:underline flex-1 leading-tight"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {norm.name}
                        <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
                      </a>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* National (Italy) */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-green-500/10 px-3 py-2 flex items-center gap-2 border-b border-border">
                <Flag className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">National (Italy)</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {filters.selectedNorms.filter(id => id.startsWith('it-')).length}/{NORMS_DATA.national.length}
                </Badge>
              </div>
              <ScrollArea className="h-48">
                <div className="p-2 space-y-1">
                  {NORMS_DATA.national.map((norm) => (
                    <div key={norm.id} className="flex items-start gap-2 p-1.5 rounded hover:bg-muted/50">
                      <Checkbox
                        id={norm.id}
                        checked={filters.selectedNorms.includes(norm.id)}
                        onCheckedChange={() => handleNormToggle(norm.id)}
                        className="mt-0.5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <a
                        href={norm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-foreground hover:text-green-500 hover:underline flex-1 leading-tight"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {norm.name}
                        <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
                      </a>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Lombardy Region */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-amber-500/10 px-3 py-2 flex items-center gap-2 border-b border-border">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Lombardy Region</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {filters.selectedNorms.filter(id => id.startsWith('lom-')).length}/{NORMS_DATA.lombardy.length}
                </Badge>
              </div>
              <ScrollArea className="h-48">
                <div className="p-2 space-y-1">
                  {NORMS_DATA.lombardy.map((norm) => (
                    <div key={norm.id} className="flex items-start gap-2 p-1.5 rounded hover:bg-muted/50">
                      <Checkbox
                        id={norm.id}
                        checked={filters.selectedNorms.includes(norm.id)}
                        onCheckedChange={() => handleNormToggle(norm.id)}
                        className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <a
                        href={norm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-foreground hover:text-amber-500 hover:underline flex-1 leading-tight"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {norm.name}
                        <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
                      </a>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Selected Norms Summary */}
          {filters.selectedNorms.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Selected norms:</span>
              <Badge variant="secondary" className="text-xs">
                {filters.selectedNorms.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onFiltersChange({ ...filters, selectedNorms: [] })}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
