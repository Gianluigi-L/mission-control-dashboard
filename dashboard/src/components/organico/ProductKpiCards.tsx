'use client';

import { cn } from '@/lib/utils';
import type { ProductKpis } from './inspector.types';

interface ProductKpiCardsProps {
  kpis: ProductKpis;
}

const POSITION_THRESHOLDS = { GOOD: 10, FAIR: 30 } as const;

export function ProductKpiCards({ kpis }: ProductKpiCardsProps) {
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);
  const formatPercent = (val: number) => `${val.toFixed(2)}%`;
  const formatPos = (val: number) => val.toFixed(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
        <p className="text-xs text-zinc-400 mb-1">Posición Promedio</p>
        <p className={cn(
          "text-2xl font-bold",
          kpis.position > 0 && kpis.position <= POSITION_THRESHOLDS.GOOD ? "text-emerald-400" :
          kpis.position > POSITION_THRESHOLDS.GOOD && kpis.position <= POSITION_THRESHOLDS.FAIR ? "text-amber-400" :
          kpis.position > POSITION_THRESHOLDS.FAIR ? "text-rose-400" : "text-zinc-500"
        )}>
          {kpis.position > 0 ? formatPos(kpis.position) : 'N/A'}
        </p>
      </div>
      <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
        <p className="text-xs text-zinc-400 mb-1">CTR</p>
        <p className="text-2xl font-bold text-amber-400">{formatPercent(kpis.ctr)}</p>
      </div>
      <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
        <p className="text-xs text-zinc-400 mb-1">Impresiones</p>
        <p className="text-2xl font-bold text-blue-400">{formatNumber(kpis.impressions)}</p>
      </div>
      <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
        <p className="text-xs text-zinc-400 mb-1">Clics</p>
        <p className="text-2xl font-bold text-emerald-400">{formatNumber(kpis.clicks)}</p>
      </div>
    </div>
  );
}
