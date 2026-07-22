/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Alumno, Clase, Pago, RegistroAsistencia } from '../types';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  CheckSquare, 
  AlertCircle,
  Compass
} from 'lucide-react';

interface DashboardOverviewProps {
  alumnos: Alumno[];
  clases: Clase[];
  pagos: Pago[];
  asistencias: RegistroAsistencia[];
  onNavigate: (tab: string) => void;
  onQuickAddStudent: () => void;
}

export default function DashboardOverview({
  alumnos,
  clases,
  pagos,
  asistencias,
  onNavigate,
  onQuickAddStudent
}: DashboardOverviewProps) {
  
  // Metrics calculation
  const totalStudents = alumnos.filter(a => a.activo).length;
  const totalClasses = clases.length;
  
  // Calculate current month's revenue (e.g. May 2026)
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  // Spanish capitalized month: "Mayo 2026"
  const rawMonthStr = today.toLocaleDateString('es-DO', options);
  const currentMonth = rawMonthStr.charAt(0).toUpperCase() + rawMonthStr.slice(1);
  
  const currentMonthPayments = pagos.filter(p => p.mes.toLowerCase().includes('mayo') || p.mes.toLowerCase().includes('2026')); // simple match for demo
  const gatheredPayments = pagos.filter(p => p.estado === 'Pagado');
  const totalRevenue = gatheredPayments.reduce((sum, p) => sum + p.monto, 0);
  
  const pendingPayments = pagos.filter(p => p.estado === 'Pendiente' || p.estado === 'Atrasado');
  const outstandingRevenue = pendingPayments.reduce((sum, p) => sum + p.monto, 0);
  
  // Attendance calculations for most recent day
  const uniqueDates = Array.from(new Set(asistencias.map(a => a.fecha))).sort().reverse();
  const latestDate = uniqueDates[0] || 'Hoy';
  const latestAttendance = asistencias.filter(a => a.fecha === latestDate);
  const presentsCount = latestAttendance.filter(a => a.estado === 'Asistió').length;
  const attendanceRate = latestAttendance.length > 0 
    ? Math.round((presentsCount / latestAttendance.length) * 100) 
    : 0;

  // Next classes today (for illustration we mock based on day)
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDayIndex = today.getDay(); // 0 is Sunday, 1 is Monday...
  const currentDayName = daysOfWeek[currentDayIndex];
  
  const classesToday = clases.filter(c => c.dias.includes(currentDayName) || c.dias.includes('Lunes')); // Default to show Monday for nice display preview if dry day

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Academy Quick Actions Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 gold-glow">
        <div className="absolute top-0 right-0 h-40 w-45 bg-[#d4af37]/5 blur-[80px] rounded-full"></div>
        
        {/* Quick actions row */}
        <div className="relative z-10 flex flex-wrap gap-3">
          <button 
            id="btn-quick-enroll"
            onClick={onQuickAddStudent}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gold-400 hover:scale-[1.02] cursor-pointer shadow-lg shadow-gold-500/10"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Nueva Inscripción
          </button>
          
          <button 
            id="btn-quick-attendance"
            onClick={() => onNavigate('attendance')}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:border-gold-500/40 hover:scale-[1.02] cursor-pointer"
          >
            <CheckSquare className="h-4.5 w-4.5 text-gold-500" />
            Tomar Asistencia
          </button>

          <button 
            id="btn-quick-payments"
            onClick={() => onNavigate('payments')}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:border-gold-500/40 hover:scale-[1.02] cursor-pointer"
          >
            <DollarSign className="h-4.5 w-4.5 text-gold-500" />
            Registrar Pagos
          </button>

          <button 
            id="btn-quick-activities"
            onClick={() => onNavigate('activities')}
            className="inline-flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-5 py-2.5 text-sm font-semibold text-gold-400 transition-all hover:bg-gold-500/20 hover:border-gold-500/60 hover:scale-[1.02] cursor-pointer"
          >
            <Compass className="h-4.5 w-4.5 text-gold-400" />
            Actividades y Tour
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Students */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition-all hover:border-gold-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Alumnos Activos</span>
            <div className="rounded-lg bg-zinc-900 p-2 border border-zinc-800">
              <Users className="h-5 w-5 text-gold-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-bold text-white">{totalStudents}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>100% de retención actual</span>
            </div>
          </div>
        </div>

        {/* Card 2: Classes */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition-all hover:border-gold-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Ritmos & Horarios</span>
            <div className="rounded-lg bg-zinc-900 p-2 border border-zinc-800">
              <Calendar className="h-5 w-5 text-gold-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-bold text-white">{totalClasses}</span>
            <p className="mt-1 text-xs text-zinc-500">
              Clases activas en la semana
            </p>
          </div>
        </div>

        {/* Card 3: Income */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition-all hover:border-gold-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Total Recaudado</span>
            <div className="rounded-lg bg-zinc-900 p-2 border border-zinc-800">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-bold text-white">
              RD$ {totalRevenue.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>RD$ {outstandingRevenue.toLocaleString('es-DO')} pendiente de cobro</span>
            </div>
          </div>
        </div>

        {/* Card 4: Attendance */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition-all hover:border-gold-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Asistencia Reciente</span>
            <div className="rounded-lg bg-zinc-900 p-2 border border-zinc-800">
              <CheckSquare className="h-5 w-5 text-gold-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-bold text-white">
              {attendanceRate}%
            </span>
            <p className="mt-1 text-xs text-zinc-500">
              Fecha de corte: <span className="text-zinc-300 font-mono">{latestDate}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Class agenda and Pending Actions */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Today's agenda column (Span 2) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Clases Destacadas</h2>
              <p className="text-xs text-zinc-400">Salones principales con agenda activa</p>
            </div>
            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-gold-500 font-mono">
              Hoy / Lunes
            </span>
          </div>

          <div className="space-y-4">
            {clases.map((clase, idx) => (
              <div 
                key={clase.id} 
                className="group relative overflow-hidden rounded-xl bg-zinc-900/60 p-5 border border-zinc-800 hover:border-gold-500/20 transition-all"
              >
                <div className="absolute top-0 left-0 h-full w-1 bg-gold-500"></div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-gold-950/50 px-2 py-0.5 text-[10px] font-semibold text-gold-400 border border-gold-900/30">
                      {clase.ritmo}
                    </span>
                    <h3 className="mt-1.5 font-display text-base font-bold text-white group-hover:text-gold-400 transition-colors">
                      {clase.nombre}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Profesor: <strong className="text-zinc-300">{clase.profesor}</strong>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-gold-500 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{clase.horario}</span>
                    </div>
                    
                    <div className="mt-2 text-xs text-zinc-400">
                      <span>Ubicación: </span>
                      <strong className="text-zinc-300">{clase.salon}</strong>
                    </div>
                  </div>
                </div>
                
                {/* Visual indicator of student capacity */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
                    <span>Ocupación estimada</span>
                    <span className="font-mono text-zinc-300">
                      {idx === 0 ? '16' : idx === 1 ? '22' : idx === 2 ? '12' : '10'} / {clase.capacidad} alumnos
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-gold-500 h-full rounded-full" 
                      style={{ width: `${idx === 0 ? 80 : idx === 1 ? 88 : idx === 2 ? 80 : 55}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Status / Warnings panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white mb-1">Alertas Administrativas</h2>
            <p className="text-xs text-zinc-400 mb-5">Acción inmediata recomendada</p>
            
            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="flex gap-3 rounded-lg bg-yellow-500/5 p-4 border border-yellow-500/10">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Alumnos deudores descubiertos</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {alumnos.length > 0 ? alumnos[4]?.nombre : 'Diego Torres'} tiene su mensualidad pendiente de <span className="text-white font-mono">Mayo 2026</span>.
                  </p>
                  <button 
                    onClick={() => onNavigate('payments')} 
                    className="mt-2 text-[10px] font-semibold text-gold-400 hover:text-gold-300 underline block cursor-pointer"
                  >
                    Registrar Cobro
                  </button>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex gap-3 rounded-lg bg-gold-500/5 p-4 border border-gold-500/10">
                <CheckSquare className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Control de Asistencia Activo</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Por favor registre la asistencia de hoy para que el porcentaje de constancia se actualice.
                  </p>
                  <button 
                    onClick={() => onNavigate('attendance')} 
                    className="mt-2 text-[10px] font-semibold text-gold-400 hover:text-gold-300 underline block cursor-pointer"
                  >
                    Abrir Registro
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-lg bg-zinc-900/80 p-4 border border-zinc-850">
                <span className="text-[9px] uppercase tracking-wider text-gold-500 font-bold block mb-1">
                  Nota del Sistema
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Toda la información se almacena localmente en la memoria del navegador. Es idóneo para usar en tablets, móviles o laptops sin requerir internet.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-zinc-900 pt-4 text-center">
            <span className="text-[11px] text-zinc-500 font-mono">
              Aura Dance Studio v1.1.0 • LocalStorage Activo
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
