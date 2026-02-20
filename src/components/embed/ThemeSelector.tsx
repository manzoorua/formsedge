import { Sun, Moon, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type ThemeType = 'light' | 'dark' | 'auto';

interface ThemeSelectorProps {
  value: ThemeType;
  onChange: (theme: ThemeType) => void;
}

const themes = [
  {
    id: 'light' as ThemeType,
    name: 'Light',
    icon: Sun,
    gradient: 'from-white to-gray-100',
    iconColor: 'text-yellow-500',
  },
  {
    id: 'dark' as ThemeType,
    name: 'Dark',
    icon: Moon,
    gradient: 'from-gray-900 to-gray-800',
    iconColor: 'text-blue-400',
  },
  {
    id: 'auto' as ThemeType,
    name: 'Auto',
    icon: Monitor,
    gradient: 'from-gray-400 to-gray-600',
    iconColor: 'text-purple-400',
  },
];

export const ThemeSelector = ({ value, onChange }: ThemeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Theme</Label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = value === theme.id;
          
          return (
            <Card
              key={theme.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:scale-105',
                'overflow-hidden group',
                isSelected && 'ring-2 ring-primary shadow-md'
              )}
              onClick={() => onChange(theme.id)}
            >
              <div className={cn(
                'p-4 flex flex-col items-center gap-2',
                'bg-gradient-to-br',
                theme.gradient
              )}>
                <Icon className={cn('w-8 h-8', theme.iconColor)} />
                <span className={cn(
                  'text-sm font-medium',
                  theme.id === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {theme.name}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
