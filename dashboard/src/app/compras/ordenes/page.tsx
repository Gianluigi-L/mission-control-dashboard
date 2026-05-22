'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, CheckCircle2, AlertCircle, RefreshCw, Calendar, ArrowRight, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseOrder {
  id: string;
  transfer_name: string;
  status: string;
  created_at: { value: string } | string;
  supplier_name: string | null;
  destination_name: string | null;
  received_quantity: number | null;
  total_quantity: number | null;
  items: any[];
}

export default function ComprasPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/compras/ordenes');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setOrders(json.data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener las órdenes de compra');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // KPIs
  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELED');
  
  let totalUnitsBought = 0;
  let pendingItems = 0;
  const supplierCounts: Record<string, number> = {};

  orders.forEach(o => {
    const total = o.total_quantity || 0;
    const received = o.received_quantity || 0;
    
    totalUnitsBought += total;
    if (total > received) {
      pendingItems += (total - received);
    }
    
    if (o.supplier_name && total > 0) {
      supplierCounts[o.supplier_name] = (supplierCounts[o.supplier_name] || 0) + total;
    }
  });

  // Find top supplier
  let topSupplier = 'N/A';
  let maxUnits = 0;
  for (const [supplier, units] of Object.entries(supplierCounts)) {
    if (units > maxUnits) {
      maxUnits = units;
      topSupplier = supplier;
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PARTIAL': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'TRANSFERRED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Órdenes de Compra</h1>
          <p className="text-zinc-400 mt-1">
            Gestión de inventario en tránsito y control de abastecimiento.
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Unidades Compradas"
          value={totalUnitsBought.toLocaleString()}
          sub="Total items 2026"
          color="emerald"
          icon={Package}
        />
        <KpiCard
          label="Unidades en Tránsito"
          value={pendingItems.toLocaleString()}
          sub="Items por recibir"
          color="blue"
          icon={Truck}
        />
        <KpiCard
          label="Top Proveedor"
          value={topSupplier}
          sub={maxUnits.toLocaleString() + " items comprados"}
          color="amber"
          icon={ShoppingCart}
        />
      </div>

      {/* Table Section */}
      <div className="p-1 rounded-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Orden</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Proveedor</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Progreso de Recepción</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Estado</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando información...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No se encontraron órdenes de compra.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const total = order.total_quantity || 0;
                  const received = order.received_quantity || 0;
                  const progressPct = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;
                  const isComplete = progressPct === 100;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 group-hover:border-white/10 transition-colors">
                            <Package className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{order.transfer_name || 'N/A'}</p>
                            <p className="text-xs text-zinc-500">{order.items?.length || 0} SKUs distintos</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-zinc-200">{order.supplier_name || 'Desconocido'}</p>
                      </td>
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={isComplete ? "text-emerald-400" : "text-zinc-400"}>
                            {received} / {total} ítems
                          </span>
                          <span className="font-mono text-zinc-500">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-1000 ease-out", isComplete ? "bg-emerald-500" : "bg-blue-500")}
                            style={{ width: progressPct + "%" }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn("px-2.5 py-1 rounded-md border text-xs font-medium tracking-wide", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          {new Date((order.created_at as any)?.value || order.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string;
  color: 'emerald' | 'rose' | 'blue' | 'amber'; icon: any;
}) {
  const styles: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose:    'text-rose-400    bg-rose-500/10    border-rose-500/20',
    blue:    'text-blue-400    bg-blue-500/10    border-blue-500/20',
    amber:   'text-amber-400   bg-amber-500/10   border-amber-500/20',
  };
  return (
    <div className="p-5 rounded-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-medium text-zinc-400 leading-tight">{label}</p>
        <div className={cn('p-1.5 rounded-lg border', styles[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{sub}</p>
      <div className={cn('absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity', styles[color].split(' ')[1])} />
    </div>
  );
}
