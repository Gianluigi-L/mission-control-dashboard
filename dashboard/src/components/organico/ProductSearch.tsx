'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import type { ProductSearchResult } from './inspector.types';
import { useDebounce } from '@/lib/useDebounce';
import { UnderperformingProducts } from './UnderperformingProducts';

interface ProductSearchProps {
  onSelectProduct: (product: ProductSearchResult) => void;
  hasSelectedProduct?: boolean;
}

export function ProductSearch({ onSelectProduct, hasSelectedProduct = false }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Utilizar el hook de debounce para evitar llamadas excesivas a BQ
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    async function performSearch() {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const res = await fetch(`/api/trafico/organico/product-search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data);
          setShowDropdown(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchTerm]);

  // Cerrar el dropdown al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: ProductSearchResult) => {
    setSearchTerm('');
    setShowDropdown(false);
    onSelectProduct(product);
  };

  return (
    <div ref={wrapperRef} className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl relative z-20">
      <h2 className="text-xl font-bold text-white mb-1">Posicionamiento por Producto</h2>
      <p className="text-sm text-zinc-400 mb-6">Busca un producto para ver su rendimiento SEO específico o selecciona una oportunidad de mejora.</p>
      
      <div className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o handle..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearching(true); // Mostrar loading inmediatamente al escribir
            }}
            onFocus={() => { if (searchResults.length > 0 && searchTerm.length >= 2) setShowDropdown(true); }}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          )}
        </div>

        {/* Dropdown de Búsqueda */}
        {showDropdown && (
          <div className="absolute w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            {searchResults.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto">
                {searchResults.map((p) => (
                  <li 
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{p.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Handle: {p.handle}</p>
                    </div>
                    {/* Mostrar badge si fue encontrado por fuzzy search (match_rank === 2) */}
                    {p.match_rank === 2 && (
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-xs text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-3 h-3" />
                        <span>Aproximado</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : debouncedSearchTerm.length >= 2 && !isSearching ? (
              <div className="px-4 py-6 text-center text-zinc-500">
                <p className="text-sm">No se encontraron productos para "{debouncedSearchTerm}"</p>
                <p className="text-xs mt-1">Intenta con otras palabras clave.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Estado Vacío: Sugerencias de productos con rendimiento deficiente */}
      {!hasSelectedProduct && (!searchTerm || searchTerm.length === 0) && (
        <UnderperformingProducts onSelectProduct={handleSelect} />
      )}
    </div>
  );
}
