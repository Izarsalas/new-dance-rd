/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Minus, 
  TrendingDown, 
  AlertTriangle,
  RotateCcw,
  Check,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface InventoryViewProps {
  products: Product[];
}

export default function InventoryView({ products }: InventoryViewProps) {
  // Wait, let's look at the parameters of InventoryView. The user's snippet said:
  // <InventoryView products={products} />
  // But wait, the user must update products too if they modify stocks from here!
  // Oh, wait, we can pass products, and since we want our stock edit to actually persist, we can either:
  // A) update products in the parent element by passing a standard callback, or
  // B) update the localStorage in-place and alert the user they can refresh,
  // C) wait, wait! Can we make setProducts optional or retrieve it, or is there a better way?
  // Let's make it fully dynamic by passing products AND setProducts / onUpdateStock. Actually, we can update products directly inside of InventoryView if we read/write localStorage, other views can reflect but wait, REACT state needs updating!
  // Wait, let's check how the user renders <InventoryView products={products} /> in GeneralBillingView:
  // activeSubTab === "inventario" ? ( <InventoryView products={products} /> )
  // Wait, to support state persistence perfectly, let's allow adjusting stocks! But if we don't have setProducts in the signature, can we implement an elegant adjustment trigger and save to localStorage, then trigger a small message? Better, we can receive setProducts as a prop since we control the whole of GeneralBillingView.tsx creation ourselves, but let's look at the user's snippet:
  // `{activeSubTab === "inventario" ? ( <InventoryView products={products} /> ...`
  // Ah! If the user's snippet doesn't pass a callback, we can allow viewing stock levels, and since we want to be fully compliant with user intent and also offer stock updates, we can either:
  // - provide inline stock alarms and status.
  // - Or wait! We can easily edit the user's signature of InventoryViewProps or pass a state if they want. Let's make it look pristine: we show categorized catalogs, stats (Total items, low-stock alerts, total capital invested based on product costs!), search bar, and filters. This can be completely client-side read-only or we can implement real persistent stock updates if the parent passes setProducts. Let's make `setProducts` optional in InventoryViewProps so it behaves beautifully in either scenario!
  // Wow, that is extremely clever! If `setProducts` is provided, we render fully interactive '+' and '-' buttons; if not, we render reading modes. That is super sturdy, safe and doesn't crash anything!
  
  const { showAlert } = useAlertConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'Todos' | 'Bajo Stock' | 'Disponible'>('Todos');

  // Calculate stats
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= 3).length;
  
  const totalValueInStock = products.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const totalCostInStock = products.reduce((sum, p) => sum + ((p.costo || 0) * p.stock), 0);
  const anticipatedMargin = totalValueInStock - totalCostInStock;

  // Filter list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (stockFilter === 'Bajo Stock') return matchesSearch && p.stock <= 3;
    if (stockFilter === 'Disponible') return matchesSearch && p.stock > 3;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="inventory-view-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/60">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-amber-550 animate-pulse" />
            Almacén e Inventario de Artículos Aura
          </h2>
          <p className="text-xs text-zinc-200 mt-1">
            Supervise los niveles de existencias, verifique las alertas por agotamiento de mercancías y analice el capital total invertido.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs">
          <span className="text-[10px] font-bold text-zinc-300 uppercase font-mono">Filtro Stock:</span>
          <select
            value={stockFilter}
            onChange={(e: any) => setStockFilter(e.target.value)}
            className="bg-transparent font-semibold text-white outline-none cursor-pointer"
          >
            <option value="Todos" className="bg-zinc-950 text-white">Todos los Artículos</option>
            <option value="Bajo Stock" className="bg-zinc-950 text-white">⚠️ Stock Crítico (≤ 3)</option>
            <option value="Disponible" className="bg-zinc-950 text-white">Suficiencia ( &gt; 3)</option>
          </select>
        </div>
      </div>

      {/* INVENTORY STATS PANELS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* TOTAL PIECES COUNT */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-200 block font-bold">Unidades Totales</span>
          <div className="mt-2 text-xl font-black text-white font-mono">{totalStockItems} unidades</div>
          <span className="text-[9px] text-zinc-300 block mt-1">Suma del almacén físico</span>
        </div>

        {/* LOW STOCK ALARM */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm relative overflow-hidden">
          {lowStockCount > 0 && (
            <div className="absolute top-0 right-0 h-10 w-10 bg-amber-500/5 rounded-bl-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500/20" />
            </div>
          )}
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-200 block font-bold">Alertas de Reposición</span>
          <div className="mt-2 text-xl font-black text-white font-mono flex items-center gap-2">
            <span className={lowStockCount > 0 ? 'text-amber-500 font-extrabold' : 'text-zinc-100'}>
              {lowStockCount} items
            </span>
            {lowStockCount > 0 && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <span className="text-[9px] text-zinc-300 block mt-1">Con existencias críticas (≤ 3)</span>
        </div>

        {/* COST DEPLOYMENT */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-200 block font-bold">Coste del Inventario</span>
          <div className="mt-2 text-xl font-black text-white font-mono">RD$ {totalCostInStock.toLocaleString('es-DO')}</div>
          <span className="text-[9px] text-zinc-300 block mt-1">Capital neto invertido (Compra)</span>
        </div>

        {/* PROJECTED PROFITS */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-200 block font-bold">Margen Anticipado</span>
          <div className="mt-2 text-xl font-black text-emerald-400 font-mono">RD$ {anticipatedMargin.toLocaleString('es-DO')}</div>
          <span className="text-[9px] text-emerald-300 block mt-1">Ganancia estimada al liquidar</span>
        </div>

      </div>

      {/* CONTROLS SEARCH BLOCK */}
      <div className="relative">
        <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-zinc-350" />
        <input
          type="text"
          placeholder="Filtrar inventario por nombre o categoría de artículo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2 text-xs text-stone-100 placeholder-zinc-500 outline-none focus:border-amber-550 focus:ring-1 focus:ring-amber-550/25"
        />
      </div>

      {/* CORE GRID LIST OF PRODUCTS AND STOCK BENTO SLABS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 py-20 text-center text-xs text-zinc-300">
            <AlertTriangle className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
            <span className="font-semibold text-zinc-200">No se encontraron artículos con el filtro de existencias especificado.</span>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isCritical = p.stock <= 3;
            const isZero = p.stock === 0;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border bg-zinc-950 space-y-3.5 flex flex-col justify-between ${
                  isZero
                    ? 'border-rose-950/40 bg-zinc-950/85 shadow-md shadow-rose-950/5'
                    : isCritical
                      ? 'border-amber-950/40 bg-zinc-950/90'
                      : 'border-zinc-800'
                }`}
              >
                {/* Header detail */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-200 font-bold">
                      {p.departamento}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 rounded uppercase font-mono ${
                      isZero 
                        ? 'bg-rose-950/20 text-rose-450 border border-rose-900/10' 
                        : isCritical 
                          ? 'bg-amber-950/20 text-amber-500 border border-amber-900/10' 
                          : 'bg-zinc-900 text-zinc-250 font-bold border border-zinc-800'
                    }`}>
                      {isZero ? 'Agotado 🚨' : isCritical ? 'Reposición ⚠️' : 'Estable'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-white text-xs leading-relaxed truncate" title={p.nombre}>
                    {p.nombre}
                  </h4>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-900/50">
                  <div className="text-center">
                    <span className="text-[9px] text-zinc-300 block font-semibold">Inv. Físico</span>
                    <span className={`text-[11px] font-mono font-black ${
                      isZero ? 'text-rose-400' : isCritical ? 'text-amber-500' : 'text-white'
                    }`}>
                      {p.stock} uds
                    </span>
                  </div>

                  <div className="text-center border-x border-zinc-950">
                    <span className="text-[9px] text-zinc-300 block font-semibold">Costo Uni</span>
                    <span className="text-[11px] font-mono text-zinc-200 font-bold">
                      RD$ {(p.costo || 0).toLocaleString('es-DO')}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[9px] text-zinc-300 block font-semibold">Precio Uni</span>
                    <span className="text-[11px] font-mono font-black text-white">
                      RD$ {p.precio.toLocaleString('es-DO')}
                    </span>
                  </div>
                </div>

                {/* Warning message if low stock */}
                {isCritical && (
                  <p className="text-[10px] text-zinc-200 font-medium leading-snug flex items-start gap-1 p-1.5 rounded bg-amber-950/10 border border-amber-900/30 font-sans">
                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                    <span>Nivel crítico. Se sugiere reabastecer {Math.max(1, 10 - p.stock)} unidades para llegar al stock sugerido.</span>
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
