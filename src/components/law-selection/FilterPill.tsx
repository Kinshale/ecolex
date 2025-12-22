import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FilterPillProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onSelectionChange: (values: T[]) => void;
  icon?: React.ReactNode;
}

export function FilterPill<T extends string>({
  label,
  options,
  selected,
  onSelectionChange,
  icon,
}: FilterPillProps<T>) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: T) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((v) => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  const displayText = selected.length > 0
    ? `${label}: ${selected.length}`
    : label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-8 gap-1.5 text-sm font-normal rounded-full px-3',
            selected.length > 0 && 'bg-primary/10 border-primary/30 text-primary'
          )}
        >
          {icon}
          {displayText}
          {selected.length > 0 ? (
            <X
              className="h-3 w-3 ml-1 opacity-70 hover:opacity-100"
              onClick={clearSelection}
            />
          ) : (
            <ChevronsUpDown className="h-3 w-3 ml-1 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 z-[200] bg-popover" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleToggle(option.value)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selected.includes(option.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50'
                    )}
                  >
                    {selected.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
