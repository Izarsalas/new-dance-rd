/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alumno, Clase, RegistroAsistencia } from '../types';
import { 
  Check, 
  X, 
  HelpCircle, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  TrendingUp,
  Sliders,
  History
} from 'lucide-react';

interface AttendanceModuleProps {
  asistencias: RegistroAsistencia[];
  alumnos: Alumno[];
  clases: Clase[];
  onSaveAttendanceBatch: (records: Omit<RegistroAsistencia, 'id'>[]) => void;
}

export default function AttendanceModule({
  asistencias,
  alumnos,
  clases,
  onSaveAttendanceBatch
}: AttendanceModuleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedClassId, setSelectedClassId] = useState(clases[0]?.id || '');
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);

  const activeAlumnos = alumnos.filter(a => a.activo);
  const currentClassObj = clases.find(c => c.id === selectedClassId);

  // Filter students enrolled or suitable for this class
  // If "showAllStudents" is true, show everyone active in the academy.
  // Otherwise, filter students whose "ritmo" matches the class rhythm.
  const applicableStudents = activeAlumnos.filter(student => {
    if (showAllStudents) return true;
    if (!currentClassObj) return true;
    return student.ritmo.toLowerCase().trim() === currentClassObj.ritmo.toLowerCase().trim();
  });

  // Get current states of student attendance for selected date and class combination
  const getAttendanceState = (studentId: string): 'Asistió' | 'Faltó' | 'Justificado' | 'Sin registrar' => {
    const record = asistencias.find(
      a => a.fecha === selectedDate && a.claseId === selectedClassId && a.alumnoId === studentId
    );
    return record ? record.estado : 'Sin registrar';
  };

  // Updte registration state
  const handleSetState = (studentId: string, newState: 'Asistió' | 'Faltó' | 'Justificado') => {
    // Generate batch with just this one updated
    // Look if already exists, update or insert
    const singleUpdateRecord: Omit<RegistroAsistencia, 'id'> = {
      fecha: selectedDate,
      claseId: selectedClassId,
      alumnoId: studentId,
      estado: newState
    };
    onSaveAttendanceBatch([singleUpdateRecord]);
  };

  // Mass Actions
  const handleMarkAll = (state: 'Asistió' | 'Faltó' | 'Justificado') => {
    if (applicableStudents.length === 0) return;
    
    const batch: Omit<RegistroAsistencia, 'id'>[] = applicableStudents.map(student => ({
      fecha: selectedDate,
      claseId: selectedClassId,
      alumnoId: student.id,
      estado: state
    }));

    onSaveAttendanceBatch(batch);
  };

  // Retrieve attendance stats for current class & date selection
  const totalStudentsSelected = applicableStudents.length;
  const registeredRecords = asistencias.filter(
    a => a.fecha === selectedDate && a.claseId === selectedClassId
  );
  
  const presentCount = registeredRecords.filter(r => r.estado === 'Asistió').length;
  const absentCount = registeredRecords.filter(r => r.estado === 'Faltó').length;
  const excusedCount = registeredRecords.filter(r => r.estado === 'Justificado').length;
  const pendingCount = Math.max(0, totalStudentsSelected - registeredRecords.length);

  const indexRate = totalStudentsSelected > 0 && registeredRecords.length > 0
    ? Math.round((presentCount / registeredRecords.length) * 100)
    : 0;

  // History recap calculations: group past dates recorded
  const historyDates = Array.from(new Set(asistencias.map(a => a.fecha))).sort().reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Control de Asistencia Diaria
          </h1>
          <p className="text-xs text-zinc-400">
            Pase de lista diario, histórico de ausencias y justificaciones médicas por salón de baile.
          </p>
        </div>

        <button
          id="btn-toggle-attendance-history"
          onClick={() => setShowHistoryView(!showHistoryView)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white hover:bg-zinc-900 transition-all cursor-pointer"
        >
          {showHistoryView ? (
            <>
              <Sliders className="h-4 w-4 text-gold-500" />
              Ver Tablero de Hoy
            </>
          ) : (
            <>
              <History className="h-4 w-4 text-gold-500" />
              Consultar Historial
            </>
          )}
        </button>
      </div>

      {showHistoryView ? (
        /* HISTORY TRACKING PANELS */
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">Fechas Grabadas Recientemente</h2>
            <p className="text-xs text-zinc-400 mb-5">Haga clic sobre una fecha para auditar quién asistió.</p>

            {historyDates.length === 0 ? (
              <div className="py-12 border border-dashed border-zinc-850 rounded-xl text-center">
                <Calendar className="mx-auto h-8 w-8 text-zinc-650 mb-3" />
                <span className="text-xs text-zinc-500 block">No hay registros de asistencias antiguos en la base.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {historyDates.map(date => {
                  const dateRecords = asistencias.filter(a => a.fecha === date);
                  const asists = dateRecords.filter(r => r.estado === 'Asistió').length;
                  const absents = dateRecords.filter(r => r.estado === 'Faltó').length;
                  
                  return (
                    <div 
                      key={date}
                      className="flex flex-wrap items-center justify-between border border-zinc-850 bg-zinc-900/40 p-4 rounded-xl hover:border-gold-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-zinc-950 px-3 py-2 border border-zinc-800 text-center font-mono">
                          <span className="text-[10px] text-zinc-500 block uppercase">Día</span>
                          <span className="text-xs font-bold text-gold-500">{date}</span>
                        </div>
                        <div>
                          <strong className="text-sm text-white block">Lista de Asistencia</strong>
                          <span className="text-xs text-zinc-500">{dateRecords.length} registros totales asignados</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-zinc-400 font-medium block">
                            Presentes: <strong className="text-emerald-400 font-mono">{asists}</strong> | Faltas: <strong className="text-rose-400 font-mono">{absents}</strong>
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">Índice: {Math.round((asists / dateRecords.length) * 100) || 0}% presencial</span>
                        </div>

                        <button 
                          id={`btn-load-date-${date}`}
                          onClick={() => {
                            setSelectedDate(date);
                            setShowHistoryView(false);
                          }}
                          className="rounded-lg bg-gold-500 hover:bg-gold-400 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                        >
                          Cargar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ATTENDANCE INTERACTION SCREEN */
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Control Form Sidebar */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-5 lg:col-span-1">
              <h2 className="font-display text-lg font-bold text-white border-b border-zinc-900 pb-3">
                Parámetros de Pase
              </h2>

              {/* Date selection field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Fecha de Operación *</label>
                <div className="relative">
                  <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gold-500" />
                  <input
                    id="attendance-date-picker"
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-4 text-xs font-mono text-white outline-none focus:border-gold-500/40"
                  />
                </div>
              </div>

              {/* Class scheduled selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Clase a evaluar *</label>
                <div className="relative">
                  <BookOpen className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gold-500" />
                  <select
                    id="attendance-class-select"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-gold-500/40 cursor-pointer"
                  >
                    {clases.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} ({c.ritmo})</option>
                    ))}
                  </select>
                </div>
                {currentClassObj && (
                  <div className="mt-2.5 p-3 rounded-lg bg-zinc-900 text-xs text-zinc-400 border border-zinc-850">
                    <div className="flex justify-between mb-1">
                      <span>Profesor:</span> <strong className="text-zinc-200">{currentClassObj.profesor}</strong>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Horario asignado:</span> <strong className="text-zinc-200">{currentClassObj.horario}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Salón:</span> <strong className="text-gold-500">{currentClassObj.salon}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Option to show all academy students instead of rhythmic ones */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-zinc-900/50 border border-zinc-850 p-3">
                  <input
                    id="checkbox-all-students"
                    type="checkbox"
                    checked={showAllStudents}
                    onChange={(e) => setShowAllStudents(e.target.checked)}
                    className="accent-gold-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Mostrar todo el estudiantado</span>
                    <span className="text-[10px] text-zinc-400">Ignorar filtro de ritmo específico</span>
                  </div>
                </label>
              </div>

              {/* Mini Stats box */}
              <div className="rounded-lg bg-zinc-900/40 border border-zinc-850/60 p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest block">Métricas de la Sesión</span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-zinc-100 font-medium">Presentes:</span>
                  <span className="font-mono text-emerald-400 font-bold text-right">{presentCount}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-zinc-100 font-medium">Faltas:</span>
                  <span className="font-mono text-rose-400 font-bold text-right">{absentCount}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-zinc-100 font-medium">Justificados:</span>
                  <span className="font-mono text-amber-500 font-bold text-right">{excusedCount}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-zinc-100 font-medium">Sin Registrar:</span>
                  <span className="font-mono text-zinc-400 text-right">{pendingCount}</span>
                </div>

                <div className="border-t border-zinc-800 pt-2.5 mt-1 flex justify-between items-center">
                  <span className="text-xs text-white font-semibold">Tasa de puntualidad:</span>
                  <span className="font-mono text-sm font-bold text-gold-500">{indexRate}%</span>
                </div>
              </div>

            </div>

            {/* Interactive Grid of student lists */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 lg:col-span-2 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Alumnos Inscritos ({totalStudentsSelected})</h2>
                  <p className="text-xs text-zinc-400">Configure la asistencia de cada alumno para el día seleccionado.</p>
                </div>

                {/* Mass toggle actions */}
                <div className="flex items-center gap-1.5 self-start">
                  <button
                    id="btn-mass-present"
                    onClick={() => handleMarkAll('Asistió')}
                    disabled={applicableStudents.length === 0}
                    className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-950/20 disabled:opacity-50 cursor-pointer"
                  >
                    ✓ Todos Presentes
                  </button>
                  <button
                    id="btn-mass-absent"
                    onClick={() => handleMarkAll('Faltó')}
                    disabled={applicableStudents.length === 0}
                    className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-[10px] font-bold text-rose-400 hover:bg-rose-950/20 disabled:opacity-50 cursor-pointer"
                  >
                    ✗ Todos Ausentes
                  </button>
                </div>
              </div>

              {/* Applicable students checklist map */}
              {applicableStudents.length === 0 ? (
                <div className="py-24 border border-dashed border-zinc-850 rounded-xl text-center">
                  <User className="mx-auto h-10 w-10 text-gold-500/20 mb-3" />
                  <h3 className="font-display text-sm font-bold text-white">No hay alumnos para este filtro de ritmo</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                    Haga check en "Mostrar todo el estudiantado" para desplegar la lista completa del plantel.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-900 max-h-[500px] overflow-y-auto pr-2">
                  {applicableStudents.map(student => {
                    const status = getAttendanceState(student.id);
                    return (
                      <div 
                        key={student.id} 
                        className="flex items-center justify-between py-3.5 hover:bg-zinc-900/10 transition-all rounded-lg px-2 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                            status === 'Asistió' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/30' :
                            status === 'Faltó' ? 'bg-rose-950 text-rose-400 border-rose-900/30' :
                            status === 'Justificado' ? 'bg-amber-950 text-amber-300 border-amber-900/30' :
                            'bg-zinc-900 text-zinc-500 border-zinc-850'
                          }`}>
                            {student.nombre.charAt(0)}
                          </div>
                          <div>
                            <span className="font-display font-semibold text-white block text-sm group-hover:text-gold-400 transition-colors">
                              {student.nombre}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Ritmo: {student.ritmo} • Edad: {student.edad} • Nivel: {student.nivel}
                            </span>
                          </div>
                        </div>

                        {/* Interactive toggle block buttons */}
                        <div className="flex items-center gap-1">
                          
                          {/* Present */}
                          <button
                            id={`btn-attend-${student.id}-asistio`}
                            onClick={() => handleSetState(student.id, 'Asistió')}
                            className={`rounded-lg p-2 flex items-center gap-1 text-xs font-semibold cursor-pointer border transition-all ${
                              status === 'Asistió'
                                ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-emerald-450 hover:bg-emerald-950/10'
                            }`}
                            title="Asistió"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Pres</span>
                          </button>

                          {/* Absent */}
                          <button
                            id={`btn-attend-${student.id}-falto`}
                            onClick={() => handleSetState(student.id, 'Faltó')}
                            className={`rounded-lg p-2 flex items-center gap-1 text-xs font-semibold cursor-pointer border transition-all ${
                              status === 'Faltó'
                                ? 'bg-rose-500 text-white border-rose-500 font-bold'
                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-rose-440 hover:bg-rose-950/10'
                            }`}
                            title="Faltó"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Falta</span>
                          </button>

                          {/* Excused justified */}
                          <button
                            id={`btn-attend-${student.id}-just`}
                            onClick={() => handleSetState(student.id, 'Justificado')}
                            className={`rounded-lg p-2 flex items-center gap-1 text-xs font-semibold cursor-pointer border transition-all ${
                              status === 'Justificado'
                                ? 'bg-amber-450 text-white border-amber-500 font-bold'
                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-amber-500 hover:bg-amber-950/10'
                            }`}
                            title="Justificado"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Just</span>
                          </button>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 p-3.5 border border-zinc-850">
                <CheckCircle2 className="h-5 w-5 text-gold-500 shrink-0" />
                <span className="text-[11px] text-zinc-400">
                  Los cambios realizados en la asistencia se actualizan y guardan de manera instantánea en el almacén local del navegador. No se preocupe por perder la información.
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
