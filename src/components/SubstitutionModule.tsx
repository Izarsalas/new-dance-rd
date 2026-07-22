/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RegistroSuplencia, Empleado, Clase, Alumno, TicketSettings, AlumnoSuplencia } from '../types';
import { 
  UserCheck, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign, 
  Phone, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Edit3, 
  Trash2, 
  X, 
  MapPin, 
  FileText, 
  Sparkles, 
  Building2, 
  Check, 
  UserX,
  Briefcase
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';
import NewDanceLogo from './NewDanceLogo';

interface SubstitutionModuleProps {
  suplencias: RegistroSuplencia[];
  empleados: Empleado[];
  clases: Clase[];
  alumnos: Alumno[];
  ticketSettings: TicketSettings;
  onAddSuplencia: (suplencia: Omit<RegistroSuplencia, 'id'>) => void;
  onUpdateSuplencia: (suplencia: RegistroSuplencia) => void;
  onDeleteSuplencia: (id: string) => void;
  onAddEgreso?: (egreso: { concepto: string; monto: number; fecha: string; metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta'; categoria: 'Nómina'; observaciones?: string }) => void;
}

export default function SubstitutionModule({
  suplencias,
  empleados,
  clases,
  alumnos,
  ticketSettings,
  onAddSuplencia,
  onUpdateSuplencia,
  onDeleteSuplencia,
  onAddEgreso
}: SubstitutionModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pagado' | 'Pendiente'>('Todos');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSuplencia, setEditingSuplencia] = useState<RegistroSuplencia | null>(null);
  const [selectedSuplenciaDetails, setSelectedSuplenciaDetails] = useState<RegistroSuplencia | null>(null);
  const [ticketToPrint, setTicketToPrint] = useState<RegistroSuplencia | null>(null);

  // Form states for New Suplencia
  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [profesorTitular, setProfesorTitular] = useState('');
  const [profesorSuplente, setProfesorSuplente] = useState('');
  const [telefonoSuplente, setTelefonoSuplente] = useState('');
  const [selectedClaseId, setSelectedClaseId] = useState('');
  const [claseNombre, setClaseNombre] = useState('');
  const [horario, setHorario] = useState('');
  const [salon, setSalon] = useState('');
  const [montoPago, setMontoPago] = useState<number | ''>(1500);
  const [estadoPago, setEstadoPago] = useState<'Pagado' | 'Pendiente'>('Pendiente');
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [motivoObservacion, setMotivoObservacion] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // When class selection changes in New Modal, auto-fill class fields and suggested students
  const handleClaseSelect = (cId: string) => {
    setSelectedClaseId(cId);
    if (!cId) return;

    const c = clases.find(item => item.id === cId);
    if (c) {
      setClaseNombre(`${c.nombre} (${c.ritmo})`);
      setHorario(c.horario);
      setSalon(c.salon);
      if (c.profesor) {
        setProfesorTitular(c.profesor);
      }

      // Auto filter students who match the rhythm or class
      const matchingStudents = alumnos
        .filter(a => a.activo && (a.ritmo.toLowerCase().includes(c.ritmo.toLowerCase()) || (a.horarioClases && a.horarioClases.toLowerCase().includes(c.horario.toLowerCase()))))
        .map(a => a.id);
      
      setSelectedStudentIds(matchingStudents);
    }
  };

  const handleStudentCheckToggle = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profesorTitular.trim()) {
      showAlert('Por favor seleccione o especifique el Profesor Titular a reemplazar.', 'Profesor Titular Requerido');
      return;
    }
    if (!profesorSuplente.trim()) {
      showAlert('Por favor ingrese el nombre del Profesor Suplente contratado.', 'Profesor Suplente Requerido');
      return;
    }
    if (!claseNombre.trim()) {
      showAlert('Especifique la clase o ritmo asignado a la suplencia.', 'Clase Requerida');
      return;
    }
    if (montoPago === '' || Number(montoPago) < 0) {
      showAlert('Ingrese un monto de honorarios válido para el suplente.', 'Monto Inválido');
      return;
    }

    const alumnosObjs: AlumnoSuplencia[] = selectedStudentIds.map(id => {
      const student = alumnos.find(a => a.id === id);
      return {
        alumnoId: id,
        alumnoNombre: student ? student.nombre : 'Alumno registrado'
      };
    });

    const newMonto = Number(montoPago);

    onAddSuplencia({
      fecha,
      profesorTitular: profesorTitular.trim(),
      profesorSuplente: profesorSuplente.trim(),
      telefonoSuplente: telefonoSuplente.trim() || undefined,
      claseId: selectedClaseId || undefined,
      claseNombre: claseNombre.trim(),
      horario: horario.trim() || '18:00 - 19:30',
      salon: salon.trim() || 'Salón Principal',
      montoPago: newMonto,
      estadoPago,
      metodoPago: estadoPago === 'Pagado' ? metodoPago : undefined,
      fechaPago: estadoPago === 'Pagado' ? fecha : undefined,
      alumnosCorrespondientes: alumnosObjs,
      motivoObservacion: motivoObservacion.trim() || undefined
    });

    // If paid upon creation, record automatically in Expense Module (Nómina)
    if (estadoPago === 'Pagado' && newMonto > 0 && onAddEgreso) {
      onAddEgreso({
        concepto: `Pago Suplencia: ${profesorSuplente.trim()} (Clase: ${claseNombre.trim()})`,
        monto: newMonto,
        fecha,
        metodoPago,
        categoria: 'Nómina',
        observaciones: `Suplencia realizada a ${profesorTitular.trim()}. ${motivoObservacion.trim()}`
      });
    }

    // Reset Form
    setFecha(new Date().toISOString().substring(0, 10));
    setProfesorTitular('');
    setProfesorSuplente('');
    setTelefonoSuplente('');
    setSelectedClaseId('');
    setClaseNombre('');
    setHorario('');
    setSalon('');
    setMontoPago(1500);
    setEstadoPago('Pendiente');
    setMetodoPago('Efectivo');
    setMotivoObservacion('');
    setSelectedStudentIds([]);
    setShowAddModal(false);

    showAlert('¡Registro de suplencia guardado exitosamente!', 'Suplencia Registrada');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSuplencia) return;

    onUpdateSuplencia(editingSuplencia);
    setEditingSuplencia(null);
    showAlert('Suplencia actualizada correctamente.', 'Guardado');
  };

  const handleMarkAsPaid = async (sup: RegistroSuplencia) => {
    const confirmPay = await showConfirm(
      `¿Desea marcar como PAGADO los honorarios de RD$ ${sup.montoPago.toLocaleString('es-DO')} al profesor suplente "${sup.profesorSuplente}"?`,
      'Confirmar Pago de Suplencia'
    );

    if (confirmPay) {
      const today = new Date().toISOString().substring(0, 10);
      const updated: RegistroSuplencia = {
        ...sup,
        estadoPago: 'Pagado',
        fechaPago: today,
        metodoPago: sup.metodoPago || 'Efectivo'
      };

      onUpdateSuplencia(updated);

      // Record automatically as Egreso
      if (onAddEgreso) {
        onAddEgreso({
          concepto: `Pago Suplencia: ${sup.profesorSuplente} (${sup.claseNombre})`,
          monto: sup.montoPago,
          fecha: today,
          metodoPago: sup.metodoPago || 'Efectivo',
          categoria: 'Nómina',
          observaciones: `Suplencia de ${sup.profesorTitular}. ${sup.motivoObservacion || ''}`
        });
      }

      showAlert('¡Pago de suplencia procesado y registrado en Gastos de Nómina!', 'Pago Exitoso');
    }
  };

  const handleDeleteClick = async (sup: RegistroSuplencia) => {
    const confirmDel = await showConfirm(
      `¿Está seguro de eliminar el registro de suplencia de "${sup.profesorSuplente}"?`,
      'Eliminar Registro'
    );
    if (confirmDel) {
      onDeleteSuplencia(sup.id);
      if (selectedSuplenciaDetails?.id === sup.id) {
        setSelectedSuplenciaDetails(null);
      }
      showAlert('Registro de suplencia eliminado.', 'Eliminado');
    }
  };

  // Filtered List
  const filteredSuplencias = suplencias.filter(s => {
    const matchesSearch = 
      s.profesorSuplente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.profesorTitular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.claseNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.telefonoSuplente && s.telefonoSuplente.includes(searchTerm));

    const matchesStatus = statusFilter === 'Todos' || s.estadoPago === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalSuplencias = suplencias.length;
  const pendientesCount = suplencias.filter(s => s.estadoPago === 'Pendiente').length;
  const totalMontoPendiente = suplencias
    .filter(s => s.estadoPago === 'Pendiente')
    .reduce((sum, s) => sum + s.montoPago, 0);
  const totalMontoPagado = suplencias
    .filter(s => s.estadoPago === 'Pagado')
    .reduce((sum, s) => sum + s.montoPago, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-950/60 border border-gold-800/40 text-gold-400">
              <ArrowRightLeft className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
                Profesores <span className="text-gold-500">Suplentes y Suplencias</span>
              </h1>
              <p className="text-xs text-zinc-400">
                Control de reemplazos de profesores titulares, horarios, lista de alumnos asignados y pagos de honorarios.
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-add-suplencia-modal"
          onClick={() => setShowAddModal(true)}
          className="z-10 flex items-center justify-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider px-5 py-3.5 transition-all shadow-lg shadow-gold-500/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Suplencia</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900 text-gold-400 border border-zinc-850">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Suplencias Totales</span>
            <span className="text-2xl font-black text-white font-mono">{totalSuplencias}</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900 text-amber-400 border border-zinc-850">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Pagos Pendientes</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{pendientesCount}</span>
            <span className="text-[10px] text-zinc-500 block">RD$ {totalMontoPendiente.toLocaleString('es-DO')}</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-850">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Honorarios Pagados</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              RD$ {totalMontoPagado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900 text-cyan-400 border border-zinc-850">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Titulares Reemplazados</span>
            <span className="text-2xl font-black text-white font-mono">
              {new Set(suplencias.map(s => s.profesorTitular)).size}
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar profesor suplente, titular o clase..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300">
            <Filter className="h-3.5 w-3.5 text-gold-500" />
            <span className="font-semibold text-zinc-400">Estado de Pago:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="Todos" className="bg-zinc-900">Todos</option>
              <option value="Pagado" className="bg-zinc-900">Pagados</option>
              <option value="Pendiente" className="bg-zinc-900">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUPLENCIAS TABLE / LIST */}
      {filteredSuplencias.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center space-y-3">
          <ArrowRightLeft className="h-12 w-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay suplencias registradas</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Haga clic en "Registrar Suplencia" para agregar un profesor suplente cuando un profesor fijo no pueda asistir.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] tracking-wider font-mono border-b border-zinc-850">
                <tr>
                  <th className="p-4">Fecha / Horario</th>
                  <th className="p-4">Profesor Titular</th>
                  <th className="p-4">Profesor Suplente</th>
                  <th className="p-4">Clase / Salón</th>
                  <th className="p-4">Alumnos</th>
                  <th className="p-4">Monto Honorarios</th>
                  <th className="p-4">Estado Pago</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredSuplencias.map((sup) => (
                  <tr key={sup.id} className="hover:bg-zinc-900/50 transition-colors">
                    {/* Date / Time */}
                    <td className="p-4">
                      <span className="font-mono font-bold text-white block">{sup.fecha}</span>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-gold-500" /> {sup.horario}
                      </span>
                    </td>

                    {/* Titular */}
                    <td className="p-4">
                      <span className="font-semibold text-zinc-300 block">{sup.profesorTitular}</span>
                      <span className="text-[10px] text-zinc-500">Profesor Fijo</span>
                    </td>

                    {/* Suplente */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-gold-950/60 border border-gold-800/40 text-gold-400 font-bold">
                          <UserCheck className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <span className="font-bold text-white block">{sup.profesorSuplente}</span>
                          {sup.telefonoSuplente && (
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5 text-emerald-400" /> {sup.telefonoSuplente}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Clase / Salón */}
                    <td className="p-4">
                      <span className="font-medium text-white block">{sup.claseNombre}</span>
                      {sup.salon && (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 text-gold-500" /> {sup.salon}
                        </span>
                      )}
                    </td>

                    {/* Alumnos Asignados */}
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedSuplenciaDetails(sup)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-gold-400 hover:text-gold-300 font-mono text-xs font-bold hover:border-gold-500/40 cursor-pointer"
                        title="Ver lista de alumnos que le corresponden"
                      >
                        <Users className="h-3 w-3" />
                        <span>{sup.alumnosCorrespondientes.length} Alumnos</span>
                      </button>
                    </td>

                    {/* Monto */}
                    <td className="p-4 font-mono font-bold text-white text-sm">
                      RD$ {sup.montoPago.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Estado Pago */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        sup.estadoPago === 'Pagado'
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                          : 'bg-amber-950/80 border border-amber-800 text-amber-300'
                      }`}>
                        {sup.estadoPago === 'Pagado' ? (
                          <>
                            <Check className="h-3 w-3" />
                            Pagado
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sup.estadoPago === 'Pendiente' && (
                          <button
                            onClick={() => handleMarkAsPaid(sup)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                            title="Pagar honorarios al suplente"
                          >
                            Pagar
                          </button>
                        )}

                        <button
                          onClick={() => setTicketToPrint(sup)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:text-gold-400 cursor-pointer"
                          title="Imprimir Comprobante de Suplencia"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingSuplencia({ ...sup })}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:text-white cursor-pointer"
                          title="Editar Registro"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(sup)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/50 cursor-pointer"
                          title="Eliminar Registro"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW SUPLENCIA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-2xl w-full p-5 shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col my-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3 shrink-0 pr-8">
              <span className="p-2 rounded-xl bg-gold-950 border border-gold-800 text-gold-400">
                <ArrowRightLeft className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Registrar Profesor Suplente
                </h2>
                <p className="text-xs text-zinc-400">Asigne el reemplazo temporal para una clase o grupo</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0 pt-3">
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Seleccionar Clase existente o escribir */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Cargar desde Clase Existente (Opcional)</label>
                    <select
                      value={selectedClaseId}
                      onChange={(e) => handleClaseSelect(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="">-- Seleccionar Clase para autocompletar --</option>
                      {clases.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.ritmo}) - {c.profesor || 'Sin Prof.'} [{c.horario}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Profesor Titular (A reemplazar) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Prof. Carlos Ruiz"
                      value={profesorTitular}
                      onChange={(e) => setProfesorTitular(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Profesor Suplente Contratado *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Prof. Marcos Peña (Suplente)"
                      value={profesorSuplente}
                      onChange={(e) => setProfesorSuplente(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Teléfono / WhatsApp Suplente</label>
                    <input
                      type="text"
                      placeholder="Ej. 809-555-0199"
                      value={telefonoSuplente}
                      onChange={(e) => setTelefonoSuplente(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha de la Suplencia *</label>
                    <input
                      type="date"
                      required
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre de la Clase / Ritmo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Salsa Intermedio II"
                      value={claseNombre}
                      onChange={(e) => setClaseNombre(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Horario / Duración</label>
                    <input
                      type="text"
                      placeholder="Ej. 18:00 - 19:30"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Salón / Área</label>
                    <input
                      type="text"
                      placeholder="Ej. Salón de Oro"
                      value={salon}
                      onChange={(e) => setSalon(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Pago Honorarios (RD$) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="1500"
                      value={montoPago}
                      onChange={(e) => setMontoPago(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado de Pago *</label>
                    <select
                      value={estadoPago}
                      onChange={(e) => setEstadoPago(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="Pendiente">Pendiente de Pago</option>
                      <option value="Pagado">Pagado Inmediatamente</option>
                    </select>
                  </div>

                  {estadoPago === 'Pagado' && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Método de Pago</label>
                      <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value as any)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                      </select>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Motivo / Observaciones</label>
                    <input
                      type="text"
                      placeholder="Ej. Permiso médico del titular / Ausencia personal"
                      value={motivoObservacion}
                      onChange={(e) => setMotivoObservacion(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* Seleccionar Alumnos que le corresponden */}
                  <div className="sm:col-span-2 border-t border-zinc-900 pt-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gold-400 mb-1.5">
                      Alumnos Asignados a esta Suplencia ({selectedStudentIds.length} seleccionados)
                    </label>

                    <div className="max-h-32 overflow-y-auto bg-zinc-900/60 rounded-xl border border-zinc-850 p-2 divide-y divide-zinc-850">
                      {alumnos.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-2">No hay alumnos registrados en el sistema.</p>
                      ) : (
                        alumnos.map(al => (
                          <label key={al.id} className="flex items-center justify-between p-1.5 hover:bg-zinc-850 rounded-lg cursor-pointer text-xs">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(al.id)}
                                onChange={() => handleStudentCheckToggle(al.id)}
                                className="accent-gold-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              <span className="font-semibold text-white">{al.nombre}</span>
                            </div>
                            <span className="text-[10px] text-zinc-400">{al.ritmo} • {al.nivel}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900 shrink-0 mt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold hover:bg-zinc-850 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Guardar Suplencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUPLENCIA MODAL */}
      {editingSuplencia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-xl w-full p-5 shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col my-auto">
            <button
              onClick={() => setEditingSuplencia(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3 shrink-0 pr-8">
              <span className="p-2 rounded-xl bg-gold-950 border border-gold-800 text-gold-400">
                <Edit3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Editar Suplencia
                </h2>
                <p className="text-xs text-zinc-400">Modifique los datos del profesor suplente o de la clase</p>
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="flex flex-col flex-1 min-h-0 pt-3">
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Profesor Titular *</label>
                    <input
                      type="text"
                      required
                      value={editingSuplencia.profesorTitular}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, profesorTitular: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Profesor Suplente *</label>
                    <input
                      type="text"
                      required
                      value={editingSuplencia.profesorSuplente}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, profesorSuplente: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Teléfono Suplente</label>
                    <input
                      type="text"
                      value={editingSuplencia.telefonoSuplente || ''}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, telefonoSuplente: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha *</label>
                    <input
                      type="date"
                      required
                      value={editingSuplencia.fecha}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, fecha: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Clase / Ritmo *</label>
                    <input
                      type="text"
                      required
                      value={editingSuplencia.claseNombre}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, claseNombre: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Horario</label>
                    <input
                      type="text"
                      value={editingSuplencia.horario}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, horario: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Honorarios (RD$) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingSuplencia.montoPago}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, montoPago: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado de Pago</label>
                    <select
                      value={editingSuplencia.estadoPago}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, estadoPago: e.target.value as any })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagado">Pagado</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Observaciones / Motivo</label>
                    <input
                      type="text"
                      value={editingSuplencia.motivoObservacion || ''}
                      onChange={(e) => setEditingSuplencia({ ...editingSuplencia, motivoObservacion: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900 shrink-0 mt-3">
                <button
                  type="button"
                  onClick={() => setEditingSuplencia(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold hover:bg-zinc-850 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL: STUDENTS ASSIGNED TO SUBSTITUTION */}
      {selectedSuplenciaDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-lg w-full p-6 space-y-5 my-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setSelectedSuplenciaDetails(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-zinc-900 pb-4">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest block">
                Alumnos Asignados a la Suplencia
              </span>
              <h2 className="text-lg font-black text-white">{selectedSuplenciaDetails.claseNombre}</h2>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                <span>👨‍🏫 Suplente: <strong className="text-white">{selectedSuplenciaDetails.profesorSuplente}</strong></span>
                <span>📅 {selectedSuplenciaDetails.fecha}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
                Lista de Alumnos ({selectedSuplenciaDetails.alumnosCorrespondientes.length})
              </h3>

              {selectedSuplenciaDetails.alumnosCorrespondientes.length === 0 ? (
                <div className="p-6 text-center bg-zinc-900/50 rounded-xl text-zinc-500 text-xs border border-zinc-850">
                  No se asignaron alumnos específicos a esta suplencia.
                </div>
              ) : (
                <div className="bg-zinc-900/60 rounded-xl border border-zinc-850 divide-y divide-zinc-850 max-h-60 overflow-y-auto">
                  {selectedSuplenciaDetails.alumnosCorrespondientes.map((al, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-850/50">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gold-950 text-gold-400 font-mono font-bold text-[10px] flex items-center justify-center border border-gold-800/40">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{al.alumnoNombre}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">Alumno Activo</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-900">
              <button
                onClick={() => setSelectedSuplenciaDetails(null)}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white font-semibold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT TICKET / RECEIPT MODAL FOR SUBSTITUTE */}
      {ticketToPrint && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setTicketToPrint(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Print Voucher Box */}
            <div className="bg-white text-black p-6 rounded-xl shadow-inner space-y-4 font-sans text-xs print:m-0 print:p-0 print:shadow-none" id="printable-substitute-receipt">
              <div className="text-center space-y-1 border-b pb-3 border-zinc-200">
                <div className="flex justify-center mb-1 h-12 w-28 mx-auto">
                  <NewDanceLogo lightTheme className="h-full w-full" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wide">{ticketSettings.nombreAcademia || 'ACADEMIA DE BAILE'}</h3>
                <p className="text-[10px] text-zinc-600">{ticketSettings.direccion || 'República Dominicana'}</p>
                <p className="text-[10px] text-zinc-600">Tel: {ticketSettings.telefono || '809-000-0000'}</p>
                <div className="pt-1">
                  <span className="inline-block bg-zinc-100 px-2 py-0.5 rounded font-mono font-bold text-[10px] text-zinc-800 uppercase">
                    COMPROBANTE PAGO DE SUPLENCIA
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono border-b pb-3 border-zinc-200">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fecha:</span>
                  <span className="font-bold">{ticketToPrint.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Profesor Titular:</span>
                  <span className="font-bold">{ticketToPrint.profesorTitular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Profesor Suplente:</span>
                  <span className="font-bold">{ticketToPrint.profesorSuplente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Clase / Ritmo:</span>
                  <span className="font-bold">{ticketToPrint.claseNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Horario:</span>
                  <span>{ticketToPrint.horario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Alumnos a Cargo:</span>
                  <span>{ticketToPrint.alumnosCorrespondientes.length} Alumnos</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-zinc-700">HONORARIOS PAGADOS:</span>
                  <span className="font-extrabold font-mono text-base text-black">
                    RD$ {ticketToPrint.montoPago.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-200">
                  <span>Estado: {ticketToPrint.estadoPago}</span>
                  <span>Vía: {ticketToPrint.metodoPago || 'Efectivo'}</span>
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4 text-[10px] text-center">
                <div>
                  <div className="border-b border-zinc-400 mb-1 h-8"></div>
                  <span className="text-zinc-600">Firma Suplente</span>
                </div>
                <div>
                  <div className="border-b border-zinc-400 mb-1 h-8"></div>
                  <span className="text-zinc-600">Firma Administración</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-zinc-400 pt-2">
                ¡Gracias por colaborar con nuestra academia!
              </div>
            </div>

            {/* Print Controls */}
            <div className="flex justify-between items-center pt-2 print:hidden">
              <button
                onClick={() => setTicketToPrint(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Cerrar
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
