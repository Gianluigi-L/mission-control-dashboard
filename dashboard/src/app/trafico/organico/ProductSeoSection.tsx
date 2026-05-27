'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import { ProductSearch } from '@/components/organico/ProductSearch';
import { ProductKpiCards } from '@/components/organico/ProductKpiCards';
import { ProductTopQueries } from '@/components/organico/ProductTopQueries';
import { InspectorAiPanel } from '@/components/organico/InspectorAiPanel';
import type { ProductSearchResult, ProductPositionData } from '@/components/organico/inspector.types';

export function ProductSeoSection({ startDate, endDate }: { startDate: string, endDate: string }) {
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [positionData, setPositionData] = useState<ProductPositionData | null>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);

  const handleSelectProduct = async (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setIsLoadingPosition(true);
    try {
      const res = await fetch(`/api/trafico/organico/product-position?productId=${product.id}&startDate=${startDate}&endDate=${endDate}`);
      const json = await res.json();
      if (json.success) {
        setPositionData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPosition(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProductSearch onSelectProduct={handleSelectProduct} hasSelectedProduct={!!selectedProduct} />

      {selectedProduct && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{selectedProduct.title}</h3>
              <p className="text-sm text-blue-400/80">Resultados del {startDate} al {endDate}</p>
            </div>
          </div>

          {isLoadingPosition ? (
            <div className="h-40 flex items-center justify-center border border-white/5 rounded-xl bg-zinc-900/30">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : positionData ? (
            <div className="flex flex-col space-y-6">
              <ProductKpiCards kpis={positionData.kpis} />
              
              <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                <div className="xl:col-span-3 self-start sticky top-6">
                  <ProductTopQueries queries={positionData.topQueries} maxVisible={8} />
                </div>
                <div className="xl:col-span-7">
                  <InspectorAiPanel 
                    selectedProduct={selectedProduct}
                    positionData={positionData}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
