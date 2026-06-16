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
  User
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

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
  const [horarioClases, setHorarioClases] = useState('');
  const [observaciones, setObservaciones] = useState('');

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

    const primaryContact = contacto.trim() || telefonoPersonal.trim() || telefonoReferencia.trim() || 'No provisto';

    onAddStudent({
      nombre: nombre.trim(),
      edad: Number(edad) || 20,
      ritmo: ritmo.trim(),
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
      montoMensualidad: montoMensualidad !== '' ? Number(montoMensualidad) : undefined,
      fechaPagoMensualidad: fechaPagoMensualidad || undefined,
      horarioClases: horarioClases.trim() || undefined,
      observaciones: observaciones.trim() || undefined
    });

    // Reset fields & close modal
    setNombre('');
    setEdad(20);
    setRitmo('Salsa');
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
    setHorarioClases('');
    setObservaciones('');
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
        contacto: primaryContact
      });
      setEditingStudent(null);
    }
  };

  // Unique lists for filtering
  const ritmosList = Array.from(new Set(alumnos.map(a => a.ritmo)));

  // Filter students
  const filteredStudents = alumnos.filter(student => {
    const matchesSearch = student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.contacto.includes(searchTerm);
    const matchesRitmo = filterRitmo === 'Todos' || student.ritmo === filterRitmo;
    const matchesLevel = filterLevel === 'Todos' || student.nivel === filterLevel;
    const matchesStatus = filterStatus === 'Todos' || 
                          (filterStatus === 'Activos' && student.activo) || 
                          (filterStatus === 'Inactivos' && !student.activo);
    
    return matchesSearch && matchesRitmo && matchesLevel && matchesStatus;
  });

  // Open Edit student
  const startEdit = (student: Alumno) => {
    setEditingStudent(student);
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
                    <span id={`student-name-${student.id}`} className="font-display font-bold text-white block">
                      {student.nombre}
                    </span>
                    <span className="text-[10px] font-mono text-gold-500/80">ID: {student.id}</span>
                  </td>
                  <td className="p-4 font-mono">{student.edad} años</td>
                  <td className="p-4">
                    <span className="inline-flex rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-800">
                      {student.ritmo}
                    </span>
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
                      2. Representante (Requerido para Menores)
                    </h4>
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
                  </div>

                  {/* SECTION 3: DATOS DE INSCRIPCION Y CLASE */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-gold-900/50 pb-1">
                      3. Datos Académicos y Horarios
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Ritmo de Interés *</label>
                        <input
                          id="add-student-ritmo"
                          type="text"
                          required
                          placeholder="Ej. Salsa, Bachata"
                          value={ritmo}
                          onChange={(e) => setRitmo(e.target.value)}
                          className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm text-white outline-none focus:border-gold-500 placeholder-gold-700/60"
                        />
                      </div>

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
                      <div className="bg-gold-950/15 p-3.5 rounded-xl border border-gold-800/40 space-y-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase text-gold-500/85 block tracking-wider">Plan de Mensualidad Recurrente</span>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Monto Mensualidad (RD$)</label>
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
                            <label className="block text-[11px] font-semibold text-gold-200/80 mb-0.5">Fecha Pago Mensualidad</label>
                            <input
                              id="add-student-fecha-mensualidad"
                              type="date"
                              value={fechaPagoMensualidad}
                              onChange={(e) => setFechaPagoMensualidad(e.target.value)}
                              className="w-full rounded-lg border border-gold-800/60 bg-gold-950/20 p-2 text-sm font-mono text-white outline-none focus:border-gold-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: OBSERVACIONES */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-gold-900/50 pb-1">
                      5. Observaciones adicionales u Notas
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
                      2. Representante (Requerido para Menores)
                    </h4>
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
                  </div>

                  {/* SECTION 3: DATOS DE INSCRIPCION Y CLASE */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-zinc-900 pb-1">
                      3. Datos Académicos y Horarios
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Ritmo Principal *</label>
                        <input
                          id="edit-student-ritmo"
                          type="text"
                          required
                          value={editingStudent.ritmo}
                          onChange={(e) => setEditingStudent({ ...editingStudent, ritmo: e.target.value })}
                          className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55"
                        />
                      </div>

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
                      <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/80 space-y-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase text-gold-500/85 block tracking-wider">Plan de Mensualidad Recurrente</span>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Monto Mensualidad (RD$)</label>
                            <input
                              id="edit-student-monto-mensualidad"
                              type="number"
                              placeholder="Ej. 2500"
                              value={editingStudent.montoMensualidad || ''}
                              onChange={(e) => setEditingStudent({
                                ...editingStudent,
                                montoMensualidad: e.target.value === '' ? undefined : Number(e.target.value)
                              })}
                              className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2 text-sm text-white outline-none focus:border-gold-500/55"
                            />
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
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: OBSERVACIONES */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500/90 border-b border-zinc-900 pb-1">
                      5. Observaciones adicionales u Notas
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
                <div>
                  <h2 className="font-display text-xl font-bold text-white">{selectedStudentDetail.nombre}</h2>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="inline-flex rounded-full bg-gold-950/20 px-2.5 py-0.5 text-xs font-semibold text-gold-400 border border-gold-500/20">
                      {selectedStudentDetail.ritmo}
                    </span>
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
                      <span className="font-semibold text-zinc-200">
                        {selectedStudentDetail.representante || <em className="text-zinc-650 font-sans not-italic font-normal">Ninguno (Adulto)</em>}
                      </span>
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

                    <div className="flex justify-between items-center text-xs pt-1 pb-1 border-t border-b border-zinc-900/50">
                      <span className="text-gold-500/90 font-medium">Mensualidad Recurrente:</span>
                      <span className="font-bold font-mono text-gold-400">
                        {selectedStudentDetail.montoMensualidad ? `RD$ ${selectedStudentDetail.montoMensualidad.toLocaleString()}` : 'RD$ 0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Próximo Pago Mensualidad:</span>
                      <span className="font-semibold font-mono text-gold-200">
                        {selectedStudentDetail.fechaPagoMensualidad || 'No registrada'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
