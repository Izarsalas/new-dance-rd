/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sale, Product } from '../types';
import { 
  FileText, 
  ShoppingCart, 
  Trash2, 
  AlertCircle,
  ArrowRightLeft,
  Calendar
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface QuotesViewProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  products: Product[];
  setActiveSubTab: (tab: "ventas" | "cotizaciones" | "inventario" | "productos" | "clientes" | "ventas_dia") => void;
  setCart: React.Dispatch<React.SetStateAction<(Product & { quantity: number })[]>>;
  setSelectedClientId: React.Dispatch<React.SetStateAction<string>>;
}

export default function QuotesView({
  sales,
  setSales,
  products,
  setActiveSubTab,
  setCart,
  setSelectedClientId
}: QuotesViewProps) {
  const { showAlert, showConfirm } = useAlertConfirm();

  // Extract Quotes
  const quotes = sales.filter(s => s.estado === 'Cotización');

  // Load quote to shopping cart
  const handleLoadQuoteIntoCart = async (quote: Sale) => {
    const confirmed = await showConfirm(
      `¿Desea cargar los productos de la cotización "${quote.codigo}" en el carrito activo de ventas?\n\nEsto reemplazará cualquier artículo que tenga actualmente en el carrito.`,
      'Cargar en Carrito'
    );
    if (!confirmed) return;

    // Build cart items by matching with active catalog products
    const cartItems: (Product & { quantity: number })[] = [];
    const missingArticles: string[] = [];

    quote.items.forEach(item => {
      const liveProduct = products.find(p => p.id === item.productId);
      if (liveProduct) {
        // Enforce active stock check
        const currentStock = liveProduct.stock;
        const desiredQuantity = Math.min(item.cantidad, currentStock);

        if (desiredQuantity > 0) {
          cartItems.push({
            ...liveProduct,
            quantity: desiredQuantity
          });
        }

        if (item.cantidad > currentStock) {
          missingArticles.push(`${liveProduct.nombre} (Solicitado: ${item.cantidad}, Disponible: ${currentStock})`);
        }
      } else {
        missingArticles.push(`${item.productoNombre} (Descontinuado o Eliminado)`);
      }
    });

    if (cartItems.length === 0) {
      showAlert('No se pudo cargar ningún artículo en el carrito porque los productos no están disponibles o no tienen unidades en stock.', 'Artículos no Disponibles');
      return;
    }

    // Set Cart items
    setCart(cartItems);
    
    // Set associated Client
    setSelectedClientId(quote.clienteId);

    // Redirect to Sales view
    setActiveSubTab('ventas');

    if (missingArticles.length > 0) {
      showAlert(
        'La cotización se ha cargado en el carrito de caja. Sin embargo, algunos artículos se ajustaron o no se agregaron por falta de stock:\n\n- ' + missingArticles.join('\n- '),
        'Ajuste de Unidades Realizado'
      );
    } else {
      showAlert(`La cotización "${quote.codigo}" se cargó con éxito en el carrito. Pase a cobrar desde el módulo de Ventas.`, 'Completado');
    }
  };

  // Delete/Discard Quote
  const handleDeleteQuote = async (id: string, code: string) => {
    const confirmed = await showConfirm(
      `¿Está seguro de que desea descartar e inactivar la cotización "${code}" de manera definitiva?`,
      'Eliminar Cotización'
    );
    if (confirmed) {
      const nextSales = sales.filter(s => s.id !== id);
      setSales(nextSales);
      localStorage.setItem('aura_billing_sales', JSON.stringify(nextSales));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="quotes-view-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/60">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-450" />
            Presupuestos y Cotizaciones Registradas
          </h2>
          <p className="text-xs text-zinc-450 mt-1">
            Consulte las cotizaciones estimadas entregadas a dancistas y conviértalas de forma instantánea en ventas reales con un solo clic.
          </p>
        </div>

        <button
          onClick={() => setActiveSubTab('ventas')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500 hover:text-white px-4 py-2.5 text-xs font-bold text-zinc-400 transition-all cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Generar Nueva Cotización</span>
        </button>
      </div>

      {/* CORE LIST */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/20 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3.5 px-4 font-mono">Solicitud No.</th>
                <th className="py-3.5 px-4 font-mono">Fecha Emitido</th>
                <th className="py-3.5 px-4 font-mono">Nombre del Cliente</th>
                <th className="py-3.5 px-4 font-mono">Productos Cotizados</th>
                <th className="py-3.5 px-4 font-mono text-right">Presupuesto (RD$)</th>
                <th className="py-3.5 px-4 font-mono text-center">Acciones y Procesamiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-zinc-805" />
                      <span className="text-xs text-zinc-550">No hay cotizaciones activas registradas en la escuela.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-900/10 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono text-xs font-black text-cyan-400">
                      {q.codigo}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs font-mono text-zinc-450">
                      {q.fecha}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="text-white text-xs font-semibold block">{q.clienteNombre || 'Cliente General'}</span>
                    </td>

                    {/* Items lines description */}
                    <td className="py-3.5 px-4 text-xs text-zinc-400 max-w-sm truncate">
                      {q.items.map(it => `${it.productoNombre} (x${it.cantidad})`).join(', ')}
                    </td>

                    {/* Budget Total */}
                    <td className="py-3.5 px-4 font-mono font-black text-right text-cyan-400 text-xs">
                      RD$ {q.total.toLocaleString('es-DO')}
                    </td>

                    {/* Conversion logic */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleLoadQuoteIntoCart(q)}
                          className="text-zinc-300 hover:text-cyan-400 font-bold flex items-center gap-1.5 text-[11px] cursor-pointer bg-cyan-950/20 border border-cyan-900/30 hover:border-cyan-500/50 rounded-lg px-2.5 py-1.5 transition-all"
                          title="Cargar esta cotización en el carrito de caja rápida"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5 stroke-[2.5px]" />
                          <span>Cargar a Caja</span>
                        </button>

                        <button
                          onClick={() => handleDeleteQuote(q.id, q.codigo)}
                          className="text-zinc-600 hover:text-rose-500 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Descartar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
