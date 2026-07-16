/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Alumno, Pago } from '../types';
import { 
  DollarSign, 
  Search, 
  PlusCircle, 
  Check, 
  CreditCard, 
  Calendar, 
  Activity, 
  ClipboardCheck, 
  Filter,
  X
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface PaymentModuleProps {
  pagos: Pago[];
  alumnos: Alumno[];
  onAddPayment: (pago: Omit<Pago, 'id'>) => void;
  onPayMonthly: (paymentId: string, info: { fechaPago: string; metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta' }) => void;
  onDeletePayment: (id: string) => void;
}

export default function PaymentModule({
  pagos,
  alumnos,
  onAddPayment,
  onPayMonthly,
  onDeletePayment,
}: PaymentModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [payingRecord, setPayingRecord] = useState<Pago | null>(null);

  // Collect Payment state
  const [payDate, setPayDate] = useState(new Date().toISOString().substring(0, 10));
  const [payMethod, setPayMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');

  // Manual payment generation state
  const [selectedAlumnoId, setSelectedAlumnoId] = useState('');
  const [newPayMonth, setNewPayMonth] = useState('Mayo 2026');
  const [newPayBaseAmount, setNewPayBaseAmount] = useState<number | ''>(2500);
  const [newPayPlanPago, setNewPayPlanPago] = useState<'Mensual' | 'Trimestral' | 'Semestral' | 'Pago Único'>('Mensual');
  const [newPayDescuentoValor, setNewPayDescuentoValor] = useState<number | ''>('');
  const [newPayDescuentoTipo, setNewPayDescuentoTipo] = useState<'Porcentaje' | 'Fijo'>('Fijo');

  const getStudentBaseAmount = (alumno: Alumno) => {
    if (!alumno.montoMensualidad) return 0;
    const final = alumno.montoMensualidad;
    const desc = alumno.descuentoValor ? Number(alumno.descuentoValor) : 0;
    if (!desc) return final;
    if (alumno.descuentoTipo === 'Porcentaje') {
      const pct = desc / 100;
      if (pct >= 1) return final; // Avoid division by zero
      return Math.round(final / (1 - pct));
    } else {
      return final + desc;
    }
  };

  useEffect(() => {
    if (selectedAlumnoId) {
      const student = alumnos.find(a => a.id === selectedAlumnoId);
      if (student) {
        const base = getStudentBaseAmount(student);
        setNewPayBaseAmount(base || 2500);
        setNewPayPlanPago(student.planPago || 'Mensual');
        setNewPayDescuentoValor(student.descuentoValor !== undefined && student.descuentoValor !== null ? student.descuentoValor : '');
        setNewPayDescuentoTipo(student.descuentoTipo || 'Fijo');
      }
    }
  }, [selectedAlumnoId, alumnos]);

  // Compute final discounted payment amount live
  const computedNewPayAmount = (() => {
    if (newPayBaseAmount === '') return 0;
    const base = Number(newPayBaseAmount);
    if (!newPayDescuentoValor) return base;
    const desc = Number(newPayDescuentoValor);
    if (newPayDescuentoTipo === 'Porcentaje') {
      return Math.max(0, base - (base * (desc / 100)));
    } else {
      return Math.max(0, base - desc);
    }
  })();

  const monthsOptions = Array.from(new Set(pagos.map(p => p.mes)));

  const handleCreatePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumnoId) {
      await showAlert('Por favor seleccione un alumno.', 'Falta Alumno');
      return;
    }

    onAddPayment({
      alumnoId: selectedAlumnoId,
      mes: newPayMonth,
      monto: Number(computedNewPayAmount) || 0,
      montoOriginal: newPayBaseAmount !== '' ? Number(newPayBaseAmount) : undefined,
      planPago: newPayPlanPago,
      descuentoValor: newPayDescuentoValor !== '' ? Number(newPayDescuentoValor) : undefined,
      descuentoTipo: newPayDescuentoTipo,
      fechaPago: null,
      estado: 'Pendiente'
    });

    setSelectedAlumnoId('');
    setShowAddModal(false);
  };

  const handleChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payingRecord) {
      onPayMonthly(payingRecord.id, {
        fechaPago: payDate,
        metodoPago: payMethod
      });
      setPayingRecord(null);
    }
  };

  // Stats calculation
  const totalRecaudado = pagos
    .filter(p => p.estado === 'Pagado')
    .reduce((sum, p) => sum + p.monto, 0);

  const totalPendiente = pagos
    .filter(p => p.estado === 'Pendiente')
    .reduce((sum, p) => sum + p.monto, 0);

  const totalAtrasado = pagos
    .filter(p => p.estado === 'Atrasado')
    .reduce((sum, p) => sum + p.monto, 0);

  const activeAlumnos = alumnos.filter(a => a.activo);

  // Filter payments
  const filteredPayments = pagos.filter(pago => {
    const alumnoObj = alumnos.find(a => a.id === pago.alumnoId);
    const studentName = alumnoObj ? alumnoObj.nombre.toLowerCase() : '';
    
    const matchesSearch = studentName.includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === 'Todos' || pago.mes === filterMonth;
    const matchesEstado = filterEstado === 'Todos' || pago.estado === filterEstado;

    return matchesSearch && matchesMonth && matchesEstado;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Gestión de Pagos Mensuales
          </h1>
          <p className="text-xs text-zinc-400">
            Seguimiento de mensualidades, cobros en efectivo/digitales y balances de adeudo para alumnos de baile.
          </p>
        </div>

        <button
          id="btn-add-payment-modal"
          onClick={async () => {
            if (activeAlumnos.length === 0) {
              await showAlert('Primero registre alumnos en el tab Alumnos para poder asigarles mensualidades.', 'Sin alumnos registrados');
              return;
            }
            setSelectedAlumnoId(activeAlumnos[0].id);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 font-semibold text-white px-4 py-2.5 text-sm transition-all shadow-md shadow-gold-500/10 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Asignar Mensualidad
        </button>
      </div>

      {/* Financial summary blocks */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Recaudado */}
        <div className="flex items-center gap-4 rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-5">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/20">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Recaudado (Total)</span>
            <h3 className="font-display text-xl font-bold text-white mt-0.5">
              RD$ {totalRecaudado.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Pendiente */}
        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="rounded-lg bg-zinc-900 pr-0.5 p-2.5 border border-zinc-800">
            <Calendar className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400">Pendiente Regular</span>
            <h3 className="font-display text-xl font-bold text-white mt-0.5">
              RD$ {totalPendiente.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Atrasado */}
        <div className="flex items-center gap-4 rounded-xl border border-rose-950 bg-rose-950/10 p-5">
          <div className="rounded-lg bg-rose-500/10 p-2.5 border border-rose-500/20">
            <Activity className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Monto Atrasado</span>
            <h3 className="font-display text-xl font-bold text-rose-100 mt-0.5">
              RD$ {totalAtrasado.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          
          {/* Search field */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
            <input
              id="search-payments"
              type="text"
              placeholder="Buscar pago por alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-gold-500/40 focus:bg-zinc-900"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Filter className="h-3.5 w-3.5 text-gold-500" />
              <span>Filtros:</span>
            </div>

            {/* Meses */}
            <select
              id="filter-payment-month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="rounded-lg border border-zinc-850 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-gold-500/30 cursor-pointer"
            >
              <option value="Todos">Mes: Todos</option>
              {monthsOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Estado del Pago */}
            <select
              id="filter-payment-status"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="rounded-lg border border-zinc-850 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-gold-500/30 cursor-pointer"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Pagado">Pagados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Atrasado">Atrasados</option>
            </select>
          </div>

        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-850 p-12 text-center bg-zinc-950">
          <DollarSign className="mx-auto h-10 w-10 text-gold-500/30" />
          <h3 className="mt-4 font-display text-base font-semibold text-white">No se hallaron pagos</h3>
          <p className="mt-1 text-xs text-zinc-500">Intente modificando el término de búsqueda o asigne una nueva carga.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/40 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="p-4 pl-6">Nombre del Alumno</th>
                <th className="p-4">Periodo Mensual</th>
                <th className="p-4">Tipo Estilo</th>
                <th className="p-4">Monto Cuota</th>
                <th className="p-4">Fecha Transacción</th>
                <th className="p-4">Método</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right pr-6">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm text-zinc-200">
              {filteredPayments.map((pago) => {
                const alumnoObj = alumnos.find(a => a.id === pago.alumnoId);
                return (
                  <tr key={pago.id} className="hover:bg-zinc-900/30 transition-colors">
                    
                    {/* Alumno name card */}
                    <td className="p-4 pl-6">
                      <span id={`payment-stud-name-${pago.id}`} className="font-display font-bold text-white block">
                        {alumnoObj ? alumnoObj.nombre : 'Alumno Eliminado'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">ID Pago: {pago.id}</span>
                    </td>

                    {/* Month Period */}
                    <td className="p-4">
                      <span className="font-medium text-zinc-300 block">{pago.mes}</span>
                      <span className="inline-flex items-center text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-400 px-1.5 py-0.5 rounded mt-0.5 font-semibold">
                        {pago.planPago || 'Mensual'}
                      </span>
                    </td>

                    {/* Class Rhythm */}
                    <td className="p-4 font-normal text-xs text-zinc-400">
                      {alumnoObj ? alumnoObj.ritmo : 'N/A'}
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      {pago.montoOriginal && pago.montoOriginal !== pago.monto ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-500 line-through block">
                            RD$ {pago.montoOriginal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-white text-sm">
                              RD$ {pago.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                            </span>
                            {pago.descuentoValor ? (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded">
                                {pago.descuentoTipo === 'Porcentaje' ? `-${pago.descuentoValor}%` : `-${pago.descuentoValor}`}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-white">
                          RD$ {pago.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>

                    {/* Payment Date */}
                    <td className="p-4 font-mono text-xs text-zinc-400">
                      {pago.fechaPago ? (
                        <span className="flex items-center gap-1.5">
                          <ClipboardCheck className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{pago.fechaPago}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-650 italic">Falta pagar</span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="p-4 text-xs font-medium">
                      {pago.metodoPago ? (
                        <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 bg-zinc-900 border border-zinc-850 text-white">
                          <CreditCard className="h-3 w-3 text-gold-500" />
                          <span>{pago.metodoPago}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 font-mono">-</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        pago.estado === 'Pagado' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                          : pago.estado === 'Atrasado'
                          ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                          : 'bg-amber-950/40 text-amber-300 border border-amber-900/30'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          pago.estado === 'Pagado' ? 'bg-emerald-400' : pago.estado === 'Atrasado' ? 'bg-rose-400' : 'bg-amber-400'
                        }`} />
                        <span>{pago.estado}</span>
                      </span>
                    </td>

                    {/* Quick collect button */}
                    <td className="p-4 text-right pr-6">
                      {pago.estado !== 'Pagado' ? (
                        <button
                          id={`btn-collect-${pago.id}`}
                          onClick={() => setPayingRecord(pago)}
                          className="inline-flex items-center gap-1 rounded bg-gold-500 hover:bg-gold-400 font-bold text-[11px] text-white px-2.5 py-1 transition-all cursor-pointer shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Cobrar</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-delete-p-${pago.id}`}
                          onClick={async () => {
                            const confirmed = await showConfirm(
                              '¿Desea restaurar o quitar el registro de este pago ya cobrado?',
                              { title: 'Eliminar Registro de Pago', confirmLabel: 'Sí, quitar', cancelLabel: 'Cancelar', isDanger: true }
                            );
                            if (confirmed) {
                              onDeletePayment(pago.id);
                            }
                          }}
                          className="text-xs text-zinc-600 hover:text-rose-400 hover:underline transition-colors cursor-pointer"
                        >
                          Eliminar registro
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: CHARGE / COLLECT DIALOG */}
      {payingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Registrar cobro de mensualidad</h3>
                <p className="text-[10px] text-zinc-400">
                  Alumno: <strong className="text-white">
                    {alumnos.find(a => a.id === payingRecord.alumnoId)?.nombre}
                  </strong>
                </p>
              </div>
              <button 
                onClick={() => setPayingRecord(null)}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChargeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Total a cobrar</label>
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-850 p-3 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gold-500" />
                  <span className="font-display font-extrabold text-white text-lg">
                    RD$ {payingRecord.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Método de Cobro *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Efectivo', 'Transferencia', 'Tarjeta'].map((m: any) => (
                    <button
                      key={m}
                      id={`btn-method-${m}`}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`rounded-lg border p-2 text-xs font-semibold text-center cursor-pointer transition-all ${
                        payMethod === m
                          ? 'border-gold-500/50 bg-gold-950/20 text-white font-bold'
                          : 'border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Fecha de pago *</label>
                <input
                  id="collect-date"
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  id="btn-charge-cancel"
                  type="button"
                  onClick={() => setPayingRecord(null)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-xs text-white hover:bg-zinc-810 cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  id="btn-charge-submit"
                  type="submit"
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-white cursor-pointer shadow-md"
                >
                  Marcar como Pagado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN NEW MANUAL PAYMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <h3 className="font-display text-lg font-bold text-white">Asignar Nueva Mensualidad</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePaymentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Seleccionar Alumno *</label>
                <select
                  id="add-payment-alumno"
                  required
                  value={selectedAlumnoId}
                  onChange={(e) => setSelectedAlumnoId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                >
                  {activeAlumnos.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre} (Ritmo: {a.ritmo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Mes de cobertura *</label>
                <input
                  id="add-payment-mes"
                  type="text"
                  required
                  placeholder="Ej. Mayo 2026"
                  value={newPayMonth}
                  onChange={(e) => setNewPayMonth(e.target.value)}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Frecuencia de Pago *</label>
                <select
                  id="add-payment-plan"
                  value={newPayPlanPago}
                  onChange={(e) => setNewPayPlanPago(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral (Cada 3 meses)</option>
                  <option value="Semestral">Semestral (Cada 6 meses)</option>
                  <option value="Pago Único">Pago Único (Un solo pago)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Monto Base (RD$) *</label>
                <input
                  id="add-payment-monto-base"
                  type="number"
                  required
                  min={0}
                  value={newPayBaseAmount}
                  onChange={(e) => setNewPayBaseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Aplicar Descuento</label>
                <div className="flex gap-1.5">
                  <select
                    value={newPayDescuentoTipo}
                    onChange={(e) => setNewPayDescuentoTipo(e.target.value as any)}
                    className="rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500/55 cursor-pointer w-20"
                  >
                    <option value="Fijo">RD$</option>
                    <option value="Porcentaje">%</option>
                  </select>
                  <input
                    id="add-payment-descuento-valor"
                    type="number"
                    placeholder="Ej. 500"
                    value={newPayDescuentoValor}
                    onChange={(e) => setNewPayDescuentoValor(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55 placeholder-zinc-700"
                  />
                </div>
              </div>

              {/* Real-time total card inside modal */}
              {newPayBaseAmount !== '' && (
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900 flex justify-between items-center text-xs animate-fade-in">
                  <div>
                    <span className="text-zinc-500">Monto Base:</span>{' '}
                    <span className="text-zinc-500 line-through">RD$ {Number(newPayBaseAmount).toLocaleString('es-DO')}</span>
                  </div>
                  <div>
                    <span className="text-gold-400 font-bold">Total Final:</span>{' '}
                    <span className="text-white font-extrabold font-mono text-sm ml-1">
                      RD$ {computedNewPayAmount.toLocaleString('es-DO')}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  id="btn-add-payment-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg bg-zinc-900 px-4 py-2.5 text-xs text-white hover:bg-zinc-810 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-add-payment-submit"
                  type="submit"
                  className="rounded-lg bg-gold-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-gold-400 cursor-pointer"
                >
                  Asignar Cargo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
