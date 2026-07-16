/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alumno } from '../types';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  UserCheck, 
  UserX, 
  Phone, 
  CalendarDays, 
  Filter, 
  Edit3, 
  X,
  Sparkles,
  Eye,
  FileText,
  Mail,
  User,
  Upload,
  Camera,
  Image,
  UserPlus
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

const PREDEFINED_RITMOS = ["Salsa", "Bachata", "Ballet", "Hip Hop", "Tango", "Flamenco", "K-Pop", "Zumba", "Merengue", "Danza Contemporánea", "Reggaetón"];

interface StudentModuleProps {
  alumnos: Alumno[];
  onAddStudent: (student: Omit<Alumno, 'id'>) => void;
  onUpdateStudent: (student: Alumno) => void;
  onToggleStatus: (id: string) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentModule({
  alumnos,
  onAddStudent,
  onUpdateStudent,
  onToggleStatus,
  onDeleteStudent
}: StudentModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRitmo, setFilterRitmo] = useState('Todos');
  const [filterLevel, setFilterLevel] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Activos');

  // Control modals & forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Alumno | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState(20);
  const [ritmo, setRitmo] = useState('Salsa');
  const [selectedRitmos, setSelectedRitmos] = useState<string[]>(['Salsa']);
  const [customRitmoInput, setCustomRitmoInput] = useState('');
  const [editSelectedRitmos, setEditSelectedRitmos] = useState<string[]>([]);
  const [editCustomRitmoInput, setEditCustomRitmoInput] = useState('');
  const [nivel, setNivel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [contacto, setContacto] = useState('');
  const [fechaInscripcion, setFechaInscripcion] = useState(new Date().toISOString().substring(0, 10));

  // New fields form states
  const [representante, setRepresentante] = useState('');
  const [fechaCulminacion, setFechaCulminacion] = useState('');
  const [telefonoPersonal, setTelefonoPersonal] = useState('');
  const [telefonoReferencia, setTelefonoReferencia] = useState('');
  const [cedulaPasaporte, setCedulaPasaporte] = useState('');
  const [correo, setCorreo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [montoPagoInicial, setMontoPagoInicial] = useState<number | ''>('');
  const [fechaPagoInicial, setFechaPagoInicial] = useState(new Date().toISOString().substring(0, 10));
  const [montoMensualidad, setMontoMensualidad] = useState<number | ''>('');
  const [fechaPagoMensualidad, setFechaPagoMensualidad] = useState(new Date().toISOString().substring(0, 10));
  const [planPago, setPlanPago] = useState<'Mensual' | 'Trimestral' | 'Semestral' | 'Pago Único'>('Mensual');
  const [descuentoValor, setDescuentoValor] = useState<number | ''>('');
  const [descuentoTipo, setDescuentoTipo] = useState<'Porcentaje' | 'Fijo'>('Fijo');
  
  const computedDiscountedMonto = (() => {
    if (montoMensualidad === '') return 0;
    const base = Number(montoMensualidad);
    if (!descuentoValor) return base;
    const desc = Number(descuentoValor);
    if (descuentoTipo === 'Porcentaje') {
      return Math.max(0, base - (base * (desc / 100)));
    } else {
      return Math.max(0, base - desc);
    }
  })();

  const computedEditDiscountedMonto = (() => {
    if (!editingStudent || editingStudent.montoMensualidad === undefined || editingStudent.montoMensualidad === null) return 0;
    const base = Number(editingStudent.montoMensualidad);
    const desc = editingStudent.descuentoValor ? Number(editingStudent.descuentoValor) : 0;
    if (!desc) return base;
    if (editingStudent.descuentoTipo === 'Porcentaje') {
      return Math.max(0, base - (base * (desc / 100)));
    } else {
      return Math.max(0, base - desc);
    }
  })();

  const [horarioClases, setHorarioClases] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // 2x1 Promo and Photo States
  const [foto, setFoto] = useState('');
  const [es2x1, setEs2x1] = useState(false);
  const [acompananteNombre, setAcompananteNombre] = useState('');
  const [acompananteFoto, setAcompananteFoto] = useState('');
  const [acompananteContacto, setAcompananteContacto] = useState('');
  const [acompananteTelefono, setAcompananteTelefono] = useState('');
  const [acompananteCorreo, setAcompananteCorreo] = useState('');
  const [acompananteCedula, setAcompananteCedula] = useState('');
  const [acompananteFechaVencimiento, setAcompananteFechaVencimiento] = useState('');
  const [acompananteHorarioClases, setAcompananteHorarioClases] = useState('');
  const [representanteFoto, setRepresentanteFoto] = useState('');

  const calculateOneMonthLater = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        date.setMonth(date.getMonth() + 1);
        
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  };

  // Selector for student detail modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Alumno | null>(null);

  // Helper to calculate age from birthdate
  const handleBirthdateChange = (birthStr: string) => {
    setFechaNacimiento(birthStr);
    if (!birthStr) return;
    const today = new Date();
    const birthDate = new Date(birthStr);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    if (!isNaN(calculatedAge) && calculatedAge >= 0) {
      setEdad(calculatedAge);
    }
  };

  // Helper to calculate age from birthdate for edit state
  const handleBirthdateChangeForEdit = (birthStr: string) => {
    if (!editingStudent) return;
    let newEdad = editingStudent.edad;
    if (birthStr) {
      const today = new Date();
      const birthDate = new Date(birthStr);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (!isNaN(calculatedAge) && calculatedAge >= 0) {
        newEdad = calculatedAge;
      }
    }
    setEditingStudent({
      ...editingStudent,
      fechaNacimiento: birthStr,
      edad: newEdad
    });
  };

  // Handle Submit
  const handleAddNewStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      await showAlert('Por favor complete el nombre completo del alumno.', 'Campo Requerido');
      return;
    }

    if (es2x1 && !acompananteNombre.trim()) {
      await showAlert('Por favor complete el nombre del acompañante para la promoción 2x1.', 'Acompañante Requerido');
      return;
    }

    const primaryContact = contacto.trim() || telefonoPersonal.trim() || telefonoReferencia.trim() || 'No provisto';
    const computedCompanionVencimiento = acompananteFechaVencimiento || calculateOneMonthLater(fechaInscripcion);

    onAddStudent({
      nombre: nombre.trim(),
      edad: Number(edad) || 20,
      ritmo: selectedRitmos.join(', ') || 'Salsa',
      nivel,
      contacto: primaryContact,
      fechaInscripcion,
      activo: true,
      representante: representante.trim() || undefined,
      fechaCulminacion: fechaCulminacion || undefined,
      telefonoPersonal: telefonoPersonal.trim() || undefined,
      telefonoReferencia: telefonoReferencia.trim() || undefined,
      cedulaPasaporte: cedulaPasaporte.trim() || undefined,
      correo: correo.trim() || undefined,
      fechaNacimiento: fechaNacimiento || undefined,
      montoPagoInicial: montoPagoInicial !== '' ? Number(montoPagoInicial) : undefined,
      fechaPagoInicial: fechaPagoInicial || undefined,
      montoMensualidad: montoMensualidad !== '' ? computedDiscountedMonto : undefined,
      fechaPagoMensualidad: fechaPagoMensualidad || undefined,
      planPago,
      descuentoValor: descuentoValor !== '' ? Number(descuentoValor) : undefined,
      descuentoTipo,
      horarioClases: horarioClases.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
      foto: foto || undefined,
      representanteFoto: Number(edad) < 18 ? (representanteFoto || undefined) : undefined,
      es2x1,
      acompananteNombre: es2x1 ? acompananteNombre.trim() : undefined,
      acompananteFoto: es2x1 ? (acompananteFoto || undefined) : undefined,
      acompananteContacto: es2x1 ? (acompananteContacto.trim() || undefined) : undefined,
      acompananteTelefono: es2x1 ? (acompananteTelefono.trim() || undefined) : undefined,
      acompananteCorreo: es2x1 ? (acompananteCorreo.trim() || undefined) : undefined,
      acompananteCedula: es2x1 ? (acompananteCedula.trim() || undefined) : undefined,
      acompananteFechaVencimiento: es2x1 ? computedCompanionVencimiento : undefined,
      acompananteHorarioClases: es2x1 ? (acompananteHorarioClases.trim() || undefined) : undefined
    });

