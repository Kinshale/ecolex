import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

const variantStyles = {
  primary: {
    card: 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.2)]',
    icon: 'bg-primary text-primary-foreground',
    title: 'text-foreground',
  },
  secondary: {
    card: 'bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 hover:border-success/40 hover:shadow-[0_0_30px_-5px_hsl(var(--success)/0.2)]',
    icon: 'bg-success text-success-foreground',
    title: 'text-foreground',
  },
  accent: {
    card: 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20 hover:border-accent/40 hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.2)]',
    icon: 'bg-accent text-accent-foreground',
    title: 'text-foreground',
  },
};

export function FeatureCard({ icon: Icon, title, description, onClick, variant = 'primary' }: FeatureCardProps) {
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.99]",
        "text-left w-full",
        styles.card
      )}
    >
      {/* Icon */}
      <div className={cn(
        "p-3 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110",
        styles.icon
      )}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3 className={cn("text-xl font-semibold mb-2", styles.title)}>
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>

      {/* Decorative arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <svg
          className="w-6 h-6 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </div>
    </button>
  );
}
