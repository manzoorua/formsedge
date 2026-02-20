import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export type PositionType = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface PositionSelectorProps {
  value: PositionType;
  onChange: (position: PositionType) => void;
}

const positions: { id: PositionType; label: string }[] = [
  { id: 'top-left', label: '↖' },
  { id: 'top-center', label: '↑' },
  { id: 'top-right', label: '↗' },
  { id: 'center-left', label: '←' },
  { id: 'center', label: '·' },
  { id: 'center-right', label: '→' },
  { id: 'bottom-left', label: '↙' },
  { id: 'bottom-center', label: '↓' },
  { id: 'bottom-right', label: '↘' },
];

export const PositionSelector = ({ value, onChange }: PositionSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Position</Label>
      <div className="grid grid-cols-3 gap-2 p-4 bg-muted/30 rounded-lg border border-border">
        {positions.map((position) => {
          const isSelected = value === position.id;
          return (
            <button
              key={position.id}
              type="button"
              onClick={() => onChange(position.id)}
              className={cn(
                'aspect-square rounded-md border-2 transition-all duration-200',
                'hover:border-primary hover:bg-primary/10',
                'flex items-center justify-center text-2xl font-bold',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              {position.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Select where the popup or widget should appear on the screen
      </p>
    </div>
  );
};
