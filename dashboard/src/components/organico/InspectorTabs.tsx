'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

interface InspectorTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export function InspectorTabs({ tabs, defaultTab }: InspectorTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  if (!tabs || tabs.length === 0) return null;

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex items-center gap-1 border-b border-indigo-500/20 pb-px overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                isActive ? "text-indigo-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-t-lg"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)] animate-in slide-in-from-left-2 duration-300" />
              )}
            </button>
          );
        })}
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
        {activeContent}
      </div>
    </div>
  );
}
