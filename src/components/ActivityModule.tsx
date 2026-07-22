/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActividadExtra, InscripcionActividad, Alumno, TicketSettings } from '../types';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Printer, 
  UserPlus, 
  ChevronRight, 
  Image as ImageIcon, 
  Award, 
  Zap, 
  X,
  Tag,
  Check,
  CreditCard,
  UserCheck,
  Building2,
  FileText
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';
import NewDanceLogo from './NewDanceLogo';

interface ActivityModuleProps {
  actividades: ActividadExtra[];
  alumnos: Alumno[];
  ticketSettings: TicketSettings;
  onAddActivity: (activity: Omit<ActividadExtra, 'id' | 'inscritos'>) => void;
  onUpdateActivity: (activity: ActividadExtra) => void;
  onDeleteActivity: (id: string) => void;
  onAddInscripcion: (actividadId: string, inscripcion: Omit<InscripcionActividad, 'id'>) => void;
  onDeleteInscripcion: (actividadId: string, inscripcionId: string) => void;
  onAddIngreso?: (ingreso: { concepto: string; monto: number; fecha: string; metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta'; categoria: 'Eventos'; observaciones?: string }) => void;
}

export default function ActivityModule({
  actividades,
  alumnos,
  ticketSettings,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onAddInscripcion,
  onDeleteInscripcion,
  onAddIngreso
}: ActivityModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedState, setSelectedState] = useState<string>('Todos');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActividadExtra | null>(null);
  
  // Registration / Attendees Modal State
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<ActividadExtra | null>(null);
  const [showInscribirModal, setShowInscribirModal] = useState(false);

  // Print Ticket / Receipt State
  const [ticketToPrint, setTicketToPrint] = useState<{
    actividad: ActividadExtra;
    inscripcion: InscripcionActividad;
  } | null>(null);

  // New Activity Form State
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<ActividadExtra['tipo']>('Tour');
  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [hora, setHora] = useState('');
  const [lugar, setLugar] = useState('');
  const [precio, setPrecio] = useState<number | ''>(2500);
  const [cuposMaximos, setCuposMaximos] = useState<number | ''>(20);
  const [instructorProfesor, setInstructorProfesor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState('');

  // New Inscripción Form State inside modal
  const [insAlumnoId, setInsAlumnoId] = useState('');
  const [insAlumnoNombreManual, setInsAlumnoNombreManual] = useState('');
  const [insMontoPagado, setInsMontoPagado] = useState<number | ''>('');
  const [insEstadoPago, setInsEstadoPago] = useState<'Pagado' | 'Pendiente' | 'Abono Parcial'>('Pagado');
  const [insMetodoPago, setInsMetodoPago] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [insObservaciones, setInsObservaciones] = useState('');

  // Handlers for Activity CRUD
  const handleCreateActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      showAlert('Por favor ingrese el título o nombre de la actividad.', 'Campos incompletos');
      return;
    }
    if (precio === '' || Number(precio) < 0) {
      showAlert('Ingrese un precio válido para la actividad.', 'Precio inválido');
      return;
    }
    if (cuposMaximos === '' || Number(cuposMaximos) <= 0) {
      showAlert('Ingrese un límite de cupos mayor a 0.', 'Cupos inválidos');
      return;
    }

    onAddActivity({
      titulo: titulo.trim(),
      tipo,
      fecha,
      hora: hora.trim() || undefined,
      lugar: lugar.trim() || undefined,
      precio: Number(precio),
      cuposMaximos: Number(cuposMaximos),
      instructorProfesor: instructorProfesor.trim() || undefined,
      estado: 'Abierto',
      descripcion: descripcion.trim() || undefined,
      foto: foto || undefined
    });

    // Reset Form
    setTitulo('');
    setTipo('Tour');
    setFecha(new Date().toISOString().substring(0, 10));
    setHora('');
    setLugar('');
    setPrecio(2500);
    setCuposMaximos(20);
    setInstructorProfesor('');
    setDescripcion('');
    setFoto('');
    setShowAddModal(false);

    showAlert('¡Actividad creada exitosamente!', 'Guardado');
  };

