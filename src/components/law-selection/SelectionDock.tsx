import { Scale, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLawSelectionStore } from '@/stores/lawSelectionStore';
import { cn } from '@/lib/utils';

interface SelectionDockProps {
  onConfirm: () => void;
  className?: string;
}

export function SelectionDock({ onConfirm, className }: SelectionDockProps) {
  const { selectedLaws, clearSelection, deselectLaw } = useLawSelectionStore();

  if (selectedLaws.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]',
        'bg-card border rounded-2xl shadow-xl p-4',
        'flex items-center gap-4 max-w-2xl w-full mx-4',
        className
      )}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="p-2 rounded-lg bg-primary/10">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">{selectedLaws.length} Laws Selected</p>
          <p className="text-xs text-muted-foreground">Ready to consult</p>
        </div>
      </div>

      {/* Selected laws preview */}
      <div className="flex-1 flex gap-1 overflow-x-auto py-1 scrollbar-hide">
        {selectedLaws.slice(0, 5).map((law) => (
          <Badge
            key={law.id}
            variant="secondary"
            className="flex-shrink-0 gap-1 pr-1 max-w-[150px]"
          >
            <span className="truncate text-xs">{law.short_name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deselectLaw(law.id);
              }}
              className="p-0.5 rounded-full hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {selectedLaws.length > 5 && (
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            +{selectedLaws.length - 5} more
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="text-muted-foreground"
        >
          Clear
        </Button>
        <Button onClick={onConfirm} size="sm">
          Confirm & Consult AI
        </Button>
      </div>
    </div>
  );
}
