/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Empleado, Egreso } from '../types';
import { 
  DollarSign, 
  Search, 
  PlusCircle, 
  Calendar, 
  TrendingDown, 
  Filter, 
  X, 
  ArrowDownRight, 
  AlertCircle,
  Tag,
  CreditCard,
  User,
  Activity
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface ExpenseModuleProps {
  egresos: Egreso[];
  empleados: Empleado[];
  onAddExpense: (egreso: Omit<Egreso, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpenseModule({
  egresos,
  empleados,
  onAddExpense,
  onDeleteExpense
}: ExpenseModuleProps) {
  const { showAlert } = useAlertConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterMethod, setFilterMethod] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Expense form states
  const [newConcepto, setNewConcepto] = useState('');
  const [newMonto, setNewMonto] = useState(2500);
  const [newFecha, setNewFecha] = useState(new Date().toISOString().substring(0, 10));
  const [newMetodo, setNewMetodo] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [newCategoria, setNewCategoria] = useState<'Alquiler' | 'Nómina' | 'Servicios' | 'Mantenimiento' | 'Publicidad' | 'Insumos' | 'Otros'>('Servicios');
  const [newObservacion, setNewObservacion] = useState('');

  // Submit new custom expense
  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcepto.trim()) {
      showAlert('Por favor escriba una descripción o concepto.', 'Falta Concepto');
      return;
    }

    onAddExpense({
      concepto: newConcepto.trim(),
      monto: Number(newMonto) || 0,
      fecha: newFecha,
      metodoPago: newMetodo,
      categoria: newCategoria,
      observaciones: newObservacion.trim() || undefined
    });

    // Reset Form
    setNewConcepto('');
    setNewMonto(2500);
    setNewFecha(new Date().toISOString().substring(0, 10));
    setNewMetodo('Efectivo');
    setNewCategoria('Servicios');
    setNewObservacion('');
    setShowAddModal(false);
  };

  // Quick Payroll autofill trigger helper
  const handleAutofillPayroll = (emp: Empleado) => {
    let montoEstimado = emp.salario || 0;
    let descripcionConcepto = `Pago de Nómina - ${emp.nombre} (${emp.puesto})`;
    let obs = `Empleado ID: ${emp.id}. `;

    if (emp.tipoPago === 'Por Alumno' || (!emp.tipoPago && emp.pagoPorAlumno && !emp.salario)) {
      descripcionConcepto = `Honorarios por Alumnos - ${emp.nombre} (${emp.puesto})`;
      montoEstimado = (emp.pagoPorAlumno || 0) * 10; // Estimación sugerida
      obs += `Esquema: Por Alumno (RD$ ${emp.pagoPorAlumno || 0} / Alumno). Ajuste el monto final según la matrícula activa.`;
    } else if (emp.tipoPago === 'Mixto') {
      descripcionConcepto = `Pago Mixto (Sueldo Base + Alumnos) - ${emp.nombre}`;
      montoEstimado = (emp.salario || 0) + ((emp.pagoPorAlumno || 0) * 5);
      obs += `Esquema Mixto: Base RD$ ${emp.salario || 0} + RD$ ${emp.pagoPorAlumno || 0} por alumno.`;
    } else {
      obs += `Esquema: Sueldo Fijo Mensual.`;
    }

    setNewConcepto(descripcionConcepto);
    setNewMonto(montoEstimado || 15000);
    setNewCategoria('Nómina');
    setNewMetodo('Transferencia');
    setNewObservacion(obs);
  };

  // Filter expenses
  const filteredExpenses = egresos.filter(item => {
    const matchesSearch = item.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.observaciones && item.observaciones.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    const matchesMethod = filterMethod === 'Todos' || item.metodoPago === filterMethod;

    return matchesSearch && matchesCategory && matchesMethod;
  });

  // Financial outputs
  const totalPagado = filteredExpenses.reduce((sum, item) => sum + item.monto, 0);
  
  const totalNominas = filteredExpenses
    .filter(item => item.categoria === 'Nómina')
    .reduce((sum, item) => sum + item.monto, 0);

  const totalServicios = filteredExpenses
    .filter(item => item.categoria === 'Servicios')
    .reduce((sum, item) => sum + item.monto, 0);

  const totalAlquiler = filteredExpenses
    .filter(item => item.categoria === 'Alquiler')
    .reduce((sum, item) => sum + item.monto, 0);

  return (
    <div className="space-y-6 animate-fade-in" id="expense-module-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-rose-450 font-bold border border-rose-500/25 px-2 py-0.5 rounded bg-rose-950/20">
              Cuentas por Pagar
            </span>
          </div>
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl tracking-tight mt-1">
            EGRESOS Y GASTOS <span className="text-rose-500">NEW DANCE SYSTEM</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gestione de manera precisa el egreso de dinero para alquileres, nóminas, facturas de servicios y reparaciones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 px-4 py-2.5 text-xs font-bold text-rose-400 shadow-md hover:bg-rose-950/60 hover:border-rose-800 transition-all cursor-pointer animate-pulse"
          id="btn-add-expense"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Registrar Egreso / Gasto</span>
        </button>
      </div>

      {/* CARDS / FINANCIAL HIGH POINTS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* TOTAL DIRECT EXPENSES EXPANSION */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-bl-full flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-rose-500/30" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Total Egresado (Filtrado)</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-400 font-mono">RD$ {totalPagado.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Salidas de caja contabilizadas</span>
        </div>

        {/* PAYROLL DIRECT HIGHLIGHT */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Nóminas Pagadas</span>
          <div className="mt-2">
            <span className="text-xl font-black text-stone-200 font-mono">RD$ {totalNominas.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-rose-400 block mt-1">Sueldos de profesores y staff</span>
        </div>

        {/* MONTHLY RENT */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Renta / Alquileres</span>
          <div className="mt-2">
            <span className="text-xl font-black text-stone-200 font-mono">RD$ {totalAlquiler.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Infraestructura del salón principal</span>
        </div>

        {/* COMBINED OPERATIONAL METRICS */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-550 block font-bold">Electricidad, Agua y Luz</span>
          <div className="mt-2">
            <span className="text-xl font-black text-stone-200 font-mono">RD$ {totalServicios.toLocaleString('es-DO')}</span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Servicios públicos mensuales</span>
        </div>

      </div>

      {/* FILTER & SEARCH CONTAINER */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Buscar concepto, categoría u observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-900 bg-zinc-950 pl-10 pr-4 py-2 text-xs text-stone-200 outline-none focus:border-rose-500/50"
            />
          </div>

          {/* DYNAMIC COMBINED DROPDOWN STRIP */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs">
              <Filter className="h-3 w-3 text-rose-500" />
              <span className="text-[10px] font-semibold text-zinc-400">Categoría:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent font-semibold text-white outline-none cursor-pointer"
              >
                <option value="Todos" className="bg-zinc-950 text-white">Todas</option>
                <option value="Alquiler" className="bg-zinc-950 text-white">Alquiler del Local</option>
                <option value="Nómina" className="bg-zinc-950 text-white">Nómina / Salarios</option>
                <option value="Servicios" className="bg-zinc-950 text-white">Servicios Públicos</option>
                <option value="Mantenimiento" className="bg-zinc-950 text-white">Mantenimiento</option>
                <option value="Publicidad" className="bg-zinc-950 text-white">Publicidad y Redes</option>
                <option value="Insumos" className="bg-zinc-950 text-white">Compra de Insumos</option>
                <option value="Otros" className="bg-zinc-950 text-white">Otros Gastos</option>
              </select>
            </div>

            {/* Method Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs">
              <CreditCard className="h-3 w-3 text-rose-500" />
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

            {/* Clean action */}
            {(searchTerm || filterCategory !== 'Todos' || filterMethod !== 'Todos') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('Todos');
                  setFilterMethod('Todos');
                }}
                className="rounded-lg bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 text-[10px] font-bold text-white flex items-center gap-1 transition-all"
              >
                <X className="h-3 w-3" />
                <span>Limpiar Gastos</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* QUICK PAYROLL AUTOFILL WIDGET PANEL */}
      {empleados.length > 0 && (
        <div className="rounded-2xl border border-zinc-905/60 bg-zinc-950/30 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gold-500">
            <Activity className="h-3.5 w-3.5 text-gold-500 animate-spin" />
            <span>Asistente Rápido: Pago de Sueldos (Profesores y Personal)</span>
          </div>
          <p className="text-[11px] text-zinc-450 leading-relaxed">
            Haga clic en cualquiera de sus empleados actuales para preparar de forma instantánea el formulario de egreso con su respectivo sueldo programado:
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {empleados.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  handleAutofillPayroll(emp);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-gold-500/50 hover:bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-300 font-semibold cursor-pointer transition-all"
              >
                <User className="h-3 w-3 text-gold-500 shrink-0" />
                <span>{emp.nombre}</span>
                <span className="font-mono text-zinc-500 text-[10px]">({emp.puesto})</span>
                <span className="bg-gold-500/10 text-gold-500 rounded px-1.5 py-0.5 font-bold font-mono text-[9px]">
                  RD$ {emp.salario.toLocaleString('es-DO')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LIST TABLE CONTAINER */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/20 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3.5 px-4 font-mono">Concepto / Descripción del Egreso</th>
                <th className="py-3.5 px-4 font-mono">Tipo de Gasto</th>
                <th className="py-3.5 px-4 font-mono text-center">Forma de Pago</th>
                <th className="py-3.5 px-4 font-mono">Fecha Aplicado</th>
                <th className="py-3.5 px-4 font-mono text-right">Egresado (RD$)</th>
                <th className="py-3.5 px-4 font-mono text-center">Observaciones</th>
                <th className="py-3.5 px-4 font-mono text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-zinc-800" />
                      <span className="text-xs text-zinc-500">No se encontraron egresos o gastos registrados.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/15 transition-colors">
                    {/* Concept */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-white block text-xs">{item.concepto}</span>
                      </div>
                    </td>

                    {/* Category tag */}
                    <td className="py-4 px-4 text-xs">
                      <span className={`inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 font-semibold text-[10px] ${
                        item.categoria === 'Nómina' ? 'text-amber-500 border-amber-500/10' :
                        item.categoria === 'Alquiler' ? 'text-cyan-400 border-cyan-500/10' :
                        item.categoria === 'Servicios' ? 'text-indigo-400 border-indigo-500/10' :
                        item.categoria === 'Mantenimiento' ? 'text-orange-400 border-orange-500/10' :
                        item.categoria === 'Publicidad' ? 'text-purple-400 border-purple-500/10' : 'text-zinc-400'
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
                    <td className="py-4 px-4 font-mono font-black text-right text-rose-400 text-xs">
                      RD$ {item.monto.toLocaleString('es-DO')}
                    </td>

                    {/* Observations notes */}
                    <td className="py-4 px-4 text-xs text-zinc-500 max-w-xs truncate text-center">
                      {item.observaciones || <span className="text-zinc-700 italic">- Sin notas -</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onDeleteExpense(item.id)}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-450 hover:underline transition-all cursor-pointer"
                        title="Haga clic para eliminar este gasto permanentemente"
                      >
                        Eliminar Gasto
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTER EXPENSE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-gold-800/20 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 shrink-0">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-rose-500" />
                Registrar Caja Chica: Egreso de Fondos
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-455 hover:bg-zinc-900 hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Concepto o Destino del Dinero *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Factura de Luz de Mayo / Compra de Botellones de Agua"
                  value={newConcepto}
                  onChange={(e) => setNewConcepto(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Monto Retirado (RD$)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMonto}
                    onChange={(e) => setNewMonto(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-rose-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Fecha de Operación</label>
                  <input
                    type="date"
                    required
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-xs text-stone-100 outline-none focus:border-rose-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Categoría del Gasto</label>
                  <select
                    value={newCategoria}
                    onChange={(e: any) => setNewCategoria(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-[#130f06] p-2.5 text-xs text-stone-100 outline-none focus:border-rose-500/50 cursor-pointer"
                  >
                    <option value="Servicios" className="bg-zinc-950 text-white">Servicios Públicos</option>
                    <option value="Alquiler" className="bg-zinc-950 text-white">Alquiler del local</option>
                    <option value="Nómina" className="bg-zinc-950 text-white">Nómina / Sueldos</option>
                    <option value="Mantenimiento" className="bg-zinc-950 text-white">Mantenimiento de salones</option>
                    <option value="Publicidad" className="bg-zinc-950 text-white">Marketing y Publicidad</option>
                    <option value="Insumos" className="bg-zinc-950 text-white">Compra de Insumos</option>
                    <option value="Otros" className="bg-zinc-950 text-white">Otros Gastos Varios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Forma de Pago / Metodo</label>
                  <select
                    value={newMetodo}
                    onChange={(e: any) => setNewMetodo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-[#130f06] p-2.5 text-xs text-stone-100 outline-none focus:border-rose-500/50 cursor-pointer"
                  >
                    <option value="Efectivo" className="bg-zinc-950 text-white">Efectivo</option>
                    <option value="Transferencia" className="bg-zinc-950 text-white">Transferencia Bancaria</option>
                    <option value="Tarjeta" className="bg-zinc-950 text-white">Tarjeta Corporativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Observaciones / Notas de Soporte</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Factura de luz pagada en estafeta / Pago efectuado vía transferencia Banco Popular..."
                  value={newObservacion}
                  onChange={(e) => setNewObservacion(e.target.value)}
                  className="w-full rounded-xl border border-zinc-855 bg-zinc-900/60 p-2.5 text-xs text-stone-100 outline-none focus:border-rose-500/50 resize-none font-sans"
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
                  className="rounded-xl px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
                >
                  Confirmar Egreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
