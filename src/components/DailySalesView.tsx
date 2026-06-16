/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sale, Product, TicketSettings } from '../types';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  FileText, 
  CreditCard, 
  Coins, 
  Trash2, 
  Printer, 
  AlertCircle,
  TrendingUp,
  Package,
  CalendarDays,
  X
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface DailySalesViewProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  settings: TicketSettings;
  // Options to trigger the Aura direct income list
  onDeleteIncomeByConcept?: (concept: string) => void;
}

export default function DailySalesView({
  sales,
  setSales,
  products,
  setProducts,
  settings,
  onDeleteIncomeByConcept
}: DailySalesViewProps) {
  const { showAlert, showConfirm } = useAlertConfirm();
  
  // Format current date YYYY-MM-DD
  const todayStr = new Date().toISOString().substring(0, 10);
  const [filterDate, setFilterDate] = useState<string>(todayStr);
  const [showAllDates, setShowAllDates] = useState(false);

  // Modal receipt states
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Completed sales
  const completedSales = sales.filter(s => s.estado === 'Completado');

  // Filter sales
  const filteredSales = completedSales.filter(s => {
    if (showAllDates) return true;
    return s.fecha === filterDate;
  });

  // Analytics
  const totalBilled = filteredSales.reduce((sum, s) => sum + s.total, 0);
  
  const cashTotal = filteredSales
    .filter(s => s.metodoPago === 'Efectivo')
    .reduce((sum, s) => sum + s.total, 0);

  const transferTotal = filteredSales
    .filter(s => s.metodoPago === 'Transferencia')
    .reduce((sum, s) => sum + s.total, 0);

  const cardTotal = filteredSales
    .filter(s => s.metodoPago === 'Tarjeta')
    .reduce((sum, s) => sum + s.total, 0);

  const totalItemsSold = filteredSales.reduce((total, s) => {
    return total + s.items.reduce((itemTotal, item) => itemTotal + item.cantidad, 0);
  }, 0);

  // Cancel / Delete Sale
  const handleCancelSale = async (sale: Sale) => {
    const confirmed = await showConfirm(
      `¿Está absolutamente seguro de que desea anular la factura "${sale.codigo}" por un monto de RD$ ${sale.total.toLocaleString('es-DO')}?\n\n` + 
      'Esto restablecerá de manera automática el inventario y stock de los artículos vendidos.',
      'Anular Factura / Venta'
    );
    if (!confirmed) return;

    // 1. Restore product stock
    const updatedProducts = products.map(p => {
      const soldItem = sale.items.find(item => item.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          stock: p.stock + soldItem.cantidad
        };
      }
      return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('aura_billing_products', JSON.stringify(updatedProducts));

    // 2. Remove from ledger if linked
    if (onDeleteIncomeByConcept) {
      onDeleteIncomeByConcept(`Facturación General POS (${sale.codigo})`);
    }

    // 3. Remove sale from local state
    const nextSales = sales.filter(s => s.id !== sale.id);
    setSales(nextSales);
    localStorage.setItem('aura_billing_sales', JSON.stringify(nextSales));

    showAlert(`La factura "${sale.codigo}" ha sido anulada con éxito y el stock de artículos ha sido reembolsado.`, 'Venta Anulada');
  };

  const printTicket = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="daily-sales-root">
      
      {/* HEADER CONTROLLER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/60">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            Control Diario de Caja y Ventas
          </h2>
          <p className="text-xs text-zinc-450 mt-1">
            Supervise los cortes financieros del día, visualice los métodos de pago (Efectivo/Transferencias/Tarjeta) y audite facturas emitidas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day selection */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Día:</span>
            <input
              type="date"
              disabled={showAllDates}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent font-bold text-stone-150 outline-none cursor-pointer text-xs focus:text-white font-mono disabled:opacity-40"
            />
          </div>

          <button
            onClick={() => setShowAllDates(!showAllDates)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              showAllDates
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {showAllDates ? 'Ver Solo Día Seleccionado' : 'Ver Historial de Fechas'}
          </button>
        </div>
      </div>

      {/* CORE FINANCIAL ANALYTICS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        
        {/* TOTAL CASH OUTFLOW SUMMARY */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-905 bg-zinc-950 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-500/20 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Total Facturado</span>
            <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
              RD$ {totalBilled.toLocaleString('es-DO')}
            </div>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-2">
            {showAllDates ? 'Acumulado histórico total' : `Ingresos netos del día: ${filterDate}`}
          </span>
        </div>

        {/* CASH PORTION */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-450 text-[10px] uppercase font-mono font-bold">
              <Coins className="h-3 w-3 text-amber-500 animate-pulse" />
              <span>Caja / Efectivo</span>
            </div>
            <div className="mt-2 text-base font-black text-white font-mono">
              RD$ {cashTotal.toLocaleString('es-DO')}
            </div>
          </div>
          <span className="text-[9px] text-zinc-650 block mt-1.5">Fondo físico recibido</span>
        </div>

        {/* TRANSFERS */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-450 text-[10px] uppercase font-mono font-bold">
              <FileText className="h-3 w-3 text-cyan-400" />
              <span>Transferencias</span>
            </div>
            <div className="mt-2 text-base font-black text-white font-mono">
              RD$ {transferTotal.toLocaleString('es-DO')}
            </div>
          </div>
          <span className="text-[9px] text-zinc-650 block mt-1.5">Conciliaciones de Banco</span>
        </div>

        {/* CREDIT CARDS */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-455 text-[10px] uppercase font-mono font-bold">
              <CreditCard className="h-3 w-3 text-indigo-400" />
              <span>Tarjetas</span>
            </div>
            <div className="mt-2 text-base font-black text-white font-mono">
              RD$ {cardTotal.toLocaleString('es-DO')}
            </div>
          </div>
          <span className="text-[9px] text-zinc-650 block mt-1.5">Vouchers procesados</span>
        </div>

      </div>

      {/* COMPLETED SALES LOG REGISTER */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/20 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3.5 px-4 font-mono">Código Factura</th>
                <th className="py-3.5 px-4 font-mono">Fecha Registro</th>
                <th className="py-3.5 px-4 font-mono">Cliente / Dancista</th>
                <th className="py-3.5 px-4 font-mono">Detalle de Artículos Dispatched</th>
                <th className="py-3.5 px-4 font-mono text-center">Método de Pago</th>
                <th className="py-3.5 px-4 font-mono text-right">Total Facturado (RD$)</th>
                <th className="py-3.5 px-4 font-mono text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-zinc-805" />
                      <span className="text-xs text-zinc-500">
                        {showAllDates 
                          ? 'No hay registros de ventas contabilizadas.' 
                          : `No se han registrado facturas en el día ${filterDate}.`}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-900/10 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono text-xs font-black text-emerald-500">
                      {sale.codigo}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs font-mono text-zinc-450">
                      {sale.fecha}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="text-white text-xs font-semibold block">{sale.clienteNombre || 'Consumidor Final'}</span>
                    </td>

                    {/* Articles list */}
                    <td className="py-3.5 px-4 text-xs text-zinc-400 max-w-sm truncate">
                      {sale.items.map(it => `${it.productoNombre} (x${it.cantidad})`).join(', ')}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-zinc-350">
                      <span className="bg-zinc-900 border border-zinc-850 text-white px-2.5 py-0.5 rounded font-bold">
                        {sale.metodoPago}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-mono font-black text-right text-white text-xs">
                      RD$ {sale.total.toLocaleString('es-DO')}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => { setSelectedSale(sale); setShowInvoiceModal(true); }}
                          className="text-zinc-450 hover:text-white font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Volver a ver o imprimir factura"
                        >
                          <Printer className="h-3 w-3 text-gold-550" />
                          <span>Re-imprimir</span>
                        </button>

                        <button
                          onClick={() => handleCancelSale(sale)}
                          className="text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Eliminar esta factura permanentemente y reembolsar inventario"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Anular</span>
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

      {/* SINGLE BILL REPRINT TICKET MODAL */}
      {showInvoiceModal && selectedSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col items-center">
            
            {/* TICKET WRAPPER (STANDARDIZED THERMAL TYPE LAYOUT FOR BROWSER PRINT) */}
            <div className="w-full bg-white text-zinc-950 p-5 rounded-lg font-mono text-xs shadow-inner space-y-4 printable-section overflow-y-auto flex-1">
              
              {/* BRAND HEADER */}
              <div className="text-center space-y-1">
                <h4 className="font-sans font-black text-sm uppercase tracking-tight">{settings.nombreAcademia || 'NEW DANCE SYSTEM'}</h4>
                {settings.rnc && <p className="text-[10px] text-zinc-650">RNC: {settings.rnc}</p>}
                {settings.direccion && <p className="text-[10px] text-zinc-600 leading-tight">{settings.direccion}</p>}
                {settings.telefono && <p className="text-[10px] text-zinc-650">Tel: {settings.telefono}</p>}
                <div className="border-b border-dashed border-zinc-400 w-full pt-1" />
              </div>

              {/* TICKET METADATA */}
              <div className="space-y-1 text-[10px] text-zinc-700">
                <div className="flex justify-between">
                  <span>DOCUMENTO:</span>
                  <span className="font-bold">{selectedSale.codigo} (DUPLICADO)</span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA EMISIÓN:</span>
                  <span>{selectedSale.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="max-w-[150px] truncate font-bold uppercase">{selectedSale.clienteNombre || 'Consumidor Final'}</span>
                </div>
                <div className="border-b border-dashed border-zinc-400 w-full pt-1" />
              </div>

              {/* PRODUCTS COLUMNS */}
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-zinc-650 grid grid-cols-12">
                  <span className="col-span-6 text-left">ARTÍCULO</span>
                  <span className="col-span-2 text-center">CANT.</span>
                  <span className="col-span-4 text-right">TOTAL (RD$)</span>
                </div>
                <div className="border-b border-zinc-200" />
                
                <div className="space-y-1.5">
                  {selectedSale.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-[10px]">
                      <span className="col-span-6 text-left block truncate uppercase">{it.productoNombre}</span>
                      <span className="col-span-2 text-center text-zinc-600 block">{it.cantidad}</span>
                      <span className="col-span-4 text-right font-bold block">{(it.precio * it.cantidad).toLocaleString('es-DO')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-b border-dashed border-zinc-400 w-full pt-1" />
              </div>

              {/* MATHEMATICAL BALANCE */}
              <div className="text-[11px] space-y-1 pl-12 text-zinc-900">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>RD$ {selectedSale.subtotal.toLocaleString('es-DO')}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>ITBIS (18%):</span>
                  <span>RD$ {selectedSale.itbis.toLocaleString('es-DO')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-zinc-350 pt-1 text-sm text-zinc-950">
                  <span>TOTAL NETO:</span>
                  <span>RD$ {selectedSale.total.toLocaleString('es-DO')}</span>
                </div>

                <div className="space-y-1 border-t border-dashed border-zinc-300 pt-1 text-[10px] text-zinc-600">
                  <div className="flex justify-between">
                    <span>MÉTODO PAGO:</span>
                    <span>{selectedSale.metodoPago}</span>
                  </div>
                  {selectedSale.pagadoCon !== undefined && (
                    <div className="flex justify-between">
                      <span>MONTO RECIBIDO:</span>
                      <span>RD$ {selectedSale.pagadoCon.toLocaleString('es-DO')}</span>
                    </div>
                  )}
                  {selectedSale.cambio !== undefined && (
                    <div className="flex justify-between font-bold text-zinc-900">
                      <span>EL CAMBIO:</span>
                      <span>RD$ {selectedSale.cambio.toLocaleString('es-DO')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM SLOGAN */}
              <div className="text-center pt-2 space-y-1.5">
                <div className="border-b border-dashed border-zinc-400 w-full" />
                <p className="text-[9px] text-zinc-600 leading-tight uppercase">
                  {settings.mensajeLargo || '¡Gracias por apoyar el arte y la danza en NEW DANCE SYSTEM!'}
                </p>
                <p className="text-[8px] text-zinc-400 font-sans tracking-widest mt-1">DUPLICADO AUTORIZADO DE CAJA</p>
              </div>

            </div>

            {/* BUTTON CONTROLS */}
            <div className="w-full mt-5 shrink-0 flex items-center justify-between gap-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setShowInvoiceModal(false); setSelectedSale(null); }}
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-350 px-4 py-2.5 text-center hover:bg-zinc-850"
              >
                Cerrar Ventana
              </button>

              <button
                type="button"
                onClick={printTicket}
                className="flex-1 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4 stroke-[3px]" />
                <span>Imprimir Copia</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