    // Reset fields & close modal
    setNombre('');
    setEdad(20);
    setRitmo('Salsa');
    setSelectedRitmos(['Salsa']);
    setCustomRitmoInput('');
    setNivel('Principiante');
    setContacto('');
    setFechaInscripcion(new Date().toISOString().substring(0, 10));
    setRepresentante('');
    setFechaCulminacion('');
    setTelefonoPersonal('');
    setTelefonoReferencia('');
    setCedulaPasaporte('');
    setCorreo('');
    setFechaNacimiento('');
    setMontoPagoInicial('');
    setFechaPagoInicial(new Date().toISOString().substring(0, 10));
    setMontoMensualidad('');
    setFechaPagoMensualidad(new Date().toISOString().substring(0, 10));
    setPlanPago('Mensual');
    setDescuentoValor('');
    setDescuentoTipo('Fijo');
    setHorarioClases('');
    setObservaciones('');
    
    // Reset 2x1 & Photo States
    setFoto('');
    setEs2x1(false);
    setAcompananteNombre('');
    setAcompananteFoto('');
    setAcompananteContacto('');
    setAcompananteTelefono('');
    setAcompananteCorreo('');
    setAcompananteCedula('');
    setAcompananteFechaVencimiento('');
    setAcompananteHorarioClases('');
    setRepresentanteFoto('');
    
