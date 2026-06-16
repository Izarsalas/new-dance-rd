/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alumno, Pago, Ingreso } from '../types';
import { 
  DollarSign, 
  Search, 
  PlusCircle, 
  Calendar, 
  TrendingUp, 
  Filter, 
  X, 
  ArrowUpRight, 
  AlertCircle,
  Tag,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface IncomeModuleProps {
  ingresos: Ingreso[];
  pagos: Pago[];
  alumnos: Alumno[];
  onAddIncome: (ingreso: Omit<Ingreso, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
}

export default function IncomeModule({
  ingresos,
  pagos,
  alumnos,
  onAddIncome,
  onDeleteIncome
}: IncomeModuleProps) {
  const { showAlert } = useAlertConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterMethod, setFilterMethod] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Income form states
  const [newConcepto, setNewConcepto] = useState('');
  const [newMonto, setNewMonto] = useState(1500);
  const [newFecha, setNewFecha] = useState(new Date().toISOString().substring(0, 10));
  const [newMetodo, setNewMetodo] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [newCategoria, setNewCategoria] = useState<'Inscripciones' | 'Mensualidades' | 'Clases Privadas' | 'Eventos' | 'Ventas' | 'Otros'>('Ventas');
  const [newObservacion, setNewObservacion] = useState('');

  // 1. Convert client pagos that are successfully paid into virtual income list
  const virtualStudentIncomes: Omit<Ingreso, 'id'>[] = pagos
    .filter(p => p.estado === 'Pagado')
    .map(p => {
      const student = alumnos.find(a => a.id === p.alumnoId);
      const studentName = student ? student.nombre : 'Alumno Desconocido';
      const isReg = p.mes.toLowerCase().includes('inscripci') || p.mes.toLowerCase().includes('matricula');
      
      return {
        concepto: `${isReg ? 'Inscripción' : 'Mensualidad'} - ${studentName} (${p.mes})`,
        monto: p.monto,
        fecha: p.fechaPago || p.mes || new Date().toISOString().substring(0, 10),
        metodoPago: p.metodoPago || 'Efectivo',
        categoria: (isReg ? 'Inscripciones' : 'Mensualidades') as 'Inscripciones' | 'Mensualidades',
        observaciones: `Registro automatizado desde el módulo de cobros. Alumno ID: ${p.alumnoId}`,
        isStudentPayment: true,
        originalPagoId: p.id
      } as any; // Cast so we can track it
    });

  // 2. Concat user-inserted manual incomes
  const manualIncomesFormatted: any[] = ingresos.map(inc => ({
    ...inc,
    isStudentPayment: false
  }));

  const allIncomes = [...virtualStudentIncomes, ...manualIncomesFormatted];

  // Submit new custom income
  const handleCreateIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcepto.trim()) {
      showAlert('Por favor escriba una descripción o concepto.', 'Falta Concepto');
      return;
    }

    onAddIncome({
      concepto: newConcepto.trim(),
      monto: Number(newMonto) || 0,
      fecha: newFecha,
      metodoPago: newMetodo,
      categoria: newCategoria,
      observaciones: newObservacion.trim() || undefined
    });

    // Reset Form
    setNewConcepto('');
    setNewMonto(1500);
    setNewFecha(new Date().toISOString().substring(0, 10));
    setNewMetodo('Efectivo');
    setNewCategoria('Ventas');
    setNewObservacion('');
    setShowAddModal(false);
  };

  // Filter combined incomes
  const filteredIncomes = allIncomes.filter(item => {
    const matchesSearch = item.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.observaciones && item.observaciones.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    const matchesMethod = filterMethod === 'Todos' || item.metodoPago === filterMethod;

    return matchesSearch && matchesCategory && matchesMethod;
  });

  // Analytics sums
  const totalRecibido = filteredIncomes.reduce((sum, item) => sum + item.monto, 0);
  const totalMensualidades = filteredIncomes
    .filter(item => item.categoria === 'Mensualidades')
    .reduce((sum, item) => sum + item.monto, 0);
  
  const totalInscripciones = filteredIncomes
    .filter(item => item.categoria === 'Inscripciones')
    .reduce((sum, item) => sum + item.monto, 0);

  const totalOtrosIncomes = filteredIncomes
    .filter(item => !['Mensualidades', 'Inscripciones'].includes(item.categoria))
    .reduce((sum, item) => sum + item.monto, 0);

  return (
    <div className="space-y-6 animate-fade-in" id="income-module-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold border border-emerald-500/25 px-2 py-0.5 rounded bg-emerald-950/20">
              Finanzas
            </span>
          </div>
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl tracking-tight mt-1">
            INGRESOS DE CAJA <span className="text-emerald-500">NEW DANCE SYSTEM</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visualice los pagos de mensualidades de estudiantes y registre otras vías de ingreso en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-605/10 hover:bg-emerald-500 hover:shadow-emerald-500/20 transition-all cursor-pointer"
          id="btn-add-income"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Registrar Otro Ingreso</span>
        </button>
      </div>

      {/* CARDS / FINANCIAL GENERALS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* TOTAL COLLECTED CARD */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-500/30" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Total Ingresado (Filtrado)</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">RD$ {totalRecibido.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Suma de todas las transacciones debajo</span>
        </div>

        {/* MONTHLY DIRECT INCOMES */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Mensualidades Cobradas</span>
          <div className="mt-2">
            <span className="text-xl font-black text-stone-200 font-mono">RD$ {totalMensualidades.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-emerald-500 block mt-1">Cobros de estudiantes activos</span>
        </div>

        {/* INSCRIPTION CARD */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Inscripciones Iniciales</span>
          <div className="mt-2">
            <span className="text-xl font-black text-stone-200 font-mono">RD$ {totalInscripciones.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-emerald-500 block mt-1">Admisiones y matrículas</span>
        </div>

        {/* COMBINED OTHER CARD */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Ventas, Eventos y Clases Privadas</span>
          <div className="mt-2">
            <span className="text-xl font-black text-stone-200 font-mono">RD$ {totalOtrosIncomes.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-amber-500 block mt-1">Líneas de ingreso extraordinarias</span>
        </div>

      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* SEARCH BAR */}
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Buscar concepto o alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-900 bg-zinc-950 pl-10 pr-4 py-2 text-xs text-stone-200 outline-none focus:border-emerald-550"
            />
          </div>

          {/* QUICK FLUID FILTERS */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs">
              <Filter className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-zinc-400">Categoría:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent font-semibold text-white outline-none cursor-pointer"
              >
                <option value="Todos" className="bg-zinc-950 text-white">Todas</option>
                <option value="Mensualidades" className="bg-zinc-950 text-white">Mensualidades</option>
                <option value="Inscripciones" className="bg-zinc-950 text-white">Inscripciones</option>
                <option value="Clases Privadas" className="bg-zinc-950 text-white">Clases Privadas</option>
                <option value="Eventos" className="bg-zinc-950 text-white">Eventos</option>
                <option value="Ventas" className="bg-zinc-950 text-white">Ventas / Tienda</option>
                <option value="Otros" className="bg-zinc-950 text-white">Otros</option>
              </select>
            </div>

            {/* Method Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs">
              <CreditCard className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-zinc-400">Método:</span>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="bg-transparent font-semibold text-white outline-none cursor-pointer"
              >
                <option value="Todos" className="bg-zinc-950 text-white">Todos</option>
                <option value="Efectivo" className="bg-zinc-950 text-white">Efectivo</option>
                <option value="Transferencia" className="bg-zinc-950 text-white">Transferencia</option>
                <option value="Tarjeta" className="bg-zinc-950 text-white">Tarjeta</option>
              </select>
            </div>

            {/* Clean filter btn */}
            {(searchTerm || filterCategory !== 'Todos' || filterMethod !== 'Todos') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('Todos');
                  setFilterMethod('Todos');
                }}
                className="rounded-lg bg-zinc-900 hover:bg-zinc-805 px-2.5 py-1.5 text-[10px] font-bold text-white flex items-center gap-1 transition-all"
              >
                <X className="h-3 w-3" />
                <span>Limpiar Filtros</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* MAIN LIST TABLE */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/20 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3.5 px-4 font-mono">Concepto / Descripción</th>
                <th className="py-3.5 px-4 font-mono">Categoría</th>
                <th className="py-3.5 px-4 font-mono text-center">Método</th>
                <th className="py-3.5 px-4 font-mono">Fecha Recibido</th>
                <th className="py-3.5 px-4 font-mono text-right">Monto (RD$)</th>
                <th className="py-3.5 px-4 font-mono text-center">Procedencia</th>
                <th className="py-3.5 px-4 font-mono text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-zinc-800" />
                      <span className="text-xs text-zinc-500">No se encontraron registros de ingresos con los filtros elegidos.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/10 transition-colors">
                    {/* Concept */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-white block text-xs">{item.concepto}</span>
                        {item.observaciones && (
                          <span className="text-[10px] text-zinc-500 block max-w-xs truncate italic" title={item.observaciones}>
                            {item.observaciones}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-xs">
                      <span className={`inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 font-semibold text-[10px] ${
                        item.categoria === 'Mensualidades' ? 'text-emerald-400 border-emerald-500/10' :
                        item.categoria === 'Inscripciones' ? 'text-cyan-400 border-cyan-500/10' :
                        item.categoria === 'Clases Privadas' ? 'text-indigo-400 border-indigo-500/10' :
                        item.categoria === 'Eventos' ? 'text-purple-400 border-purple-500/10' :
                        item.categoria === 'Ventas' ? 'text-amber-500 border-amber-500/10' : 'text-zinc-400'
                      }`}>
                        <Tag className="h-2.5 w-2.5" />
                        {item.categoria}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-[11px] font-mono text-stone-300">
                        {item.metodoPago}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs font-mono text-zinc-400">
                      {item.fecha}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-mono font-black text-right text-emerald-400 text-xs">
                      RD$ {item.monto.toLocaleString('es-DO')}
                    </td>

                    {/* Source flag indicating automated from enrollment or extra custom entry */}
                    <td className="py-4 px-4 text-center">
                      {item.isStudentPayment ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[9px] font-bold text-emerald-300 px-2.5 py-0.5">
                          Inscripciones/Pagos
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-800 text-[9px] font-semibold text-zinc-400 px-2.5 py-0.5">
                          Manual Administrativo
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      {item.isStudentPayment ? (
                        <span className="text-[10px] text-zinc-610 italic block" title="Este ingreso se generó automáticamente recolectando una mensualidad. Edítela desde Cobros.">
                          Bloqueado
                        </span>
                      ) : (
                        <button
                          onClick={() => onDeleteIncome(item.id)}
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-400 transition-colors"
                          title="Eliminar registro"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD INCOME */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 shrink-0">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-500" />
                Registrar Otro Ingreso Extendido
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-450 hover:bg-zinc-900 hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncomeSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Concepto o Descripción Corta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Matrícula Especial / Venta de Uniformes"
                  value={newConcepto}
                  onChange={(e) => setNewConcepto(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Monto (RD$)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMonto}
                    onChange={(e) => setNewMonto(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Fecha Recibido</label>
                  <input
                    type="date"
                    required
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Categoría</label>
                  <select
                    value={newCategoria}
                    onChange={(e: any) => setNewCategoria(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-[#130f06] p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="Ventas" className="bg-zinc-950 text-white">Ventas / Tienda</option>
                    <option value="Clases Privadas" className="bg-zinc-950 text-white">Clases Privadas</option>
                    <option value="Eventos" className="bg-zinc-950 text-white">Eventos especiales</option>
                    <option value="Otros" className="bg-zinc-950 text-white">Otros / Varios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Método de Pago</label>
                  <select
                    value={newMetodo}
                    onChange={(e: any) => setNewMetodo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-[#130f06] p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="Efectivo" className="bg-zinc-950 text-white">Efectivo</option>
                    <option value="Transferencia" className="bg-zinc-950 text-white">Transferencia</option>
                    <option value="Tarjeta" className="bg-zinc-950 text-white">Tarjeta de Crédito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Observaciones (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre quién entregó el dinero o conceptos particulares..."
                  value={newObservacion}
                  onChange={(e) => setNewObservacion(e.target.value)}
                  className="w-full rounded-xl border border-zinc-855 bg-zinc-900/60 p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-500/50 resize-none font-sans"
                />
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-zinc-850 px-4 py-2.5 text-zinc-300 hover:bg-zinc-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white transition-all cursor-pointer"
                >
                  Registrar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
