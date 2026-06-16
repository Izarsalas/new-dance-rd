/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clase } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  X,
  Layers
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface ClassModuleProps {
  clases: Clase[];
  onAddClass: (nzClass: Omit<Clase, 'id'>) => void;
  onUpdateClass: (nzClass: Clase) => void;
  onDeleteClass: (id: string) => void;
}

export default function ClassModule({
  clases,
  onAddClass,
  onUpdateClass,
  onDeleteClass
}: ClassModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();
  const [selectedDayFilter, setSelectedDayFilter] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Clase | null>(null);

  // Form states for new class
  const [nombre, setNombre] = useState('');
  const [ritmo, setRitmo] = useState('Salsa');
  const [profesor, setProfesor] = useState('');
  const [horario, setHorario] = useState('18:00 - 19:30');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [salon, setSalon] = useState('Salón de Oro');
  const [capacidad, setCapacidad] = useState(20);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const handleDayCheck = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddNewClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !profesor.trim() || selectedDays.length === 0) {
      await showAlert('Por favor complete todos los datos obligatorios y seleccione al menos un día.', 'Campos Requeridos');
      return;
    }

    onAddClass({
      nombre: nombre.trim(),
      ritmo,
      profesor: profesor.trim(),
      horario,
      dias: selectedDays,
      salon,
      capacidad: Number(capacidad) || 20
    });

    // Reset fields
    setNombre('');
    setRitmo('Salsa');
    setProfesor('');
    setHorario('18:00 - 19:30');
    setSelectedDays([]);
    setSalon('Salón de Oro');
    setCapacidad(20);
    setShowAddModal(false);
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      if (!editingClass.nombre.trim() || !editingClass.profesor.trim() || editingClass.dias.length === 0) {
        await showAlert('Por favor complete todos los campos y asigne al menos un día.', 'Campos Requeridos');
        return;
      }
      onUpdateClass(editingClass);
      setEditingClass(null);
    }
  };

  const toggleDayInEditClass = (day: string) => {
    if (!editingClass) return;
    const currentDays = editingClass.dias;
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setEditingClass({
      ...editingClass,
      dias: updatedDays
    });
  };

  // Filter classes by day of week
  const filteredClasses = clases.filter(clase => {
    if (selectedDayFilter === 'Todos') return true;
    return clase.dias.includes(selectedDayFilter);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Horarios de Clases
          </h1>
          <p className="text-xs text-zinc-400">
            Administre los ritmos, salones exclusivos de la academia, profesores y agendas de baile semas.
          </p>
        </div>

        <button
          id="btn-add-class-modal"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 font-semibold text-white px-4 py-2.5 text-sm transition-all shadow-md shadow-gold-500/10 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Crear Nueva Clase
        </button>
      </div>

      {/* Week day quick filter buttons */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-400 font-semibold px-2.5 py-1 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-gold-500" />
            Agenda semanal:
          </span>
          <button
            id="filter-day-all"
            onClick={() => setSelectedDayFilter('Todos')}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              selectedDayFilter === 'Todos'
                ? 'bg-gold-500 text-white font-bold'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            Ver Todas
          </button>
          
          {daysOfWeek.map(day => (
            <button
              key={day}
              id={`filter-day-${day}`}
              onClick={() => setSelectedDayFilter(day)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedDayFilter === day
                  ? 'bg-gold-500 text-white font-bold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-850 p-12 text-center bg-zinc-950">
          <Calendar className="mx-auto h-10 w-10 text-gold-500/30" />
          <h3 className="mt-4 font-display text-base font-semibold text-white">No hay clases programadas</h3>
          <p className="mt-1 text-xs text-zinc-500">No se encontraron sesiones para la fecha o ritmo seleccionado.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map(clase => (
            <div 
              key={clase.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-5 p-r hover:border-gold-500/30 transition-all gold-glow"
            >
              <div>
                {/* Header card info */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gold-950/40 px-2.5 py-1 text-[10px] font-bold text-gold-400 border border-gold-900/40">
                    {clase.ritmo}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 text-gold-500/70" />
                    <span>{clase.salon}</span>
                  </div>
                </div>

                {/* Primary class details */}
                <h3 className="font-display text-lg font-bold text-white mt-3 leading-snug">
                  {clase.nombre}
                </h3>
                
                {/* Instructor name */}
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                  <User className="h-4 w-4 text-zinc-600 shrink-0" />
                  <span>Profesor: <strong className="text-zinc-300 font-medium">{clase.profesor}</strong></span>
                </div>

                {/* Days of the week list tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {clase.dias.map(day => (
                    <span 
                      key={day}
                      className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-850"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom bar of class card */}
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gold-500 font-mono font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{clase.horario}</span>
                  </div>
                  <span className="text-zinc-700 font-mono">|</span>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
                    <Users className="h-3.5 w-3.5" />
                    <span>Cap: {clase.capacidad}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id={`btn-edit-class-${clase.id}`}
                    onClick={() => setEditingClass(clase)}
                    className="rounded bg-zinc-900 p-1.5 text-zinc-400 hover:text-white border border-zinc-850 transition-all cursor-pointer"
                    title="Editar clase"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  
                  <button
                    id={`btn-delete-class-${clase.id}`}
                    onClick={async () => {
                      const confirmed = await showConfirm(
                        `¿Está seguro de eliminar la clase de "${clase.nombre}" del sistema?`,
                        { title: 'Eliminar Clase', confirmLabel: 'Sí, eliminar', cancelLabel: 'Cancelar', isDanger: true }
                      );
                      if (confirmed) {
                        onDeleteClass(clase.id);
                      }
                    }}
                    className="rounded bg-zinc-900 p-1.5 text-rose-500 hover:text-rose-400 border border-zinc-850 transition-all hover:bg-rose-950/20 cursor-pointer"
                    title="Eliminar clase"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: CREATE CLASS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm animate-fade-in flex justify-center items-start p-2 sm:p-4 md:p-6">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 shrink-0">
              <h3 className="font-display text-lg font-bold text-white">Crear Nueva Clase de Baile</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewClass} className="mt-4 space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre Descriptivo de la Clase *</label>
                <input
                  id="add-class-nombre"
                  type="text"
                  required
                  placeholder="Ej. Salsa Casino Inicial-Medio"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Ritmo / Baile *</label>
                  <select
                    id="add-class-ritmo"
                    value={ritmo}
                    onChange={(e) => setRitmo(e.target.value)}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                  >
                    <option value="Salsa">Salsa</option>
                    <option value="Bachata">Bachata</option>
                    <option value="Ballet">Ballet</option>
                    <option value="Tango">Tango</option>
                    <option value="Urbano">Urbano</option>
                    <option value="Flamenco">Flamenco</option>
                    <option value="K-Pop">K-Pop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Salón de Práctica *</label>
                  <select
                    id="add-class-salon"
                    value={salon}
                    onChange={(e) => setSalon(e.target.value)}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                  >
                    <option value="Salón de Oro">Salón de Oro</option>
                    <option value="Salón Ébano">Salón Ébano</option>
                    <option value="Salón Cristal">Salón Cristal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre del Profesor Instructor *</label>
                <input
                  id="add-class-profesor"
                  type="text"
                  required
                  placeholder="Ej. Carlos Valenzuela"
                  value={profesor}
                  onChange={(e) => setProfesor(e.target.value)}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Horario (Rango de Horas) *</label>
                  <input
                    id="add-class-horario"
                    type="text"
                    required
                    placeholder="Ej. 18:00 - 19:30"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Capacidad Máxima *</label>
                  <input
                    id="add-class-capacidad"
                    type="number"
                    required
                    min={1}
                    value={capacidad}
                    onChange={(e) => setCapacidad(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55"
                  />
                </div>
              </div>

              {/* Day selection checkmark row */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Días de la semana obligatorios *</label>
                <div className="grid grid-cols-3 gap-2">
                  {daysOfWeek.map(day => (
                    <label 
                      key={day}
                      className={`flex items-center gap-1.5 rounded-lg border p-2 cursor-pointer transition-all ${
                        selectedDays.includes(day)
                          ? 'border-gold-500/50 bg-gold-950/20 text-white'
                          : 'border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayCheck(day)}
                        className="accent-gold-500 h-3.5 w-3.5"
                      />
                      <span className="text-xs font-medium font-mono">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  id="btn-add-class-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg bg-zinc-900 px-4 py-2.5 text-xs text-white hover:bg-zinc-850 cursor-pointer"
                >
                  Cancelar
                </button>
                
                <button
                  id="btn-add-class-submit"
                  type="submit"
                  className="rounded-lg bg-gold-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-gold-400 cursor-pointer"
                >
                  Confirmar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CLASS */}
      {editingClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm animate-fade-in flex justify-center items-start p-2 sm:p-4 md:p-6">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 shrink-0">
              <h3 className="font-display text-lg font-bold text-white">Modificar Clase de Baile</h3>
              <button 
                onClick={() => setEditingClass(null)}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditClass} className="mt-4 space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre Descriptivo de la Clase *</label>
                <input
                  id="edit-class-nombre"
                  type="text"
                  required
                  value={editingClass.nombre}
                  onChange={(e) => setEditingClass({ ...editingClass, nombre: e.target.value })}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Ritmo / Baile *</label>
                  <select
                    id="edit-class-ritmo"
                    value={editingClass.ritmo}
                    onChange={(e) => setEditingClass({ ...editingClass, ritmo: e.target.value })}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                  >
                    <option value="Salsa">Salsa</option>
                    <option value="Bachata">Bachata</option>
                    <option value="Ballet">Ballet</option>
                    <option value="Tango">Tango</option>
                    <option value="Urbano">Urbano</option>
                    <option value="Flamenco">Flamenco</option>
                    <option value="K-Pop">K-Pop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Salón de Práctica *</label>
                  <select
                    id="edit-class-salon"
                    value={editingClass.salon}
                    onChange={(e) => setEditingClass({ ...editingClass, salon: e.target.value })}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55 cursor-pointer"
                  >
                    <option value="Salón de Oro">Salón de Oro</option>
                    <option value="Salón Ébano">Salón Ébano</option>
                    <option value="Salón Cristal">Salón Cristal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Profesor Instructor *</label>
                <input
                  id="edit-class-profesor"
                  type="text"
                  required
                  value={editingClass.profesor}
                  onChange={(e) => setEditingClass({ ...editingClass, profesor: e.target.value })}
                  className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Horario (Rango de Horas) *</label>
                  <input
                    id="edit-class-horario"
                    type="text"
                    required
                    value={editingClass.horario}
                    onChange={(e) => setEditingClass({ ...editingClass, horario: e.target.value })}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm font-mono text-white outline-none focus:border-gold-500/55"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Capacidad Máxima *</label>
                  <input
                    id="edit-class-capacidad"
                    type="number"
                    required
                    min={1}
                    value={editingClass.capacidad}
                    onChange={(e) => setEditingClass({ ...editingClass, capacidad: Number(e.target.value) })}
                    className="w-full rounded-lg border border-zinc-855 bg-zinc-900 p-2.5 text-sm text-white outline-none focus:border-gold-500/55"
                  />
                </div>
              </div>

              {/* Day selection edit checklist */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Días asignados *</label>
                <div className="grid grid-cols-3 gap-2">
                  {daysOfWeek.map(day => (
                    <label 
                      key={day}
                      className={`flex items-center gap-1.5 rounded-lg border p-2 cursor-pointer transition-all ${
                        editingClass.dias.includes(day)
                          ? 'border-gold-500/50 bg-gold-950/20 text-white'
                          : 'border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={editingClass.dias.includes(day)}
                        onChange={() => toggleDayInEditClass(day)}
                        className="accent-gold-500 h-3.5 w-3.5"
                      />
                      <span className="text-xs font-medium font-mono">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  id="btn-edit-class-cancel"
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="rounded-lg bg-zinc-900 px-4 py-2.5 text-xs text-white hover:bg-zinc-810 cursor-pointer"
                >
                  Cancelar
                </button>
                
                <button
                  id="btn-edit-class-submit"
                  type="submit"
                  className="rounded-lg bg-gold-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-gold-400 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