  const handleUpdateActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    onUpdateActivity(editingActivity);
    setEditingActivity(null);
    showAlert('Actividad actualizada correctamente.', 'Guardado');
  };

  const handleDeleteActivityClick = async (act: ActividadExtra) => {
    const confirmDelete = await showConfirm(
      `¿Está seguro de eliminar la actividad "${act.titulo}"? Esta acción no se puede deshacer.`,
      'Eliminar Actividad'
    );
    if (confirmDelete) {
      onDeleteActivity(act.id);
      if (selectedActivityForDetails?.id === act.id) {
        setSelectedActivityForDetails(null);
      }
      showAlert('Actividad eliminada con éxito.', 'Eliminado');
    }
  };

  // Handlers for Student Enrollment (Inscripción)
  const handleOpenInscribir = (act: ActividadExtra) => {
    const ocupados = act.inscritos.length;
    if (ocupados >= act.cuposMaximos) {
      showAlert('Esta actividad no tiene cupos disponibles (Agotada). Puede ampliar los cupos editando la actividad.', 'Cupos Agotados');
      return;
    }
    setSelectedActivityForDetails(act);
    setInsAlumnoId('');
    setInsAlumnoNombreManual('');
    setInsMontoPagado(act.precio);
    setInsEstadoPago('Pagado');
    setInsMetodoPago('Efectivo');
    setInsObservaciones('');
    setShowInscribirModal(true);
  };

  const handleInscribirSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityForDetails) return;

    let nombreFinal = '';
    let alumnoIdFinal = '';

    if (insAlumnoId === 'manual') {
      if (!insAlumnoNombreManual.trim()) {
        showAlert('Ingrese el nombre del participante externo.', 'Campo requerido');
        return;
      }
      nombreFinal = insAlumnoNombreManual.trim();
      alumnoIdFinal = 'ext_' + Date.now();
    } else {
      const selectedStudent = alumnos.find(a => a.id === insAlumnoId);
      if (!selectedStudent) {
        showAlert('Seleccione un alumno o elija "Visitante / Participante Externo".', 'Alumno no seleccionado');
        return;
      }
      nombreFinal = selectedStudent.nombre;
      alumnoIdFinal = selectedStudent.id;
    }

    // Check duplicate student in this activity
    const alreadyRegistered = selectedActivityForDetails.inscritos.some(
      i => i.alumnoId === alumnoIdFinal || (insAlumnoId !== 'manual' && i.alumnoId === insAlumnoId)
    );
    if (alreadyRegistered) {
      showAlert(`El participante "${nombreFinal}" ya se encuentra inscrito en esta actividad.`, 'Ya Inscrito');
      return;
    }

    const montoFinal = insMontoPagado !== '' ? Number(insMontoPagado) : 0;

    const newInscripcion: Omit<InscripcionActividad, 'id'> = {
      alumnoId: alumnoIdFinal,
      alumnoNombre: nombreFinal,
      fechaInscripcion: new Date().toISOString().substring(0, 10),
      montoPagado: montoFinal,
      estadoPago: insEstadoPago,
      metodoPago: insMetodoPago,
      observaciones: insObservaciones.trim() || undefined
    };

    onAddInscripcion(selectedActivityForDetails.id, newInscripcion);

    // Optionally register financial income if amount > 0 and paid
    if (montoFinal > 0 && (insEstadoPago === 'Pagado' || insEstadoPago === 'Abono Parcial') && onAddIngreso) {
      onAddIngreso({
        concepto: `Inscripción Actividad Extra: ${selectedActivityForDetails.titulo} (${nombreFinal})`,
        monto: montoFinal,
        fecha: new Date().toISOString().substring(0, 10),
        metodoPago: insMetodoPago,
        categoria: 'Eventos',
        observaciones: `Inscrito en ${selectedActivityForDetails.tipo}. Estado: ${insEstadoPago}`
      });
    }

    setShowInscribirModal(false);
    showAlert(`¡${nombreFinal} fue inscrito exitosamente en "${selectedActivityForDetails.titulo}"!`, 'Inscripción Completada');
  };

  const handleDeleteInscripcionClick = async (inscripcionId: string, nombre: string) => {
    if (!selectedActivityForDetails) return;
    const confirmDelete = await showConfirm(
      `¿Desea remover la inscripción de "${nombre}" de esta actividad?`,
      'Remover Inscrito'
    );
    if (confirmDelete) {
      onDeleteInscripcion(selectedActivityForDetails.id, inscripcionId);
      // Update local detailed state
      const nextInscritos = selectedActivityForDetails.inscritos.filter(i => i.id !== inscripcionId);
      setSelectedActivityForDetails({
        ...selectedActivityForDetails,
        inscritos: nextInscritos
      });
      showAlert('Inscripción removida con éxito.', 'Removido');
    }
  };

  // Image Upload Helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert('La imagen no debe exceder de 2MB.', 'Imagen muy grande');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit && editingActivity) {
          setEditingActivity({ ...editingActivity, foto: base64 });
        } else {
          setFoto(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter activities
  const filteredActividades = actividades.filter(act => {
    const matchesSearch = act.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (act.lugar && act.lugar.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (act.instructorProfesor && act.instructorProfesor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'Todos' || act.tipo === selectedType;
    const matchesState = selectedState === 'Todos' || act.estado === selectedState;

    return matchesSearch && matchesType && matchesState;
  });

  // Calculate Metrics
  const totalActividades = actividades.length;
  const totalInscritos = actividades.reduce((acc, a) => acc + a.inscritos.length, 0);
  const totalRecaudado = actividades.reduce((acc, a) => {
    return acc + a.inscritos.reduce((sum, i) => sum + (i.montoPagado || 0), 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-950/60 border border-gold-800/40 text-gold-400">
              <Compass className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
                Actividades <span className="text-gold-500">Extracurriculares</span>
              </h1>
              <p className="text-xs text-zinc-400">
                Gestión integral de Viajes, Tours, Talleres, Cursos Especiales, Masterclasses y Eventos.
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-add-activity-modal"
          onClick={() => setShowAddModal(true)}
          className="z-10 flex items-center justify-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider px-5 py-3.5 transition-all shadow-lg shadow-gold-500/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Actividad</span>
        </button>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900 text-gold-400 border border-zinc-850">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Actividades Registradas</span>
            <span className="text-2xl font-black text-white font-mono">{totalActividades}</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900 text-cyan-400 border border-zinc-850">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Alumnos Inscritos</span>
            <span className="text-2xl font-black text-white font-mono">{totalInscritos}</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-850">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Total Recaudado</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              RD$ {totalRecaudado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER CONTROL PANEL */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por título, lugar, profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300 shrink-0">
            <Filter className="h-3.5 w-3.5 text-gold-500" />
            <span className="font-semibold text-zinc-400">Tipo:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="Todos" className="bg-zinc-900">Todos los tipos</option>
              <option value="Viaje" className="bg-zinc-900">Viaje</option>
              <option value="Tour" className="bg-zinc-900">Tour</option>
              <option value="Taller" className="bg-zinc-900">Taller</option>
              <option value="Curso Especial" className="bg-zinc-900">Curso Especial</option>
              <option value="Masterclass" className="bg-zinc-900">Masterclass</option>
              <option value="Competencia" className="bg-zinc-900">Competencia</option>
              <option value="Otro" className="bg-zinc-900">Otro</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-300 shrink-0">
            <span className="font-semibold text-zinc-400">Estado:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="Todos" className="bg-zinc-900">Todos</option>
              <option value="Abierto" className="bg-zinc-900">Abierto</option>
              <option value="Agotado" className="bg-zinc-900">Agotado</option>
              <option value="Finalizado" className="bg-zinc-900">Finalizado</option>
              <option value="Cancelado" className="bg-zinc-900">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVITIES GRID */}
      {filteredActividades.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center space-y-3">
          <Compass className="h-12 w-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No se encontraron actividades</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No hay actividades que coincidan con la búsqueda. Haga clic en "Nueva Actividad" para crear un Viaje, Tour, Taller o Masterclass.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredActividades.map((act) => {
            const ocupados = act.inscritos.length;
            const libres = Math.max(0, act.cuposMaximos - ocupados);
            const pctOcupado = Math.min(100, Math.round((ocupados / act.cuposMaximos) * 100));
            const esAgotado = ocupados >= act.cuposMaximos || act.estado === 'Agotado';

            return (
              <div
                key={act.id}
                className="bg-zinc-950 border border-zinc-900 hover:border-gold-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-lg"
              >
                <div>
                  {/* Image / Header Banner */}
                  <div className="relative h-44 bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {act.foto ? (
                      <img
                        src={act.foto}
                        alt={act.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center p-6 text-center relative">
                        <Compass className="h-16 w-16 text-gold-500/15 absolute -right-2 -bottom-2" />
                        <span className="font-display font-black text-xl text-gold-500/40 uppercase tracking-widest">
                          {act.tipo}
                        </span>
                      </div>
                    )}

                    {/* Type Badge */}
                    <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-gold-500/30 text-gold-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg">
                      {act.tipo}
                    </span>

                    {/* Status Badge */}
                    <span className={`absolute top-3 right-3 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      esAgotado
                        ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                        : act.estado === 'Finalizado'
                        ? 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                        : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    }`}>
                      {esAgotado ? 'Agotado' : act.estado}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-gold-300 transition-colors leading-snug">
                        {act.titulo}
                      </h3>
                      {act.instructorProfesor && (
                        <span className="text-xs text-gold-500/90 font-medium block mt-1">
                          Prof / Guía: {act.instructorProfesor}
                        </span>
                      )}
                    </div>

                    {/* Meta info list */}
                    <div className="space-y-2 text-xs text-zinc-400 border-t border-b border-zinc-900 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                        <span className="font-mono text-zinc-300">{act.fecha}</span>
                        {act.hora && <span className="text-zinc-500">• {act.hora}</span>}
                      </div>

                      {act.lugar && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                          <span className="truncate text-zinc-300">{act.lugar}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="font-bold font-mono text-emerald-400 text-sm">
                          RD$ {act.precio.toLocaleString('es-DO')}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase">/ persona</span>
                      </div>
                    </div>

                    {/* Description excerpt */}
                    {act.descripcion && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {act.descripcion}
                      </p>
                    )}

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">Cupos: <strong className="text-white">{ocupados} / {act.cuposMaximos}</strong></span>
                        <span className={`font-bold ${esAgotado ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {esAgotado ? 'Sin cupos disponibles' : `Quedan ${libres} cupos`}
                        </span>
                      </div>

                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            esAgotado
                              ? 'bg-rose-500'
                              : pctOcupado > 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pctOcupado}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-0 flex items-center gap-2 border-t border-zinc-900/80 mt-2 pt-4">
                  <button
                    onClick={() => handleOpenInscribir(act)}
                    disabled={esAgotado}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      esAgotado
                        ? 'bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed'
                        : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Inscribir</span>
                  </button>

                  <button
                    onClick={() => setSelectedActivityForDetails(act)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 text-xs font-semibold cursor-pointer"
                    title="Ver Inscritos y Detalles"
                  >
                    <Users className="h-3.5 w-3.5 text-gold-400" />
                    <span className="font-mono text-[11px] font-bold">{ocupados}</span>
                  </button>

                  <button
                    onClick={() => setEditingActivity({ ...act })}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:text-white transition-colors cursor-pointer"
                    title="Editar Actividad"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteActivityClick(act)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/50 transition-colors cursor-pointer"
                    title="Eliminar Actividad"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW ACTIVITY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-xl w-full p-5 shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col my-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-zinc-900 shrink-0 pr-8">
              <span className="p-2 rounded-xl bg-gold-950 border border-gold-800 text-gold-400">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  Nueva Actividad Extracurricular
                </h2>
                <p className="text-xs text-zinc-400">Cree un nuevo Viaje, Tour, Taller, Curso o Masterclass</p>
              </div>
            </div>

            <form onSubmit={handleCreateActivitySubmit} className="flex flex-col flex-1 min-h-0 pt-3">
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Título de la Actividad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tour Bachata Resort Punta Cana 2026"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tipo de Actividad *</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="Viaje">Viaje</option>
                    <option value="Tour">Tour</option>
                    <option value="Taller">Taller</option>
                    <option value="Curso Especial">Curso Especial</option>
                    <option value="Masterclass">Masterclass</option>
                    <option value="Competencia">Competencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Horario / Duración</label>
                  <input
                    type="text"
                    placeholder="Ej. 09:00 AM - 05:00 PM"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Lugar / Destino</label>
                  <input
                    type="text"
                    placeholder="Ej. Punta Cana / Salón de Oro"
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio por Persona (RD$) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="2500"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Límite de Cupos (Máx) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="20"
                    value={cuposMaximos}
                    onChange={(e) => setCuposMaximos(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Profesor / Instructor / Guía</label>
                  <input
                    type="text"
                    placeholder="Ej. Prof. Invitado Juan Pérez"
                    value={instructorProfesor}
                    onChange={(e) => setInstructorProfesor(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Imagen Promocional (Opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, false)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-gold-400 file:font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción / Detalles</label>
                  <textarea
                    rows={3}
                    placeholder="Describa qué incluye la actividad, transporte, materiales, etc."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 resize-none"
                  />
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
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTIVITY MODAL */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-xl w-full p-6 space-y-5 my-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setEditingActivity(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gold-950 border border-gold-800 text-gold-400">
                <Edit3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  Editar Actividad Extracurricular
                </h2>
                <p className="text-xs text-zinc-400">Modifique los datos o incremente los cupos disponibles</p>
              </div>
            </div>

            <form onSubmit={handleUpdateActivitySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Título de la Actividad *</label>
                  <input
                    type="text"
                    required
                    value={editingActivity.titulo}
                    onChange={(e) => setEditingActivity({ ...editingActivity, titulo: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tipo de Actividad *</label>
                  <select
                    value={editingActivity.tipo}
                    onChange={(e) => setEditingActivity({ ...editingActivity, tipo: e.target.value as any })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="Viaje">Viaje</option>
                    <option value="Tour">Tour</option>
                    <option value="Taller">Taller</option>
                    <option value="Curso Especial">Curso Especial</option>
                    <option value="Masterclass">Masterclass</option>
                    <option value="Competencia">Competencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado de la Actividad *</label>
                  <select
                    value={editingActivity.estado}
                    onChange={(e) => setEditingActivity({ ...editingActivity, estado: e.target.value as any })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="Abierto">Abierto</option>
                    <option value="Agotado">Agotado</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={editingActivity.fecha}
                    onChange={(e) => setEditingActivity({ ...editingActivity, fecha: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Horario / Duración</label>
                  <input
                    type="text"
                    value={editingActivity.hora || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, hora: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Lugar / Destino</label>
                  <input
                    type="text"
                    value={editingActivity.lugar || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, lugar: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio por Persona (RD$) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingActivity.precio}
                    onChange={(e) => setEditingActivity({ ...editingActivity, precio: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Límite de Cupos (Máx) *</label>
                  <input
                    type="number"
                    required
                    min={editingActivity.inscritos.length}
                    value={editingActivity.cuposMaximos}
                    onChange={(e) => setEditingActivity({ ...editingActivity, cuposMaximos: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    Mínimo {editingActivity.inscritos.length} (ya inscritos)
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Profesor / Instructor / Guía</label>
                  <input
                    type="text"
                    value={editingActivity.instructorProfesor || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, instructorProfesor: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción / Detalles</label>
                  <textarea
                    rows={3}
                    value={editingActivity.descripcion || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, descripcion: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold hover:bg-zinc-850"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS & ATTENDEES LIST MODAL */}
      {selectedActivityForDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-3xl w-full p-6 space-y-6 my-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setSelectedActivityForDetails(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title and Top info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500 block">
                  {selectedActivityForDetails.tipo}
                </span>
                <h2 className="text-xl font-black text-white">{selectedActivityForDetails.titulo}</h2>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                  <span>📅 {selectedActivityForDetails.fecha}</span>
                  {selectedActivityForDetails.lugar && <span>📍 {selectedActivityForDetails.lugar}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenInscribir(selectedActivityForDetails)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 cursor-pointer shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Inscribir Alumno</span>
                </button>
              </div>
            </div>

            {/* Cupos Stats Bar */}
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Cupos Registrados:</span>
                <span className="text-lg font-black text-white font-mono">
                  {selectedActivityForDetails.inscritos.length} de {selectedActivityForDetails.cuposMaximos}
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-400 block">Precio por Persona:</span>
                <span className="text-lg font-black text-gold-400 font-mono">
                  RD$ {selectedActivityForDetails.precio.toLocaleString('es-DO')}
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-400 block">Total Recaudado en Actividad:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  RD$ {selectedActivityForDetails.inscritos.reduce((sum, i) => sum + i.montoPagado, 0).toLocaleString('es-DO')}
                </span>
              </div>
            </div>

            {/* List of Registered Attendees */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
                Lista de Alumnos e Inscritos ({selectedActivityForDetails.inscritos.length})
              </h3>

              {selectedActivityForDetails.inscritos.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs">
                  Aún no hay alumnos inscritos en esta actividad.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-850 bg-zinc-900/40">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="p-3">Participante</th>
                        <th className="p-3">Fecha Inscripción</th>
                        <th className="p-3">Monto Pagado</th>
                        <th className="p-3">Estado Pago</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {selectedActivityForDetails.inscritos.map((ins) => (
                        <tr key={ins.id} className="hover:bg-zinc-900/60">
                          <td className="p-3 font-semibold text-white">
                            {ins.alumnoNombre}
                            {ins.observaciones && (
                              <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                                {ins.observaciones}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-zinc-400">{ins.fechaInscripcion}</td>
                          <td className="p-3 font-mono font-bold text-gold-400">
                            RD$ {ins.montoPagado.toLocaleString('es-DO')}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              ins.estadoPago === 'Pagado'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ins.estadoPago === 'Abono Parcial'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {ins.estadoPago}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setTicketToPrint({ actividad: selectedActivityForDetails, inscripcion: ins })}
                                className="p-1.5 rounded-lg bg-zinc-850 hover:bg-gold-500 hover:text-black text-zinc-300 transition-colors cursor-pointer"
                                title="Imprimir Comprobante Ticket"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteInscripcionClick(ins.id, ins.alumnoNombre)}
                                className="p-1.5 rounded-lg bg-zinc-850 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Remover de la actividad"
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSCRIBIR ALUMNO */}
      {showInscribirModal && selectedActivityForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-lg w-full p-6 space-y-5 my-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowInscribirModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  Inscribir en Actividad
                </h2>
                <p className="text-xs text-zinc-400">{selectedActivityForDetails.titulo}</p>
              </div>
            </div>

            <form onSubmit={handleInscribirSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Seleccionar Participante *</label>
                <select
                  required
                  value={insAlumnoId}
                  onChange={(e) => setInsAlumnoId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="">-- Seleccionar Alumno de la Academia --</option>
                  <option value="manual">➕ Visitante / Participante Externo</option>
                  {alumnos.map(al => (
                    <option key={al.id} value={al.id}>
                      {al.nombre} ({al.ritmo} - {al.nivel})
                    </option>
                  ))}
                </select>
              </div>

              {insAlumnoId === 'manual' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Completo del Participante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. María Fernanda López"
                    value={insAlumnoNombreManual}
                    onChange={(e) => setInsAlumnoNombreManual(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Monto Pagado (RD$) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={insMontoPagado}
                    onChange={(e) => setInsMontoPagado(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado del Pago *</label>
                  <select
                    value={insEstadoPago}
                    onChange={(e) => setInsEstadoPago(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="Pagado">Pagado Completo</option>
                    <option value="Abono Parcial">Abono Parcial</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Método de Pago *</label>
                  <select
                    value={insMetodoPago}
                    onChange={(e) => setInsMetodoPago(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Pagó RD$ 2,000 en efectivo, restan RD$ 500"
                  value={insObservaciones}
                  onChange={(e) => setInsObservaciones(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowInscribirModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold hover:bg-zinc-850"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Confirmar Inscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT TICKET RECEIPT MODAL */}
      {ticketToPrint && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black max-w-sm w-full p-6 rounded-2xl space-y-4 shadow-2xl relative font-mono text-xs animate-scale-up">
            <button
              onClick={() => setTicketToPrint(null)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-black p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Printable Area */}
            <div id="activity-receipt-print" className="space-y-3 text-center border-b pb-4 border-dashed border-zinc-300">
              <div className="flex justify-center mb-1">
                <NewDanceLogo lightTheme={true} />
              </div>
              <h2 className="font-bold text-sm uppercase">{ticketSettings.nombreAcademia || 'NEW DANCE SYSTEM'}</h2>
              <p className="text-[10px] text-zinc-600">{ticketSettings.direccion}</p>
              <p className="text-[10px] text-zinc-600">Tel: {ticketSettings.telefono}</p>

              <div className="border-t border-b border-dashed border-zinc-300 py-2 my-2 space-y-1 text-left">
                <p className="font-bold uppercase text-[11px]">COMPROBANTE DE ACTIVIDAD</p>
                <p><span className="text-zinc-500">Actividad:</span> {ticketToPrint.actividad.titulo}</p>
                <p><span className="text-zinc-500">Tipo:</span> {ticketToPrint.actividad.tipo}</p>
                <p><span className="text-zinc-500">Fecha Actividad:</span> {ticketToPrint.actividad.fecha}</p>
                {ticketToPrint.actividad.lugar && <p><span className="text-zinc-500">Lugar:</span> {ticketToPrint.actividad.lugar}</p>}
                <p><span className="text-zinc-500">Participante:</span> <strong>{ticketToPrint.inscripcion.alumnoNombre}</strong></p>
                <p><span className="text-zinc-500">Monto Pagado:</span> <strong>RD$ {ticketToPrint.inscripcion.montoPagado.toLocaleString('es-DO')}</strong></p>
                <p><span className="text-zinc-500">Estado Pago:</span> {ticketToPrint.inscripcion.estadoPago}</p>
                <p><span className="text-zinc-500">Método:</span> {ticketToPrint.inscripcion.metodoPago || 'Efectivo'}</p>
                <p><span className="text-zinc-500">Fecha Inscripción:</span> {ticketToPrint.inscripcion.fechaInscripcion}</p>
              </div>

              <p className="text-[9px] text-zinc-500 italic mt-3">
                {ticketSettings.mensajeLargo || '¡Gracias por participar con nosotros! Presente este ticket al ingresar.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTicketToPrint(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-200 text-zinc-800 text-xs font-sans font-bold hover:bg-zinc-300"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-sans font-bold hover:bg-zinc-800 flex items-center justify-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
