import React from 'react';
import { ThemeColor } from '../types';
import { Check } from 'lucide-react';

interface ThemingScreenProps {
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
}

interface ThemeOption {
  key: ThemeColor;
  label: string;
  colors: [string, string, string]; // 3 color swatches matching Image 5
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: 'default', label: 'Default', colors: ['#1d4ed8', '#3b82f6', '#60a5fa'] },
  { key: 'blue', label: 'Blue', colors: ['#1d4ed8', '#3b82f6', '#60a5fa'] },
  { key: 'red', label: 'Red', colors: ['#b91c1c', '#ef4444', '#f87171'] },
  { key: 'pink', label: 'Pink', colors: ['#be185d', '#ec4899', '#f472b6'] },
  { key: 'purple', label: 'Purple', colors: ['#6b21a8', '#a855f7', '#c084fc'] },
  { key: 'indigo', label: 'Indigo', colors: ['#3730a3', '#6366f1', '#818cf8'] },
  { key: 'teal', label: 'Teal', colors: ['#0f766e', '#14b8a6', '#2dd4bf'] },
  { key: 'green', label: 'Green', colors: ['#15803d', '#22c55e', '#4ade80'] },
  { key: 'yellow', label: 'Yellow', colors: ['#c2410c', '#eab308', '#facc15'] },
  { key: 'orange', label: 'Orange', colors: ['#c2410c', '#f97316', '#fb923c'] },
  { key: 'brown', label: 'Brown', colors: ['#451a03', '#78350f', '#a16207'] },
  { key: 'grey', label: 'Grey', colors: ['#334155', '#64748b', '#94a3b8'] },
  { key: 'black', label: 'Black', colors: ['#09090b', '#27272a', '#52525b'] },
];

export const ThemingScreen: React.FC<ThemingScreenProps> = ({
  currentTheme = 'default',
  onSelectTheme
}) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-24 px-4 pt-3 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = currentTheme === theme.key || (currentTheme === undefined && theme.key === 'default');

          return (
            <button
              key={theme.key}
              onClick={() => onSelectTheme(theme.key)}
              className={`w-full p-3.5 flex items-center justify-between text-left transition-colors hover:bg-slate-50 ${
                isSelected ? 'bg-blue-50/50' : ''
              }`}
            >
              {/* Radio Button & Label */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-800'}`}>
                  {theme.label}
                </span>
              </div>

              {/* Color Swatch Bar on the Right matching Image 5 */}
              <div className="flex h-7 w-28 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                <div className="flex-1 h-full" style={{ backgroundColor: theme.colors[0] }} />
                <div className="flex-1 h-full" style={{ backgroundColor: theme.colors[1] }} />
                <div className="flex-1 h-full" style={{ backgroundColor: theme.colors[2] }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
