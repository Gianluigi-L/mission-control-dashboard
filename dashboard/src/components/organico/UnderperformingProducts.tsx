'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, ArrowUpRight, ChevronRight, Activity, Percent, Eye } from 'lucide-react';
import type { UnderperformingProduct } from './inspector.types';

interface Props {
  onSelectProduct: (product: UnderperformingProduct) => void;
}

export function UnderperformingProducts({ onSelectProduct }: Props) {
  const [products, setProducts] = useState<UnderperformingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchProducts() {
      try {
        const res = await fetch('/api/trafico/organico/underperforming?limit=6');
        const json = await res.json();
        if (json.success && mounted) {
          setProducts(json.data);
        }
      } catch (e) {
        console.error('Error fetching underperforming products:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-6 w-64 bg-zinc-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900/50 rounded-xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-white">Oportunidades de Optimización</h3>
        <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full ml-2">
          Últimos 28 días
        </span>
      </div>
      <p className="text-sm text-zinc-400 mb-4">
        Productos con alto volumen de impresiones pero bajo CTR (&lt; 2%). Analízalos para mejorar sus meta etiquetas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          // Determinar severidad basado en CTR
          const isCritical = product.ctr < 1.0;
          const severityColor = isCritical ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

          return (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group text-left p-4 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800/80 transition-all duration-300 relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-white line-clamp-2 pr-4">{product.title}</h4>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-1">{product.handle}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
                      <Eye className="w-3 h-3" /> Imp.
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {new Intl.NumberFormat('en-US').format(product.total_impressions)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col border-l border-white/10 pl-2">
                    <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
                      <Percent className="w-3 h-3" /> CTR
                    </span>
                    <span className={`text-sm font-bold ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                      {product.ctr.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex flex-col border-l border-white/10 pl-2">
                    <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
                      <Activity className="w-3 h-3" /> Pos.
                    </span>
                    <span className="text-sm font-semibold text-purple-400">
                      {product.avg_position.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
