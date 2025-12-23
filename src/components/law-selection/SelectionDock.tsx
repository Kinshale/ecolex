import { Scale, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLawSelectionStore } from '@/stores/lawSelectionStore';
import { cn } from '@/lib/utils';

interface SelectionDockProps {
  onConfirm: () => void;
  className?: string;
  variant?: 'modal' | 'chat';
}

export function SelectionDock({ onConfirm, className, variant = 'modal' }: SelectionDockProps) {
  const { selectedLaws, clearSelection, deselectLaw } = useLawSelectionStore();

  if (selectedLaws.length === 0) return null;

  return (
    <div
      className={cn(
        'bg-card border-t shadow-lg',
        variant === 'modal' && 'border-t',
        variant === 'chat' && 'fixed bottom-0 left-0 right-0 z-50 border-t',
        className
      )}
    >
      <div className="flex items-center gap-4 p-4 max-w-7xl mx-auto">
        {/* Left: Icon and count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="p-2 rounded-lg bg-primary/10">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{selectedLaws.length} Laws Selected</p>
            <p className="text-xs text-muted-foreground">Ready to consult</p>
          </div>
        </div>

        {/* Center: Selected laws list */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 py-1">
            {selectedLaws.map((law) => (
              <Badge
                key={law.id}
                variant="secondary"
                className="flex-shrink-0 gap-1 pr-1 max-w-[200px] group"
              >
                <span className="truncate text-xs">{law.short_name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deselectLaw(law.id);
                  }}
                  className="p-0.5 rounded-full hover:bg-muted opacity-60 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-muted-foreground"
          >
            Clear All
          </Button>
          <Button onClick={onConfirm} size="default">
            Confirm & Consult AI
          </Button>
        </div>
      </div>
    </div>
  );
}
