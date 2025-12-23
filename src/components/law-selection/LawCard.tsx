import { Law } from '@/types/law';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface LawCardProps {
  law: Law;
  isSelected: boolean;
  onToggle: () => void;
  viewMode: 'grid' | 'list';
}

const jurisdictionColors: Record<Law['jurisdiction'], string> = {
  EU: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  Italy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  Regional: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
};

const statusColors: Record<Law['status'], string> = {
  Active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Amended: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  Repealed: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function LawCard({ law, isSelected, onToggle, viewMode }: LawCardProps) {
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(law.pdf_url, '_blank');
  };

  const InfoTooltip = () => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-1 rounded hover:bg-muted flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-sm z-[250]">
          <div className="space-y-2">
            <p className="font-medium">{law.title}</p>
            <p className="text-sm text-muted-foreground">{law.summary}</p>
            <div className="flex flex-wrap gap-1">
              {law.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Published: {format(new Date(law.publication_date), 'PPP')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer',
          isSelected
            ? 'bg-primary/5 border-primary/30'
            : 'hover:bg-muted/30'
        )}
        onClick={onToggle}
      >
        <Checkbox
          checked={isSelected}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        <div className="flex-1 min-w-0">
          <button
            onClick={handleTitleClick}
            className="text-sm font-medium hover:text-primary hover:underline text-left truncate block w-full"
          >
            {law.short_name}
            <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
          </button>
          <p className="text-xs text-muted-foreground truncate">{law.title}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={cn('text-xs', jurisdictionColors[law.jurisdiction])}>
            {law.jurisdiction}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {law.category}
          </Badge>
          <Badge variant="secondary" className={cn('text-xs', statusColors[law.status])}>
            {law.status}
          </Badge>
          <InfoTooltip />
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Card
      className={cn(
        'relative p-4 cursor-pointer transition-colors',
        isSelected
          ? 'ring-2 ring-primary bg-primary/5'
          : 'hover:bg-muted/30'
      )}
      onClick={onToggle}
    >
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3">
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-primary border-primary'
              : 'border-muted-foreground/30'
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>

      {/* Info tooltip */}
      <div className="absolute top-3 right-3">
        <InfoTooltip />
      </div>

      <div className="mt-6 mb-4 space-y-3">
        {/* Title */}
        <div>
          <button
            onClick={handleTitleClick}
            className="text-sm font-semibold hover:text-primary hover:underline text-left"
          >
            {law.short_name}
            <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
          </button>
          <p className="text-xs text-muted-foreground mt-1">{law.title}</p>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className={cn('text-xs', jurisdictionColors[law.jurisdiction])}>
          {law.jurisdiction}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {law.category}
        </Badge>
        <Badge variant="secondary" className={cn('text-xs', statusColors[law.status])}>
          {law.status}
        </Badge>
      </div>

    </Card>
  );
}