    setShowAddModal(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      if (!editingStudent.nombre.trim()) {
        await showAlert('Por favor complete el nombre completo.', 'Campo Requerido');
        return;
      }
      // Ensure there is some contact value
      const primaryContact = editingStudent.contacto.trim() || editingStudent.telefonoPersonal?.trim() || editingStudent.telefonoReferencia?.trim() || 'No provisto';
      onUpdateStudent({
        ...editingStudent,
        ritmo: editSelectedRitmos.join(', ') || 'Salsa',
        contacto: primaryContact,
        montoMensualidad: editingStudent.montoMensualidad !== undefined ? computedEditDiscountedMonto : undefined
      });
      setEditingStudent(null);
    }
  };

  // Unique lists for filtering
  const ritmosList = Array.from(new Set(alumnos.flatMap(a => a.ritmo ? a.ritmo.split(',').map(s => s.trim()).filter(Boolean) : [])));

  // Filter students
  const filteredStudents = alumnos.filter(student => {
    const matchesSearch = student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.contacto.includes(searchTerm);
    const matchesRitmo = filterRitmo === 'Todos' || 
                         (student.ritmo && student.ritmo.split(',').map(s => s.trim().toLowerCase()).includes(filterRitmo.toLowerCase()));
    const matchesLevel = filterLevel === 'Todos' || student.nivel === filterLevel;
    const matchesStatus = filterStatus === 'Todos' || 
                          (filterStatus === 'Activos' && student.activo) || 
                          (filterStatus === 'Inactivos' && !student.activo);
    
    return matchesSearch && matchesRitmo && matchesLevel && matchesStatus;
  });

  // Open Edit student
  const startEdit = (student: Alumno) => {
    setEditingStudent(student);
    if (student.ritmo) {
      setEditSelectedRitmos(student.ritmo.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      setEditSelectedRitmos([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header and Add Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Gestión de Inscripciones
          </h1>
          <p className="text-xs text-zinc-400">
            Altas de alumnos, niveles y rítmica preferente para el ciclo actual.
          </p>
        </div>
        
        <button
          id="btn-add-student-modal"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 font-semibold text-white px-4 py-2.5 text-sm transition-all shadow-md shadow-gold-500/10 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Registrar Nuevo Alumno
        </button>
      </div>

      {/* Filter and Search Bar row */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          
          {/* Search field */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
            <input
              id="search-students"
              type="text"
              placeholder="Buscar por nombre o número telefónico..."
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

            {/* Ritmos */}
            <select
              id="filter-ritmo"
              value={filterRitmo}
              onChange={(e) => setFilterRitmo(e.target.value)}
              className="rounded-lg border border-zinc-850 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-gold-500/30 cursor-pointer"
            >
              <option value="Todos">Ritmo: Todos</option>
              {ritmosList.map(ritmoOption => (
                <option key={ritmoOption} value={ritmoOption}>{ritmoOption}</option>
              ))}
            </select>

            {/* Nivel */}
            <select
              id="filter-nivel"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="rounded-lg border border-zinc-850 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-gold-500/30 cursor-pointer"
            >
              <option value="Todos">Nivel: Todos</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>

            {/* Estado */}
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-zinc-850 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-gold-500/30 cursor-pointer"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>

        </div>
      </div>

      {/* Students Data Display */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950">
          <Sparkles className="mx-auto h-10 w-10 text-gold-500/40" />
          <h3 className="mt-4 font-display text-base font-semibold text-white">No se encontraron alumnos</h3>
          <p className="mt-1 text-xs text-zinc-500">Pruebe ajustando los filtros de búsqueda o registre un nuevo alumno.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/40 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="p-4 pl-6">Nombre del Alumno</th>
                <th className="p-4">Edad</th>
                <th className="p-4">Ritmo</th>
                <th className="p-4">Nivel de Baile</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Inscrito el</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm text-zinc-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      {student.foto ? (
                        <img 
                          src={student.foto} 
                          alt={student.nombre} 
                          className="h-10 w-10 rounded-full object-cover border border-gold-500/30 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-gold-500 flex-shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <span id={`student-name-${student.id}`} className="font-display font-bold text-white block">
                          {student.nombre}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-gold-500/80">ID: {student.id}</span>
                          {student.es2x1 && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-gold-500/10 px-1.5 py-0.2 text-[9px] font-bold text-gold-400 border border-gold-500/20">
                              Promo 2x1
                            </span>
                          )}
                        </div>
                        {student.es2x1 && student.acompananteNombre && (
                          <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                            <span className="text-zinc-500">👥 Acompañante:</span>
                            <strong className="text-gold-200 font-medium">{student.acompananteNombre}</strong>
                            <span className="text-zinc-500">({student.acompananteFechaVencimiento || 'N/A'})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono">{student.edad} años</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {student.ritmo.split(',').map((style, idx) => (
                        <span key={idx} className="inline-flex rounded-full bg-gold-950/20 px-2.5 py-0.5 text-[10px] font-semibold text-gold-400 border border-gold-500/15">
                          {style.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold ${
                      student.nivel === 'Avanzado' ? 'bg-amber-950 text-amber-300 border border-amber-950' :
                      student.nivel === 'Intermedio' ? 'bg-zinc-800 text-gold-100 border border-zinc-700' :
                      'bg-zinc-900 text-zinc-400'
                    }`}>
                      {student.nivel}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gold-500" />
                      <span>{student.contacto}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-zinc-600" />
                      <span>{student.fechaInscripcion}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      id={`status-toggle-${student.id}`}
                      onClick={() => onToggleStatus(student.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        student.activo 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-950/70' 
                          : 'bg-rose-950/40 text-rose-400 border border-rose-900/30 hover:bg-rose-950/70'
                      }`}
                    >
                      {student.activo ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right pr-6 space-x-2">
                    <button
                      id={`btn-view-student-${student.id}`}
                      onClick={() => setSelectedStudentDetail(student)}
                      className="inline-flex rounded-lg bg-zinc-900 p-2 text-gold-500 border border-zinc-800 transition-all hover:bg-gold-950/20 hover:text-gold-400 hover:border-gold-500/30 cursor-pointer"
                      title="Ver Expediente Completo"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-edit-student-${student.id}`}
                      onClick={() => startEdit(student)}
                      className="inline-flex rounded-lg bg-zinc-900 p-2 text-zinc-400 border border-zinc-800 transition-all hover:text-white hover:border-gold-500/30 cursor-pointer"
                      title="Editar Alumno"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-delete-student-${student.id}`}
                      onClick={async () => {
                        const confirmed = await showConfirm(
                          `¿Seguro que desea eliminar por completo a ${student.nombre}? Se quitará su registro.`,
                          { title: 'Eliminar Alumno', confirmLabel: 'Sí, eliminar', cancelLabel: 'Cancelar', isDanger: true }
                        );
                        if (confirmed) {
                          onDeleteStudent(student.id);
                        }
                      }}
                      className="inline-flex rounded-lg bg-zinc-900 p-2 text-rose-500 border border-zinc-800 transition-all hover:bg-rose-950/20 hover:text-rose-400 cursor-pointer"
                      title="Eliminar Alumno"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: ADD NEW STUDENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gold-950/75 backdrop-blur-sm animate-fade-in flex justify-center items-start p-2 sm:p-4 md:p-6">
          <div className="relative w-full max-w-5xl rounded-2xl border border-gold-700/60 bg-[#0d0903] p-6 md:p-8 shadow-2xl gold-glow-intense my-4 md:my-8">
            <div className="flex items-center justify-between border-b border-gold-900/50 pb-3">
              <h3 className="font-display text-base font-bold text-gold-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-500 animate-pulse" />
                Inscribir Nuevo Alumno
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-gold-500/80 hover:text-white hover:bg-gold-900/50 transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewStudentSubmit} className="mt-4 space-y-4">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* COLUMNA IZQUIERDA: DATOS GENERALES Y ACADEMIA */}
                <div className="space-y-4">
                  {/* SECTION 1: DATOS GENERALES DEL ALUMNO */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-gold-900/50 pb-1">
                      1. Información Personal del Alumno
                    </h4>

                    {/* FOTO DE PERFIL DEL ALUMNO */}
                    <div className="bg-gold-950/10 p-3 rounded-xl border border-gold-900/30">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gold-400 mb-2">Foto de Perfil del Alumno (Opcional)</label>
                      <div className="flex items-center gap-4">
                        {foto ? (
                          <div className="relative">
                            <img src={foto} alt="Vista previa alumno" className="h-16 w-16 rounded-full object-cover border border-gold-500" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setFoto('')}
                              className="absolute -top-1 -right-1 rounded-full bg-rose-950 text-rose-400 p-0.5 border border-rose-900 hover:bg-rose-900 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gold-950/30 border border-dashed border-gold-800/50 flex flex-col items-center justify-center text-gold-500/80">
                            <Camera className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 px-3 py-1.5 text-xs text-gold-300 border border-gold-500/20 cursor-pointer transition-colors">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Subir Imagen</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setFoto(reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <p className="text-[10px] text-zinc-500 mt-1">Formatos JPG, PNG o WebP. Imagen cuadrada recomendada.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Nombres y Apellidos del Alumno *</label>
                        <input
                          id="add-student-nombre"
                          type="text"
                          required
                          placeholder="Ej. Ana Victoria Marín"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Cédula o Pasaporte</label>
                        <input
                          id="add-student-cedula"
                          type="text"
                          placeholder="Ej. 402-1234567-8"
                          value={cedulaPasaporte}
                          onChange={(e) => setCedulaPasaporte(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                        <span className="text-[9px] text-gold-500/70 mt-0.5 block">Si es menor, registrar sólo del tutor</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Fecha de Nacimiento</label>
                        <input
                          id="add-student-nacimiento"
                          type="date"
                          value={fechaNacimiento}
                          onChange={(e) => handleBirthdateChange(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Edad Actual *</label>
                        <input
                          id="add-student-edad"
                          type="number"
                          required
                          min={1}
                          max={100}
                          value={edad}
                          onChange={(e) => setEdad(Number(e.target.value))}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Correo Electrónico</label>
                        <input
                          id="add-student-correo"
                          type="email"
                          placeholder="ejemplo@correo.com"
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Teléfono Personal (RD) *</label>
                        <input
                          id="add-student-telef-personal"
                          type="text"
                          required
                          placeholder="Ej. 809-555-0100"
                          value={telefonoPersonal}
                          onChange={(e) => {
                            setTelefonoPersonal(e.target.value);
                            setContacto(e.target.value); // Keep in sync for fallback
                          }}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Teléfono de Referencia</label>
                        <input
                          id="add-student-telef-referencia"
                          type="text"
                          placeholder="Ej. 829-555-0200"
                          value={telefonoReferencia}
                          onChange={(e) => setTelefonoReferencia(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: DATOS DEL REPRESENTANTE */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-gold-900/50 pb-1">
                      2. Representante {edad < 18 && <span className="text-rose-400 font-semibold">(Requerido - Menor de edad)</span>}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Nombres y Apellidos del Representante</label>
                        <input
                          id="add-student-representante"
                          type="text"
                          placeholder="Ej. Juan Carlos Marín (Padre/Madre/Tutor)"
                          value={representante}
                          onChange={(e) => setRepresentante(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                      </div>

                      {edad < 18 && (
                        <div className="bg-gold-950/25 p-3 rounded-xl border border-gold-900/30 space-y-2 animate-fade-in">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gold-400">Foto del Representante (Opcional)</label>
                          <div className="flex items-center gap-3">
                            {representanteFoto ? (
                              <div className="relative">
                                <img src={representanteFoto} alt="Vista previa representante" className="h-14 w-14 rounded-full object-cover border border-gold-500/50" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setRepresentanteFoto('')}
                                  className="absolute -top-1 -right-1 rounded-full bg-rose-950 text-rose-400 p-0.5 border border-rose-900 hover:bg-rose-900 transition-colors"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-gold-950/40 border border-dashed border-gold-800/40 flex flex-col items-center justify-center text-gold-500/60">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <label className="inline-flex items-center gap-1 rounded-md bg-gold-500/10 hover:bg-gold-500/20 px-2.5 py-1 text-[11px] text-gold-300 border border-gold-500/20 cursor-pointer transition-colors">
                                <Upload className="h-3 w-3" />
                                <span>Subir Foto del Representante</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setRepresentanteFoto(reader.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <p className="text-[10px] text-zinc-500 mt-1">Sube la foto de identificación del tutor.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 3: DATOS DE INSCRIPCION Y CLASE */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-gold-900/50 pb-1">
                      3. Datos Académicos y Horarios
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-1">Disciplinas / Ritmos de Interés *</label>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-[#130f06]/40 rounded-lg border border-gold-900/40 mb-2">
                          {PREDEFINED_RITMOS.map(r => {
                            const isSelected = selectedRitmos.includes(r);
                            return (
                              <button
                                type="button"
                                key={r}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedRitmos(selectedRitmos.filter(x => x !== r));
                                  } else {
                                    setSelectedRitmos([...selectedRitmos, r]);
                                  }
                                }}
                                className={`px-2 py-1 rounded-md text-[11px] transition-all font-medium border cursor-pointer flex items-center gap-1 ${
                                  isSelected 
                                    ? 'bg-gold-500 text-white border-gold-400 font-semibold shadow-sm' 
                                    : 'bg-gold-950/10 text-gold-300 border-gold-900/30 hover:bg-gold-950/30'
                                }`}
                              >
                                {r}
                                {isSelected && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Otro ritmo personalizado..."
                            value={customRitmoInput}
                            onChange={(e) => setCustomRitmoInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = customRitmoInput.trim();
                                if (trimmed && !selectedRitmos.includes(trimmed)) {
                                  setSelectedRitmos([...selectedRitmos, trimmed]);
                                }
                                setCustomRitmoInput('');
                              }
                            }}
                            className="flex-1 rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-xs text-white outline-none focus:border-gold-500 placeholder-gold-700/60 font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = customRitmoInput.trim();
                              if (trimmed && !selectedRitmos.includes(trimmed)) {
                                setSelectedRitmos([...selectedRitmos, trimmed]);
                              }
                              setCustomRitmoInput('');
                            }}
                            className="px-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-xs font-bold text-white transition-colors cursor-pointer"
                          >
                            Agregar
                          </button>
                        </div>
                        {selectedRitmos.length > 0 && (
                          <div className="text-[10px] text-gold-400 mt-2">
                            Seleccionados: <strong className="text-white font-semibold">{selectedRitmos.join(', ')}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Nivel Inicial *</label>
                        <select
                          id="add-student-nivel"
                          value={nivel}
                          onChange={(e) => setNivel(e.target.value as any)}
                          className="w-full rounded-lg border border-gold-800/60 bg-[#130f06] p-2 text-sm text-white outline-none focus:border-gold-500 cursor-pointer"
                        >
                          <option value="Principiante">Principiante</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Horario de Clases</label>
                        <input
                          id="add-student-horario"
                          type="text"
                          placeholder="Ej. Lunes-Miércoles 6:00 PM"
                          value={horarioClases}
                          onChange={(e) => setHorarioClases(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Fecha de Ingreso *</label>
                        <input
                          id="add-student-fecha-ingreso"
                          type="date"
                          required
                          value={fechaInscripcion}
                          onChange={(e) => setFechaInscripcion(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Fecha Culminación (Opcional)</label>
                        <input
                          id="add-student-fecha-culminacion"
                          type="date"
                          value={fechaCulminacion}
                          onChange={(e) => setFechaCulminacion(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: CONFIGURACIÓN DE PAGO Y OBSERVACIONES */}
                <div className="space-y-4">
                  {/* SECTION 4: DATOS DE PAGO Y PLAN FINANCIERO */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-gold-900/50 pb-1">
                      4. Configuración de Pagos (Inscripción y Mensualidad)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Registro Inscripcion */}
                      <div className="bg-gold-950/15 p-3.5 rounded-xl border border-gold-800/40 space-y-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase text-gold-500/85 block tracking-wider">Pago de Inscripción Inicial</span>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Monto Inicial (RD$)</label>
                            <input
                              id="add-student-monto-pago"
                              type="number"
                              placeholder="Ej. 1500"
                              value={montoPagoInicial}
                              onChange={(e) => setMontoPagoInicial(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Fecha Pago Inicial</label>
                            <input
                              id="add-student-fecha-pago"
                              type="date"
                              value={fechaPagoInicial}
                              onChange={(e) => setFechaPagoInicial(e.target.value)}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Registro Mensualidad */}
                      <div className="bg-gold-950/15 p-3.5 rounded-xl border border-gold-800/40 space-y-3 col-span-1 md:col-span-2">
                        <span className="text-[10px] font-bold uppercase text-gold-500/85 block tracking-wider">Plan de Mensualidad Recurrente</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Frecuencia de Pago *</label>
                            <select
                              id="add-student-plan-pago"
                              value={planPago}
                              onChange={(e) => setPlanPago(e.target.value as any)}
                              className="w-full rounded-lg border border-gold-800/60 bg-[#130f06] p-2 text-sm text-white outline-none focus:border-gold-500 cursor-pointer"
                            >
                              <option value="Mensual">Mensual</option>
                              <option value="Trimestral">Trimestral (Cada 3 meses)</option>
                              <option value="Semestral">Semestral (Cada 6 meses)</option>
                              <option value="Pago Único">Pago Único (Un solo pago)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Fecha Próximo Pago</label>
                            <input
                              id="add-student-fecha-mensualidad"
                              type="date"
                              value={fechaPagoMensualidad}
                              onChange={(e) => setFechaPagoMensualidad(e.target.value)}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Monto Base de Mensualidad (RD$)</label>
                            <input
                              id="add-student-monto-mensualidad"
                              type="number"
                              placeholder="Ej. 2500"
                              value={montoMensualidad}
                              onChange={(e) => setMontoMensualidad(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Aplicar Descuento</label>
                            <div className="flex gap-1">
                              <select
                                value={descuentoTipo}
                                onChange={(e) => setDescuentoTipo(e.target.value as any)}
                                className="rounded-lg border border-gold-800/60 bg-[#130f06] p-2 text-xs text-white outline-none focus:border-gold-500 cursor-pointer w-20"
                              >
                                <option value="Fijo">RD$</option>
                                <option value="Porcentaje">%</option>
                              </select>
                              <input
                                id="add-student-descuento-valor"
                                type="number"
                                placeholder="Ej. 500"
                                value={descuentoValor}
                                onChange={(e) => setDescuentoValor(e.target.value === '' ? '' : Number(e.target.value))}
                                className="flex-1 rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live calculation summary */}
                        {montoMensualidad !== '' && (
                          <div className="mt-2 p-2 bg-[#130f06]/60 rounded-lg border border-gold-900/20 flex justify-between items-center text-xs animate-fade-in">
                            <div>
                              <span className="text-gold-200 font-medium">Monto Original:</span>{' '}
                              <span className="text-zinc-400 line-through">RD$ {Number(montoMensualidad).toLocaleString('es-DO')}</span>
                              {descuentoValor ? (
                                <span className="ml-1.5 text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px]">
                                  Ahorro: {descuentoTipo === 'Porcentaje' ? `${descuentoValor}%` : `RD$ ${descuentoValor}`}
                                </span>
                              ) : null}
                            </div>
                            <div>
                              <span className="text-gold-100 font-bold">Monto Final:</span>{' '}
                              <span className="text-white font-extrabold font-mono text-sm">
                                RD$ {computedDiscountedMonto.toLocaleString('es-DO')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: PROMOCION 2x1 (ACOMPAÑANTE GRATIS) */}
                  <div className="space-y-3 bg-gold-950/10 p-4 rounded-xl border border-gold-900/30">
                    <div className="flex items-center justify-between pb-1 border-b border-gold-900/40">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-gold-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                          5. Promoción 2x1 (Acompañante Gratis)
                        </h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          id="add-student-es2x1"
                          checked={es2x1}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setEs2x1(val);
                            if (val) {
                              setAcompananteFechaVencimiento(calculateOneMonthLater(fechaInscripcion));
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500 peer-checked:after:bg-white peer-checked:after:border-gold-600"></div>
                      </label>
                    </div>

                    <p className="text-[11px] text-gold-200/60 leading-relaxed">
                      Active esta casilla si el alumno se inscribe bajo la promoción de 2x1. Permite registrar a un acompañante para ingresar gratis por el primer mes de clases.
                    </p>

                    {es2x1 && (
                      <div className="space-y-3 pt-2 animate-fade-in">
                        {/* FOTO DE PERFIL DEL ACOMPAÑANTE */}
                        <div className="bg-gold-950/20 p-3 rounded-lg border border-gold-900/20">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gold-400/90 mb-2">Foto del Acompañante (Opcional)</label>
                          <div className="flex items-center gap-3">
                            {acompananteFoto ? (
                              <div className="relative">
                                <img src={acompananteFoto} alt="Vista previa acompañante" className="h-14 w-14 rounded-full object-cover border border-gold-500/50" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setAcompananteFoto('')}
                                  className="absolute -top-1 -right-1 rounded-full bg-rose-950 text-rose-400 p-0.5 border border-rose-900 hover:bg-rose-900 transition-colors"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-gold-950/40 border border-dashed border-gold-800/40 flex flex-col items-center justify-center text-gold-500/60">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <label className="inline-flex items-center gap-1 rounded-md bg-gold-500/10 hover:bg-gold-500/20 px-2 py-1 text-[11px] text-gold-300 border border-gold-500/20 cursor-pointer transition-colors">
                                <Upload className="h-3 w-3" />
                                <span>Subir Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setAcompananteFoto(reader.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Nombre Completo del Acompañante *</label>
                          <input
                            id="add-student-acompanante-nombre"
                            type="text"
                            required={es2x1}
                            placeholder="Ej. Roberto Díaz"
                            value={acompananteNombre}
                            onChange={(e) => setAcompananteNombre(e.target.value)}
                            className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Cédula o Pasaporte del Acompañante</label>
                            <input
                              id="add-student-acompanante-cedula"
                              type="text"
                              placeholder="Ej. 001-0000000-0"
                              value={acompananteCedula}
                              onChange={(e) => setAcompananteCedula(e.target.value)}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Teléfono del Acompañante</label>
                            <input
                              id="add-student-acompanante-telefono"
                              type="text"
                              placeholder="Ej. 809-555-5555"
                              value={acompananteTelefono}
                              onChange={(e) => setAcompananteTelefono(e.target.value)}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Correo Electrónico</label>
                            <input
                              id="add-student-acompanante-correo"
                              type="email"
                              placeholder="acompanante@correo.com"
                              value={acompananteCorreo}
                              onChange={(e) => setAcompananteCorreo(e.target.value)}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Fecha Vencimiento Mes de Gracia *</label>
                            <input
                              id="add-student-acompanante-vence"
                              type="date"
                              required={es2x1}
                              value={acompananteFechaVencimiento}
                              onChange={(e) => setAcompananteFechaVencimiento(e.target.value)}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                            />
                            <span className="text-[9px] text-gold-500/70 mt-0.5 block">Se calcula automáticamente como 1 mes posterior al ingreso</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Contacto de Referencia / Familiar</label>
                          <input
                            id="add-student-acompanante-contacto"
                            type="text"
                            placeholder="Ej. María Díaz (Madre) - 829-555-1212"
                            value={acompananteContacto}
                            onChange={(e) => setAcompananteContacto(e.target.value)}
                            className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Horario de Clases del Acompañante</label>
                          <input
                            id="add-student-acompanante-horario"
                            type="text"
                            placeholder="Ej. Martes-Jueves 7:00 PM"
                            value={acompananteHorarioClases}
                            onChange={(e) => setAcompananteHorarioClases(e.target.value)}
                            className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 6: OBSERVACIONES */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-gold-900/50 pb-1">
                      6. Observaciones adicionales u Notas
                    </h4>
                    <div>
                      <textarea
                        id="add-student-observaciones"
                        rows={2.5}
                        placeholder="Escriba condiciones médicas relevantes, observaciones del nivel anterior, preferencias de música..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 resize-none font-sans placeholder-gold-700/60"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Form buttons */}
              <div className="mt-4 flex justify-end gap-3 pt-3 border-t border-gold-900/40">
                <button
                  id="btn-add-student-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg bg-gold-950 border border-gold-700/40 px-4 py-2 text-xs text-gold-300 hover:bg-gold-900 transition-all font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-add-student-submit"
                  type="submit"
                  className="rounded-lg bg-gold-500 px-5 py-2 text-xs font-bold text-white hover:bg-gold-400 shadow-md shadow-gold-500/10 transition-all cursor-pointer"
                >
                  Confirmar e Inscribir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm animate-fade-in flex justify-center items-start p-2 sm:p-4 md:p-6">
          <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl gold-glow-intense my-4 md:my-8">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-gold-500" />
                Editar Ficha de Alumno
              </h3>
              <button 
                onClick={() => setEditingStudent(null)}
                className="rounded-lg p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* COLUMNA IZQUIERDA: DATOS GENERALES Y ACADEMIA */}
                <div className="space-y-4">
                  {/* SECTION 1: DATOS GENERALES DEL ALUMNO */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-zinc-900 pb-1">
                      1. Información Personal del Alumno
                    </h4>

                    {/* FOTO DE PERFIL DEL ALUMNO */}
                    <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gold-400 mb-2">Foto de Perfil del Alumno (Opcional)</label>
                      <div className="flex items-center gap-4">
                        {editingStudent.foto ? (
                          <div className="relative">
                            <img src={editingStudent.foto} alt="Vista previa alumno" className="h-16 w-16 rounded-full object-cover border border-gold-500" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setEditingStudent({ ...editingStudent, foto: undefined })}
                              className="absolute -top-1 -right-1 rounded-full bg-rose-950 text-rose-400 p-0.5 border border-rose-900 hover:bg-rose-900 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-zinc-900 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500">
                            <Camera className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 border border-zinc-750 cursor-pointer transition-colors">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Cambiar Imagen</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setEditingStudent({ ...editingStudent, foto: reader.result as string });
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <p className="text-[10px] text-zinc-500 mt-1">Formatos JPG, PNG o WebP. Imagen cuadrada recomendada.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nombres y Apellidos del Alumno *</label>
                        <input
                          id="edit-student-nombre"
                          type="text"
                          required
                          value={editingStudent.nombre}
                          onChange={(e) => setEditingStudent({ ...editingStudent, nombre: e.target.value })}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Cédula o Pasaporte</label>
                        <input
                          id="edit-student-cedula"
                          type="text"
                          value={editingStudent.cedulaPasaporte || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, cedulaPasaporte: e.target.value })}
                          placeholder="Ej. 402-1234567-8"
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha de Nacimiento</label>
                        <input
                          id="edit-student-nacimiento"
                          type="date"
                          value={editingStudent.fechaNacimiento || ''}
                          onChange={(e) => handleBirthdateChangeForEdit(e.target.value)}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Edad Actual *</label>
                        <input
                          id="edit-student-edad"
                          type="number"
                          required
                          min={1}
                          max={100}
                          value={editingStudent.edad}
                          onChange={(e) => setEditingStudent({ ...editingStudent, edad: Number(e.target.value) })}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Correo Electrónico</label>
                        <input
                          id="edit-student-correo"
                          type="email"
                          value={editingStudent.correo || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, correo: e.target.value })}
                          placeholder="ejemplo@correo.com"
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Teléfono Personal *</label>
                        <input
                          id="edit-student-telef-personal"
                          type="text"
                          required
                          value={editingStudent.telefonoPersonal || editingStudent.contacto || ''}
                          onChange={(e) => setEditingStudent({ 
                            ...editingStudent, 
                            telefonoPersonal: e.target.value,
                            contacto: e.target.value // Keep in sync for compatibility
                          })}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Teléfono de Referencia</label>
                        <input
                          id="edit-student-telef-referencia"
                          type="text"
                          value={editingStudent.telefonoReferencia || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, telefonoReferencia: e.target.value })}
                          placeholder="Ej. 829-555-0200"
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: DATOS DEL REPRESENTANTE */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-zinc-900 pb-1">
                      2. Representante {editingStudent.edad < 18 && <span className="text-rose-400 font-semibold">(Requerido - Menor de edad)</span>}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nombres y Apellidos del Representante</label>
                        <input
                          id="edit-student-representante"
                          type="text"
                          value={editingStudent.representante || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, representante: e.target.value })}
                          placeholder="Ej. Juan Carlos Marín (Padre/Madre/Tutor)"
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55"
                        />
                      </div>

                      {editingStudent.edad < 18 && (
                        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 space-y-2 animate-fade-in">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gold-400">Foto del Representante (Opcional)</label>
                          <div className="flex items-center gap-3">
                            {editingStudent.representanteFoto ? (
                              <div className="relative">
                                <img src={editingStudent.representanteFoto} alt="Vista previa representante" className="h-14 w-14 rounded-full object-cover border border-gold-500/50" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setEditingStudent({ ...editingStudent, representanteFoto: undefined })}
                                  className="absolute -top-1 -right-1 rounded-full bg-rose-950 text-rose-400 p-0.5 border border-rose-900 hover:bg-rose-900 transition-colors"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-zinc-900 border border-dashed border-zinc-850 flex flex-col items-center justify-center text-zinc-500">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <label className="inline-flex items-center gap-1 rounded-md bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 border border-zinc-750 cursor-pointer transition-colors">
                                <Upload className="h-3 w-3" />
                                <span>Cambiar Foto del Representante</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setEditingStudent({ ...editingStudent, representanteFoto: reader.result as string });
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <p className="text-[10px] text-zinc-500 mt-1">Sube la foto de identificación del tutor.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 3: DATOS DE INSCRIPCION Y CLASE */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-zinc-900 pb-1">
                      3. Datos Académicos y Horarios
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Disciplinas / Ritmos de Interés *</label>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-900/50 rounded-lg border border-zinc-850 mb-2">
                          {PREDEFINED_RITMOS.map(r => {
                            const isSelected = editSelectedRitmos.includes(r);
                            return (
                              <button
                                type="button"
                                key={r}
                                onClick={() => {
                                  if (isSelected) {
                                    setEditSelectedRitmos(editSelectedRitmos.filter(x => x !== r));
                                  } else {
                                    setEditSelectedRitmos([...editSelectedRitmos, r]);
                                  }
                                }}
                                className={`px-2 py-1 rounded-md text-[11px] transition-all font-medium border cursor-pointer flex items-center gap-1 ${
                                  isSelected 
                                    ? 'bg-gold-500 text-white border-gold-400 font-semibold shadow-sm' 
                                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                                }`}
                              >
                                {r}
                                {isSelected && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Otro ritmo personalizado..."
                            value={editCustomRitmoInput}
                            onChange={(e) => setEditCustomRitmoInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = editCustomRitmoInput.trim();
                                if (trimmed && !editSelectedRitmos.includes(trimmed)) {
                                  setEditSelectedRitmos([...editSelectedRitmos, trimmed]);
                                }
                                setEditCustomRitmoInput('');
                              }
                            }}
                            className="flex-1 rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500/55 placeholder-zinc-600 font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = editCustomRitmoInput.trim();
                              if (trimmed && !editSelectedRitmos.includes(trimmed)) {
                                setEditSelectedRitmos([...editSelectedRitmos, trimmed]);
                              }
                              setEditCustomRitmoInput('');
                            }}
                            className="px-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-xs font-bold text-white transition-colors cursor-pointer"
                          >
                            Agregar
                          </button>
                        </div>
                        {editSelectedRitmos.length > 0 && (
                          <div className="text-[10px] text-zinc-400 mt-2">
                            Seleccionados: <strong className="text-white font-semibold">{editSelectedRitmos.join(', ')}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nivel *</label>
                        <select
                          id="edit-student-nivel"
                          value={editingStudent.nivel}
                          onChange={(e) => setEditingStudent({ ...editingStudent, nivel: e.target.value as any })}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                        >
                          <option value="Principiante">Principiante</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Horario de Clases</label>
                        <input
                          id="edit-student-horario"
                          type="text"
                          value={editingStudent.horarioClases || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, horarioClases: e.target.value })}
                          placeholder="Ej. Lunes-Miércoles 6:00 PM"
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha de Ingreso *</label>
                        <input
                          id="edit-student-fecha"
                          type="date"
                          required
                          value={editingStudent.fechaInscripcion}
                          onChange={(e) => setEditingStudent({ ...editingStudent, fechaInscripcion: e.target.value })}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha Culminación (Opcional)</label>
                        <input
                          id="edit-student-fecha-culminacion"
                          type="date"
                          value={editingStudent.fechaCulminacion || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, fechaCulminacion: e.target.value })}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: CONFIGURACIÓN DE PAGO Y OBSERVACIONES */}
                <div className="space-y-4">
                  {/* SECTION 4: DATOS DE PAGO Y PLAN FINANCIERO */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-zinc-900 pb-1">
                      4. Configuración de Pagos (Inscripción y Mensualidad)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Registro Inscripcion */}
                      <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/80 space-y-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase text-gold-500/85 block tracking-wider">Pago de Inscripción Inicial</span>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Monto Inicial (RD$)</label>
                            <input
                              id="edit-student-monto-pago"
                              type="number"
                              placeholder="Ej. 1500"
                              value={editingStudent.montoPagoInicial || ''}
                              onChange={(e) => setEditingStudent({
                                ...editingStudent,
                                montoPagoInicial: e.target.value === '' ? undefined : Number(e.target.value)
                              })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha Pago Inicial</label>
                            <input
                              id="edit-student-fecha-pago"
                              type="date"
                              value={editingStudent.fechaPagoInicial || ''}
                              onChange={(e) => setEditingStudent({
                                ...editingStudent,
                                fechaPagoInicial: e.target.value
                              })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Registro Mensualidad */}
                      <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/80 space-y-3 col-span-1 md:col-span-2">
                        <span className="text-[10px] font-bold uppercase text-gold-500/85 block tracking-wider">Plan de Mensualidad Recurrente</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Frecuencia de Pago *</label>
                            <select
                              id="edit-student-plan-pago"
                              value={editingStudent.planPago || 'Mensual'}
                              onChange={(e) => setEditingStudent({
                                ...editingStudent,
                                planPago: e.target.value as any
                              })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                            >
                              <option value="Mensual">Mensual</option>
                              <option value="Trimestral">Trimestral (Cada 3 meses)</option>
                              <option value="Semestral">Semestral (Cada 6 meses)</option>
                              <option value="Pago Único">Pago Único (Un solo pago)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha Pago Mensualidad</label>
                            <input
                              id="edit-student-fecha-mensualidad"
                              type="date"
                              value={editingStudent.fechaPagoMensualidad || ''}
                              onChange={(e) => setEditingStudent({
                                ...editingStudent,
                                fechaPagoMensualidad: e.target.value
                              })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Monto Base de Mensualidad (RD$)</label>
                            <input
                              id="edit-student-monto-mensualidad"
                              type="number"
                              placeholder="Ej. 2500"
                              value={editingStudent.montoMensualidad !== undefined ? editingStudent.montoMensualidad : ''}
                              onChange={(e) => setEditingStudent({
                                ...editingStudent,
                                montoMensualidad: e.target.value === '' ? undefined : Number(e.target.value)
                              })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55 placeholder-zinc-650"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Aplicar Descuento</label>
                            <div className="flex gap-1">
                              <select
                                value={editingStudent.descuentoTipo || 'Fijo'}
                                onChange={(e) => setEditingStudent({
                                  ...editingStudent,
                                  descuentoTipo: e.target.value as any
                                })}
                                className="rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-gold-500/55 cursor-pointer w-20"
                              >
                                <option value="Fijo">RD$</option>
                                <option value="Porcentaje">%</option>
                              </select>
                              <input
                                id="edit-student-descuento-valor"
                                type="number"
                                placeholder="Ej. 500"
                                value={editingStudent.descuentoValor !== undefined && editingStudent.descuentoValor !== null ? editingStudent.descuentoValor : ''}
                                onChange={(e) => setEditingStudent({
                                  ...editingStudent,
                                  descuentoValor: e.target.value === '' ? undefined : Number(e.target.value)
                                })}
                                className="flex-1 rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55 placeholder-zinc-650"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live calculation summary */}
                        {editingStudent.montoMensualidad !== undefined && editingStudent.montoMensualidad !== null && (
                          <div className="mt-2 p-2 bg-zinc-955/60 rounded-lg border border-zinc-800 flex justify-between items-center text-xs animate-fade-in">
                            <div>
                              <span className="text-zinc-400 font-medium">Monto Original:</span>{' '}
                              <span className="text-zinc-500 line-through">RD$ {Number(editingStudent.montoMensualidad).toLocaleString('es-DO')}</span>
                              {editingStudent.descuentoValor ? (
                                <span className="ml-1.5 text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px]">
                                  Ahorro: {editingStudent.descuentoTipo === 'Porcentaje' ? `${editingStudent.descuentoValor}%` : `RD$ ${editingStudent.descuentoValor}`}
                                </span>
                              ) : null}
                            </div>
                            <div>
                              <span className="text-gold-200 font-bold">Monto Final:</span>{' '}
                              <span className="text-white font-extrabold font-mono text-sm">
                                RD$ {computedEditDiscountedMonto.toLocaleString('es-DO')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: PROMOCION 2x1 (ACOMPAÑANTE GRATIS) */}
                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-gold-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                          5. Promoción 2x1 (Acompañante Gratis)
                        </h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          id="edit-student-es2x1"
                          checked={editingStudent.es2x1 || false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setEditingStudent({
                              ...editingStudent,
                              es2x1: val,
                              acompananteFechaVencimiento: val && !editingStudent.acompananteFechaVencimiento 
                                ? calculateOneMonthLater(editingStudent.fechaInscripcion)
                                : editingStudent.acompananteFechaVencimiento
                            });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500 peer-checked:after:bg-white peer-checked:after:border-gold-600"></div>
                      </label>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Active esta casilla si el alumno se inscribe bajo la promoción de 2x1. Permite registrar a un acompañante para ingresar gratis por el primer mes de clases.
                    </p>

                    {editingStudent.es2x1 && (
                      <div className="space-y-3 pt-2 animate-fade-in">
                        {/* FOTO DE PERFIL DEL ACOMPAÑANTE */}
                        <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gold-400/90 mb-2">Foto del Acompañante (Opcional)</label>
                          <div className="flex items-center gap-3">
                            {editingStudent.acompananteFoto ? (
                              <div className="relative">
                                <img src={editingStudent.acompananteFoto} alt="Vista previa acompañante" className="h-14 w-14 rounded-full object-cover border border-gold-500/50" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setEditingStudent({ ...editingStudent, acompananteFoto: undefined })}
                                  className="absolute -top-1 -right-1 rounded-full bg-rose-950 text-rose-400 p-0.5 border border-rose-900 hover:bg-rose-900 transition-colors"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-zinc-900 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <label className="inline-flex items-center gap-1 rounded-md bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-[11px] text-zinc-300 border border-zinc-750 cursor-pointer transition-colors">
                                <Upload className="h-3 w-3" />
                                <span>Subir Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setEditingStudent({ ...editingStudent, acompananteFoto: reader.result as string });
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nombre Completo del Acompañante *</label>
                          <input
                            id="edit-student-acompanante-nombre"
                            type="text"
                            required={editingStudent.es2x1}
                            placeholder="Ej. Roberto Díaz"
                            value={editingStudent.acompananteNombre || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, acompananteNombre: e.target.value })}
                            className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-zinc-600"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Cédula o Pasaporte del Acompañante</label>
                            <input
                              id="edit-student-acompanante-cedula"
                              type="text"
                              placeholder="Ej. 001-0000000-0"
                              value={editingStudent.acompananteCedula || ''}
                              onChange={(e) => setEditingStudent({ ...editingStudent, acompananteCedula: e.target.value })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-zinc-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Teléfono del Acompañante</label>
                            <input
                              id="edit-student-acompanante-telefono"
                              type="text"
                              placeholder="Ej. 809-555-5555"
                              value={editingStudent.acompananteTelefono || ''}
                              onChange={(e) => setEditingStudent({ ...editingStudent, acompananteTelefono: e.target.value })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-zinc-600"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Correo Electrónico</label>
                            <input
                              id="edit-student-acompanante-correo"
                              type="email"
                              placeholder="acompanante@correo.com"
                              value={editingStudent.acompananteCorreo || ''}
                              onChange={(e) => setEditingStudent({ ...editingStudent, acompananteCorreo: e.target.value })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500 placeholder-zinc-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha Vencimiento Mes de Gracia *</label>
                            <input
                              id="edit-student-acompanante-vence"
                              type="date"
                              required={editingStudent.es2x1}
                              value={editingStudent.acompananteFechaVencimiento || ''}
                              onChange={(e) => setEditingStudent({ ...editingStudent, acompananteFechaVencimiento: e.target.value })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Contacto de Referencia / Familiar</label>
                          <input
                            id="edit-student-acompanante-contacto"
                            type="text"
                            placeholder="Ej. María Díaz (Madre) - 829-555-1212"
                            value={editingStudent.acompananteContacto || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, acompananteContacto: e.target.value })}
                            className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-zinc-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Horario de Clases del Acompañante</label>
                          <input
                            id="edit-student-acompanante-horario"
                            type="text"
                            placeholder="Ej. Martes-Jueves 7:00 PM"
                            value={editingStudent.acompananteHorarioClases || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, acompananteHorarioClases: e.target.value })}
                            className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-zinc-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 6: OBSERVACIONES */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-zinc-900 pb-1">
                      6. Observaciones adicionales u Notas
                    </h4>
                    <div>
                      <textarea
                        id="edit-student-observaciones"
                        rows={2.5}
                        value={editingStudent.observaciones || ''}
                        onChange={(e) => setEditingStudent({ ...editingStudent, observaciones: e.target.value })}
                        placeholder="Escriba observaciones, notas o condiciones..."
                        className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55 resize-none font-sans"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Form buttons */}
              <div className="mt-4 flex justify-end gap-3 pt-3 border-t border-zinc-900">
                <button
                  id="btn-edit-student-cancel"
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-xs text-white hover:bg-zinc-850 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-edit-student-submit"
                  type="submit"
                  className="rounded-lg bg-gold-500 px-5 py-2 text-xs font-bold text-white hover:bg-gold-400 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW STUDENT DETAILS DOSSIER */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md animate-fade-in flex justify-center items-start p-2 sm:p-4 md:p-6">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 sm:my-8">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gold-500/10 p-2 text-gold-500 border border-gold-500/20">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Expediente del Alumno</h3>
                  <p className="text-[10px] font-mono text-zinc-500">ID Registro: {selectedStudentDetail.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentDetail(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Profile Card Summary Header */}
              <div className="rounded-xl bg-zinc-900/40 border border-zinc-900 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedStudentDetail.foto ? (
                    <img 
                      src={selectedStudentDetail.foto} 
                      alt={selectedStudentDetail.nombre} 
                      className="h-16 w-16 rounded-full object-cover border-2 border-gold-500/50 shadow-lg shadow-gold-500/10 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-gold-500 flex-shrink-0">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-xl font-bold text-white leading-tight">{selectedStudentDetail.nombre}</h2>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {selectedStudentDetail.ritmo.split(',').map((style, idx) => (
                        <span key={idx} className="inline-flex rounded-full bg-gold-950/20 px-2.5 py-0.5 text-xs font-semibold text-gold-400 border border-gold-500/20">
                          {style.trim()}
                        </span>
                      ))}
                      <span className="inline-flex rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 border border-zinc-800">
                        {selectedStudentDetail.nivel}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        selectedStudentDetail.activo 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-950/20 text-rose-400 border-rose-500/20'
                      }`}>
                        {selectedStudentDetail.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Miembro desde</span>
                  <span className="font-mono text-zinc-300 font-semibold text-sm">{selectedStudentDetail.fechaInscripcion}</span>
                </div>
              </div>

              {/* dossier content grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* col 1: info personal */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/80 border-b border-zinc-900 pb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gold-500" />
                    Información Personal
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-zinc-500 block">Edad del alumno</span>
                      <span className="font-semibold text-zinc-200">{selectedStudentDetail.edad} años</span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 block">Fecha de nacimiento</span>
                      <span className="font-semibold text-zinc-200 font-mono">
                        {selectedStudentDetail.fechaNacimiento || <em className="text-zinc-650 font-sans not-italic font-normal">No registrada</em>}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 block">Cédula o pasaporte</span>
                      <span className="font-semibold text-zinc-400 font-mono">
                        {selectedStudentDetail.cedulaPasaporte || <em className="text-zinc-650 font-sans not-italic font-normal">No provisto</em>}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 block">Correo electrónico</span>
                      <span className="font-semibold text-zinc-200 font-mono hover:text-gold-400 transition-colors">
                        {selectedStudentDetail.correo ? (
                          <a href={`mailto:${selectedStudentDetail.correo}`} className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                            {selectedStudentDetail.correo}
                          </a>
                        ) : (
                          <em className="text-zinc-650 font-sans not-italic font-normal">No registrado</em>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* col 2: contacto y familiar */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/80 border-b border-zinc-900 pb-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gold-500" />
                    Contacto y Representación
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-zinc-500 block">Teléfono Personal (RD)</span>
                      <span className="font-semibold text-zinc-200 font-mono text-gold-100">
                        {selectedStudentDetail.telefonoPersonal || selectedStudentDetail.contacto || 'No registrado'}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 block">Nombre del Representante</span>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedStudentDetail.representanteFoto && (
                          <img 
                            src={selectedStudentDetail.representanteFoto} 
                            alt={`Representante de ${selectedStudentDetail.nombre}`} 
                            className="h-8 w-8 rounded-full object-cover border border-gold-500/30 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="font-semibold text-zinc-200">
                          {selectedStudentDetail.representante || <em className="text-zinc-650 font-sans not-italic font-normal">Ninguno (Adulto)</em>}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 block">Teléfono de Referencia (Familiar)</span>
                      <span className="font-semibold text-zinc-300 font-mono">
                        {selectedStudentDetail.telefonoReferencia || <em className="text-zinc-650 font-sans not-italic font-normal">No registrado</em>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: academico y pagos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/80 border-b border-zinc-900 pb-1 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-gold-500" />
                    Ciclo de Academia
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs text-zinc-500 block">Horario de clase asignado</span>
                      <span className="font-semibold text-zinc-200">
                        {selectedStudentDetail.horarioClases || <em className="text-zinc-650 font-sans not-italic font-normal">No asignado</em>}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-zinc-500 block">Fecha de ingreso</span>
                        <span className="font-semibold text-zinc-350 font-mono text-xs">{selectedStudentDetail.fechaInscripcion}</span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 block">Fecha de culminación</span>
                        <span className="font-semibold text-zinc-350 font-mono text-xs">
                          {selectedStudentDetail.fechaCulminacion || <em className="text-zinc-650 font-sans not-italic font-normal">Indefinido</em>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/80 border-b border-zinc-900 pb-1 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                    Inscripción Financiera
                  </h4>
                  
                  <div className="space-y-2 text-sm bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-lg">
                    <div className="flex justify-between items-center text-xs pb-1 border-b border-zinc-900/50">
                      <span className="text-zinc-500">Monto Pago Inicial:</span>
                      <span className="font-semibold font-mono text-zinc-300">
                        {selectedStudentDetail.montoPagoInicial ? `RD$ ${selectedStudentDetail.montoPagoInicial.toLocaleString()}` : 'RD$ 0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-2">
                      <span className="text-zinc-500">Fecha de Pago Inicial:</span>
                      <span className="font-semibold font-mono text-zinc-400">
                        {selectedStudentDetail.fechaPagoInicial || 'No registrada'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 pb-1 border-t border-zinc-900/50">
                      <span className="text-zinc-500">Plan de Facturación:</span>
                      <span className="font-semibold text-zinc-300">
                        {selectedStudentDetail.planPago || 'Mensual'}
                      </span>
                    </div>

                    {selectedStudentDetail.descuentoValor ? (
                      <div className="flex justify-between items-center text-xs pb-1 border-b border-zinc-900/50">
                        <span className="text-zinc-500">Descuento Aplicado:</span>
                        <span className="font-semibold text-emerald-400">
                          {selectedStudentDetail.descuentoTipo === 'Porcentaje' ? `${selectedStudentDetail.descuentoValor}%` : `RD$ ${selectedStudentDetail.descuentoValor.toLocaleString()}`}
                        </span>
                      </div>
                    ) : null}

                    <div className="flex justify-between items-center text-xs pt-1 pb-1 border-b border-zinc-900/50">
                      <span className="text-gold-500/90 font-medium">Cuota del Plan (Con Descuento):</span>
                      <span className="font-bold font-mono text-gold-400">
                        {selectedStudentDetail.montoMensualidad ? `RD$ ${selectedStudentDetail.montoMensualidad.toLocaleString()}` : 'RD$ 0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-zinc-500">Próximo Pago Plan:</span>
                      <span className="font-semibold font-mono text-gold-200">
                        {selectedStudentDetail.fechaPagoMensualidad || 'No registrada'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2x1 Companion Details Section if applicable */}
              {selectedStudentDetail.es2x1 && (
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/80 border-b border-zinc-900 pb-1 flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-gold-500" />
                    Acompañante de Promoción (2x1)
                  </h4>
                  
                  <div className="rounded-xl bg-gold-950/5 border border-gold-500/10 p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-between">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {selectedStudentDetail.acompananteFoto ? (
                        <img 
                          src={selectedStudentDetail.acompananteFoto} 
                          alt={selectedStudentDetail.acompananteNombre} 
                          className="h-14 w-14 rounded-full object-cover border border-gold-500/30 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-gold-500 flex-shrink-0">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      
                      <div className="space-y-1.5 text-center sm:text-left">
                        <h3 className="font-display text-base font-bold text-white">{selectedStudentDetail.acompananteNombre || 'No Registrado'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-400">
                          {selectedStudentDetail.acompananteCedula && (
                            <div>
                              <span className="text-zinc-500 font-sans">Cédula:</span> <span className="font-mono">{selectedStudentDetail.acompananteCedula}</span>
                            </div>
                          )}
                          {selectedStudentDetail.acompananteTelefono && (
                            <div>
                              <span className="text-zinc-500 font-sans">Teléfono:</span> <span className="font-mono text-gold-100">{selectedStudentDetail.acompananteTelefono}</span>
                            </div>
                          )}
                          {selectedStudentDetail.acompananteCorreo && (
                            <div className="sm:col-span-2">
                              <span className="text-zinc-500 font-sans">Correo:</span> <span className="font-mono text-zinc-300">{selectedStudentDetail.acompananteCorreo}</span>
                            </div>
                          )}
                          {selectedStudentDetail.acompananteContacto && (
                            <div className="sm:col-span-2">
                              <span className="text-zinc-500 font-sans">Referencia:</span> <span className="text-zinc-300">{selectedStudentDetail.acompananteContacto}</span>
                            </div>
                          )}
                          {selectedStudentDetail.acompananteHorarioClases && (
                            <div className="sm:col-span-2 text-gold-300/90">
                              <span className="text-zinc-500 font-sans">Horario clase:</span> <span className="font-semibold">{selectedStudentDetail.acompananteHorarioClases}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 mt-3 sm:mt-0">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">Mes de Gracia</span>
                      {(() => {
                        const vencimiento = selectedStudentDetail.acompananteFechaVencimiento;
                        if (!vencimiento) {
                          return <span className="text-xs text-zinc-500">No registrada</span>;
                        }
                        const today = new Date().toISOString().substring(0, 10);
                        const isExpired = today > vencimiento;
                        
                        if (isExpired) {
                          return (
                            <div className="mt-1">
                              <span className="inline-flex rounded-full bg-rose-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
                                Expirado
                              </span>
                              <span className="text-[10px] font-mono text-rose-500/80 block mt-1">Venció: {vencimiento}</span>
                            </div>
                          );
                        } else {
                          const t = new Date().setHours(0,0,0,0);
                          const expiry = new Date(vencimiento + 'T12:00:00').setHours(0,0,0,0);
                          const diffDays = Math.ceil((expiry - t) / (1000 * 60 * 60 * 24));
                          return (
                            <div className="mt-1">
                              <span className="inline-flex rounded-full bg-emerald-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                                Activo ({diffDays} d)
                              </span>
                              <span className="text-[10px] font-mono text-emerald-500/80 block mt-1">Vence: {vencimiento}</span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* observations full-width */}
              {selectedStudentDetail.observaciones && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/80 border-b border-zinc-900 pb-1 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-gold-500" />
                    Notas u Observaciones
                  </h4>
                  <p className="text-sm text-zinc-300 bg-zinc-900/30 border border-zinc-900 p-3 rounded-xl italic leading-relaxed font-sans">
                    "{selectedStudentDetail.observaciones}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end pt-4 border-t border-zinc-900">
              <button
                id="btn-close-dossier"
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="rounded-lg bg-gold-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-gold-400 shadow-md shadow-gold-500/10 cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
