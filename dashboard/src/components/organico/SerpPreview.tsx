'use client';

import { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeoSugerido } from './inspector.types';

interface SerpPreviewProps {
  seoSugerido: SeoSugerido;
  productUrl: string;
}

const SEO_LIMITS = { META_TITLE_MAX: 60, META_DESCRIPTION_MAX: 155 } as const;

export function SerpPreview({ seoSugerido, productUrl }: SerpPreviewProps) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleCopy = (text: string, type: 'title' | 'desc') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const getLengthColor = (len: number, max: number) => {
    const ratio = len / max;
    if (ratio < 0.5) return "bg-amber-400"; // Too short
    if (ratio <= 1.0) return "bg-emerald-500"; // Optimal
    return "bg-rose-500"; // Too long
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-start">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-indigo-100 mb-1">Justificación Estratégica</h4>
          <p className="text-sm text-indigo-200/80 leading-relaxed">{seoSugerido.justificacion}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Previsualización de Google</h4>
        </div>
        
        {/* Google SERP Card */}
        <div className="bg-white rounded-xl p-5 shadow-lg font-sans max-w-2xl border border-zinc-200 relative group transition-shadow hover:shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
              <span className="text-xs font-bold text-zinc-600">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] text-[#202124] leading-tight max-w-[280px] truncate">{process.env.NEXT_PUBLIC_STORE_DOMAIN || 'Tienda'}</span>
              <span className="text-[12px] text-[#4d5156] leading-tight truncate max-w-[280px]">{productUrl}</span>
            </div>
          </div>
          
          <h3 className="text-[#1a0dab] text-xl cursor-pointer hover:underline truncate pr-12 group-hover:text-[#1a0dab]/80 transition-colors">
            {seoSugerido.title}
          </h3>
          
          <p className="text-[#4d5156] text-sm mt-1 line-clamp-2 leading-[1.58]">
            {seoSugerido.description}
          </p>
        </div>
        
        {/* Metric Bars & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 p-4 rounded-xl bg-zinc-950/50 border border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-medium">Meta Title</p>
              <button 
                onClick={() => handleCopy(seoSugerido.title, 'title')}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copiedTitle ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedTitle ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  getLengthColor(seoSugerido.title.length, SEO_LIMITS.META_TITLE_MAX)
                )} 
                style={{ width: `${Math.min((seoSugerido.title.length / SEO_LIMITS.META_TITLE_MAX) * 100, 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>{seoSugerido.title.length} caracteres</span>
              <span>Óptimo: ~{SEO_LIMITS.META_TITLE_MAX}</span>
            </div>
          </div>
          
          <div className="space-y-3 p-4 rounded-xl bg-zinc-950/50 border border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-medium">Meta Description</p>
              <button 
                onClick={() => handleCopy(seoSugerido.description, 'desc')}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copiedDesc ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedDesc ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  getLengthColor(seoSugerido.description.length, SEO_LIMITS.META_DESCRIPTION_MAX)
                )} 
                style={{ width: `${Math.min((seoSugerido.description.length / SEO_LIMITS.META_DESCRIPTION_MAX) * 100, 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>{seoSugerido.description.length} caracteres</span>
              <span>Óptimo: ~{SEO_LIMITS.META_DESCRIPTION_MAX}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
