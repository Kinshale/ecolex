import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DateRangeFilterProps {
  from: Date | null;
  to: Date | null;
  onChange: (range: { from: Date | null; to: Date | null }) => void;
}

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const hasSelection = from || to;

  const displayText = hasSelection
    ? `${from ? format(from, 'MMM yyyy') : '...'} - ${to ? format(to, 'MMM yyyy') : '...'}`
    : 'Date';

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: null, to: null });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-8 gap-1.5 text-sm font-normal rounded-full px-3',
            hasSelection && 'bg-primary/10 border-primary/30 text-primary'
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {displayText}
          {hasSelection ? (
            <X
              className="h-3 w-3 ml-1 opacity-70 hover:opacity-100"
              onClick={clearSelection}
            />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[200] bg-popover" align="start">
        <div className="p-3 border-b">
          <p className="text-sm font-medium">Select date range</p>
        </div>
        <div className="flex">
          <div className="border-r">
            <p className="text-xs text-muted-foreground p-2 border-b">From</p>
            <Calendar
              mode="single"
              selected={from || undefined}
              onSelect={(date) => onChange({ from: date || null, to })}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground p-2 border-b">To</p>
            <Calendar
              mode="single"
              selected={to || undefined}
              onSelect={(date) => onChange({ from, to: date || null })}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
