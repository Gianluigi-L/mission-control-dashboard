'use client';

import { useState } from 'react';
import { Sparkles, FileText, BarChart, Target, Search as SearchIcon, Cpu } from 'lucide-react';
import { DiagnosticoTab, MetricasTab, RecomendacionesTab } from './InspectorResults';
import { SerpPreview } from './SerpPreview';
import { InspectorTabs } from './InspectorTabs';
import type { ProductSearchResult, ProductPositionData, InspectionResult } from './inspector.types';

interface InspectorAiPanelProps {
  selectedProduct: ProductSearchResult;
  positionData: ProductPositionData;
  startDate: string;
  endDate: string;
}

export function InspectorAiPanel({ selectedProduct, positionData, startDate, endDate }: InspectorAiPanelProps) {
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunInspector = async () => {
    setIsInspecting(true);
    setInspectionResult(null);
    setError(null);

    try {
      const res = await fetch('/api/trafico/organico/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          startDate,
          endDate
        })
      });
      const json = await res.json();
      if (json.success) {
        setInspectionResult(json.data);
      } else {
        setError(json.error || 'Error desconocido al ejecutar el Inspector AI.');
      }
    } catch (e) {
      console.error(e);
      setError('Error de conexión con el Inspector AI.');
    } finally {
      setIsInspecting(false);
    }
  };

  const tabs = inspectionResult ? [
    {
      id: 'diagnostico',
      label: 'Diagnóstico',
      icon: FileText,
      content: <DiagnosticoTab result={inspectionResult} />
    },
    {
      id: 'metricas',
      label: 'Métricas',
      icon: BarChart,
      content: <MetricasTab metricas={inspectionResult.metricas_criticas} />
    },
    {
      id: 'seo',
      label: 'SEO Preview',
      icon: SearchIcon,
      content: inspectionResult.seo_sugerido ? <SerpPreview seoSugerido={inspectionResult.seo_sugerido} productUrl={positionData.productUrl} /> : <div className="p-8 text-center text-sm text-zinc-500 border border-dashed border-white/10 rounded-xl">No hay sugerencias SEO disponibles.</div>
    },
    {
      id: 'acciones',
      label: 'Acciones',
      icon: Target,
      content: <RecomendacionesTab recomendaciones={inspectionResult.recomendaciones} />
    }
  ] : [];

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden group h-full">
      {/* Header Panel */}
      <div className="p-6 border-b border-indigo-500/20 bg-indigo-500/10 backdrop-blur-sm relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Inspector AI de Métricas</h3>
            </div>
            <p className="text-sm text-zinc-300">Analiza el SEO On-Page, ciclo de vida y tendencias para generar mejoras transaccionales.</p>
          </div>
          <button 
            onClick={handleRunInspector}
            disabled={isInspecting || positionData.kpis.impressions === 0}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 border border-indigo-500/50"
          >
            {isInspecting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analizando...</>
            ) : (
              <><Cpu className="w-5 h-5" /> Ejecutar Auditoría IA</>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 relative z-10 min-h-[500px]">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {!inspectionResult && !isInspecting && !error && (
          <div className="min-h-[420px] border border-dashed border-indigo-500/30 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-zinc-950/50 backdrop-blur-sm">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h4 className="text-lg font-medium text-zinc-200 mb-2">Auditoría SEO Inteligente</h4>
            <p className="text-sm text-zinc-400 max-w-lg mb-6">
              El Inspector AI procesará los datos históricos de Search Console, cruzará información de tendencias de mercado y el contenido actual para proponer mejoras on-page transaccionales.
            </p>
            {positionData.kpis.impressions === 0 ? (
              <p className="text-xs font-medium text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                ⚠️ El producto no tiene impresiones orgánicas en este periodo. La IA necesita datos para trabajar.
              </p>
            ) : (
              <ul className="text-xs text-left text-zinc-500 space-y-2 inline-block">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Analiza rendimiento histórico (Clicks/Imp/CTR)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Extrae contexto de competidores y tendencias</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Formula hipótesis y recomendaciones accionables</li>
              </ul>
            )}
          </div>
        )}

        {isInspecting && (
          <div className="min-h-[420px] border border-indigo-500/20 rounded-xl bg-zinc-900/50 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 animate-pulse delay-75">
                <BarChart className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 animate-pulse delay-150">
                <SearchIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 animate-pulse delay-300">
                <Cpu className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <p className="text-sm text-indigo-300 font-medium">Analizando métricas, tendencias y contenido SEO...</p>
            <p className="text-xs text-zinc-500 mt-2">Correlacionando datos de BigQuery con algoritmos de IA</p>
          </div>
        )}

        {inspectionResult && !isInspecting && (
          <InspectorTabs tabs={tabs} />
        )}
      </div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
    </div>
  );
}
