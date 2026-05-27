'use client';

import { cn } from '@/lib/utils';
import type { InspectionResult, MetricaCritica, Recomendacion } from './inspector.types';

export function DiagnosticoTab({ result }: { result: InspectionResult }) {
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl bg-zinc-900/80 border border-indigo-500/20 relative">
        {result.fase && (
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
            {result.fase}
          </span>
        )}
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Diagnóstico del Producto</h4>
        <p className="text-sm text-zinc-200 leading-relaxed md:pr-24">{result.diagnostico}</p>
      </div>

      <div className="p-5 rounded-xl bg-zinc-900/50 border border-white/5">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Hipótesis de Rendimiento</h4>
        <ul className="space-y-3">
          {result.hipotesis?.map((h, i) => (
            <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-indigo-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
              <span>{h}</span>
            </li>
          ))}
          {(!result.hipotesis || result.hipotesis.length === 0) && (
            <li className="text-sm text-zinc-500">No hay hipótesis generadas.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function MetricasTab({ metricas }: { metricas?: MetricaCritica[] }) {
  if (!metricas || metricas.length === 0) {
    return <div className="p-8 text-center text-sm text-zinc-500 border border-dashed border-white/10 rounded-xl">No hay métricas críticas identificadas.</div>;
  }

  // Parse strings to calculate gap percentage
  const parseVal = (str: string) => {
    const num = parseFloat(str.replace(/[^0-9.-]+/g,""));
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="space-y-4">
      {metricas.map((m, i) => {
        const actual = parseVal(m.valor_actual);
        const ideal = parseVal(m.valor_ideal);
        // Assuming actual is worse than ideal, or simply calculate a ratio
        const isPercentage = m.valor_actual.includes('%');
        let ratio = ideal !== 0 ? (actual / ideal) * 100 : 0;
        if (ratio > 100) ratio = 100; // Cap it
        
        // Severity color
        const isGood = ratio >= 90;
        const isWarning = ratio >= 60 && ratio < 90;
        
        return (
          <div key={i} className="p-5 rounded-xl bg-zinc-900/50 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-zinc-200">{m.nombre}</h4>
              <span className={cn(
                "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                isGood ? "bg-emerald-500/10 text-emerald-400" :
                isWarning ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
              )}>
                {isGood ? 'Óptimo' : isWarning ? 'Atención' : 'Crítico'}
              </span>
            </div>
            
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden relative">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${ratio}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
                style={{ left: '95%' }} // The ideal marker is usually near the end
                title="Ideal"
              />
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-zinc-500">Actual: </span>
                <span className="text-white font-bold">{m.valor_actual}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500">Objetivo: </span>
                <span className="text-emerald-400 font-bold">{m.valor_ideal}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RecomendacionesTab({ recomendaciones }: { recomendaciones?: Recomendacion[] }) {
  if (!recomendaciones || recomendaciones.length === 0) {
    return <div className="p-8 text-center text-sm text-zinc-500 border border-dashed border-white/10 rounded-xl">No hay recomendaciones disponibles.</div>;
  }

  // Sort: Alto impact first, then Bajo esfuerzo first
  const sortedRecs = [...recomendaciones].sort((a, b) => {
    const impactWeight = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 };
    const effortWeight = { 'Bajo': 3, 'Medio': 2, 'Alto': 1 };
    
    const aScore = (impactWeight[a.impacto_esperado] || 0) * 10 + (effortWeight[a.esfuerzo] || 0);
    const bScore = (impactWeight[b.impacto_esperado] || 0) * 10 + (effortWeight[b.esfuerzo] || 0);
    
    return bScore - aScore;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {sortedRecs.map((r, i) => {
        const isHighImpact = r.impacto_esperado?.toLowerCase() === 'alto';
        
        return (
          <div 
            key={i} 
            className={cn(
              "p-5 rounded-xl bg-zinc-900/50 border relative flex flex-col justify-between",
              isHighImpact ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-white/5"
            )}
          >
            {/* Edge highlight line */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
              isHighImpact ? "bg-emerald-500" : "bg-blue-500"
            )} />
            
            <p className="text-sm text-zinc-200 mb-6 pl-2">{r.accion}</p>
            
            <div className="flex items-center gap-2 pl-2">
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded uppercase flex-1 text-center",
                isHighImpact ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
              )}>
                Impacto {r.impacto_esperado}
              </span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded uppercase flex-1 text-center",
                r.esfuerzo?.toLowerCase() === 'bajo' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
              )}>
                Esfuerzo {r.esfuerzo}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
