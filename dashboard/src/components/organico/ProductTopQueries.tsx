'use client';

import type { QueryData } from './inspector.types';

interface ProductTopQueriesProps {
  queries: QueryData[];
  maxVisible?: number;
}

export function ProductTopQueries({ queries, maxVisible = 5 }: ProductTopQueriesProps) {
  const formatPos = (val: number) => val.toFixed(1);
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;
  
  const visibleQueries = queries.slice(0, maxVisible);
  const maxClicks = Math.max(...visibleQueries.map(q => q.clicks), 1); // Avoid div by 0

  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
      <h4 className="text-sm font-semibold text-white mb-4">Top {maxVisible} Consultas (Keywords)</h4>
      <div className="space-y-4">
        {visibleQueries.map((q, i) => {
          const widthPct = Math.min((q.clicks / maxClicks) * 100, 100);
          
          return (
            <div key={i} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-200 font-medium truncate pr-4" title={q.query}>{q.query}</span>
                <div className="flex items-center gap-4 text-right flex-shrink-0">
                  <span className="text-emerald-400 w-16">{q.clicks} clics</span>
                  <span className="text-amber-400/80 w-12 text-left">{formatPercent(q.ctr ?? (q.impressions > 0 ? (q.clicks / q.impressions) * 100 : 0))}</span>
                  <span className={
                    q.position <= 10 ? "text-emerald-400 w-12" :
                    q.position <= 30 ? "text-amber-400 w-12" : "text-rose-400 w-12"
                  }>
                    Pos {formatPos(q.position)}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800/50 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400 rounded-full group-hover:from-emerald-400 group-hover:to-emerald-300 transition-all"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
        {queries.length === 0 && (
          <p className="text-xs text-zinc-500 py-4 text-center">Sin datos de queries orgánicas para este periodo.</p>
        )}
      </div>
    </div>
  );
}
