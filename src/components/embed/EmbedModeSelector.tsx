import { LucideIcon, SquareStack, Maximize2, PanelRightOpen, SidebarOpen, PanelBottomOpen, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type EmbedMode = 'inline' | 'popup' | 'slidein';

interface EmbedModeOption {
  id: EmbedMode;
  name: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
  iconBg: string;
}

const embedModes: EmbedModeOption[] = [
  {
    id: 'inline',
    name: 'Inline',
    icon: SquareStack,
    description: 'Embedded directly in page content',
    gradient: 'from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-900/30',
    iconBg: 'bg-purple-500',
  },
  {
    id: 'popup',
    name: 'Popup',
    icon: Maximize2,
    description: 'Center modal overlay',
    gradient: 'from-cyan-50 to-teal-100 dark:from-cyan-950/30 dark:to-teal-900/30',
    iconBg: 'bg-teal-500',
  },
  {
    id: 'slidein',
    name: 'Slider',
    icon: PanelRightOpen,
    description: 'Side panel with tab trigger',
    gradient: 'from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30',
    iconBg: 'bg-blue-500',
  },
];

interface EmbedModeSelectorProps {
  value: EmbedMode;
  onChange: (mode: EmbedMode) => void;
}

export const EmbedModeSelector = ({ value, onChange }: EmbedModeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {embedModes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = value === mode.id;
        
        return (
          <Card
            key={mode.id}
            className={cn(
              'relative cursor-pointer transition-all duration-300 hover:scale-105',
              'hover:shadow-lg overflow-hidden group',
              isSelected && 'ring-2 ring-primary shadow-lg scale-105'
            )}
            onClick={() => onChange(mode.id)}
          >
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity',
              mode.gradient
            )} />
            
            <div className="relative p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  mode.iconBg,
                  'shadow-md'
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{mode.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mode.description}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
