/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AreaTrabajo, Empleado } from '../types';
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
  Building,
  Briefcase,
  DollarSign,
  FolderPlus,
  ArrowRightLeft,
  User,
  Camera
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface StaffModuleProps {
  areas: AreaTrabajo[];
  empleados: Empleado[];
  onAddArea: (area: Omit<AreaTrabajo, 'id'>) => void;
  onUpdateArea: (area: AreaTrabajo) => void;
  onDeleteArea: (id: string) => void;
  onAddEmployee: (employee: Omit<Empleado, 'id'>) => void;
  onUpdateEmployee: (employee: Empleado) => void;
  onDeleteEmployee: (id: string) => void;
  onToggleEmployeeStatus: (id: string) => void;
}

export default function StaffModule({
  areas,
  empleados,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onToggleEmployeeStatus
}: StaffModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();
  // Navigation within the module
  const [subTab, setSubTab] = useState<'employees' | 'areas'>('employees');

  // Employee-specific state
  const [empSearch, setEmpSearch] = useState('');
  const [empFilterArea, setEmpFilterArea] = useState('Todos');
  const [empFilterStatus, setEmpFilterStatus] = useState('Activos');

  // Modals controllers
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Empleado | null>(null);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaTrabajo | null>(null);

  // Form New Employee States
  const [empNombre, setEmpNombre] = useState('');
  const [empAreaId, setEmpAreaId] = useState(areas[0]?.id || '');
  const [empPuesto, setEmpPuesto] = useState('');
  const [empSalario, setEmpSalario] = useState(25000);
  const [empContacto, setEmpContacto] = useState('');
  const [empFechaIngreso, setEmpFechaIngreso] = useState(new Date().toISOString().substring(0, 10));
  const [empWhatsappPersonal, setEmpWhatsappPersonal] = useState('');
  const [empWhatsappFamiliar, setEmpWhatsappFamiliar] = useState('');
  const [empNombreFamiliar, setEmpNombreFamiliar] = useState('');
  const [empDireccion, setEmpDireccion] = useState('');
  const [empHorarioTrabajo, setEmpHorarioTrabajo] = useState('');
  const [empObservacion, setEmpObservacion] = useState('');
  const [empFoto, setEmpFoto] = useState('');

  // Handle image load to base64
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for local storage
        showAlert('La imagen es muy grande. Seleccione una foto de menos de 2MB.', 'Imagen Pesada');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isEditing && editingEmp) {
            setEditingEmp({ ...editingEmp, foto: reader.result });
          } else {
            setEmpFoto(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form New Area States
  const [areaNombre, setAreaNombre] = useState('');
  const [areaDescripcion, setAreaDescripcion] = useState('');

  // Submit Handlers
  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNombre.trim() || !empPuesto.trim() || !empAreaId) {
      await showAlert('Por favor complete los campos obligatorios del empleado.', 'Campos Requeridos');
      return;
    }

    onAddEmployee({
      nombre: empNombre.trim(),
      areaId: empAreaId,
      puesto: empPuesto.trim(),
      salario: Number(empSalario) || 0,
      contacto: empWhatsappPersonal.trim() || empContacto.trim() || 'Sin contacto',
      fechaIngreso: empFechaIngreso,
      activo: true,
      whatsappPersonal: empWhatsappPersonal.trim(),
      whatsappFamiliar: empWhatsappFamiliar.trim(),
      nombreFamiliar: empNombreFamiliar.trim(),
      direccion: empDireccion.trim(),
      horarioTrabajo: empHorarioTrabajo.trim(),
      observacion: empObservacion.trim(),
      foto: empFoto || undefined
    });

    // Reset Form
    setEmpNombre('');
    setEmpPuesto('');
    setEmpSalario(25000);
    setEmpContacto('');
    setEmpFechaIngreso(new Date().toISOString().substring(0, 10));
    setEmpWhatsappPersonal('');
    setEmpWhatsappFamiliar('');
    setEmpNombreFamiliar('');
    setEmpDireccion('');
    setEmpHorarioTrabajo('');
    setEmpObservacion('');
    setEmpFoto('');
    setShowAddEmpModal(false);
  };

  const handleEditEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      if (!editingEmp.nombre.trim() || !editingEmp.puesto.trim() || !editingEmp.areaId) {
        await showAlert('Por favor complete los campos obligatorios.', 'Campos Requeridos');
        return;
      }
      onUpdateEmployee(editingEmp);
      setEditingEmp(null);
    }
  };

  const handleAddAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaNombre.trim()) {
      await showAlert('Por favor ingrese el nombre del área.', 'Campos Requeridos');
      return;
    }

    onAddArea({
      nombre: areaNombre.trim(),
      descripcion: areaDescripcion.trim()
    });

    setAreaNombre('');
    setAreaDescripcion('');
    setShowAddAreaModal(false);

    // Auto-select the newly created area in employee form dropdown if it was empty
    if (!empAreaId && areas.length === 0) {
      // It will reload lists correctly
    }
  };

  const handleEditAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArea) {
      if (!editingArea.nombre.trim()) {
        await showAlert('Por favor ingrese el nombre del área.', 'Campos Requeridos');
        return;
      }
      onUpdateArea(editingArea);
      setEditingArea(null);
    }
  };

  // Helper dictionary lookup
  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.nombre : 'Área no asignada';
  };

  // Calculations for KPI Cards
  const totalEmployeesCount = empleados.length;
  const activeEmployeesCount = empleados.filter(e => e.activo).length;
  const totalSalariesPayroll = empleados
    .filter(e => e.activo)
    .reduce((sum, e) => sum + e.salario, 0);
  const totalAreasCount = areas.length;

  // Filter process
  const filteredEmployees = empleados.filter(emp => {
    const matchesSearch = emp.nombre.toLowerCase().includes(empSearch.toLowerCase()) ||
                          emp.puesto.toLowerCase().includes(empSearch.toLowerCase()) ||
                          emp.contacto.includes(empSearch) ||
                          (emp.whatsappPersonal && emp.whatsappPersonal.includes(empSearch)) ||
                          (emp.whatsappFamiliar && emp.whatsappFamiliar.includes(empSearch)) ||
                          (emp.nombreFamiliar && emp.nombreFamiliar.toLowerCase().includes(empSearch.toLowerCase())) ||
                          (emp.direccion && emp.direccion.toLowerCase().includes(empSearch.toLowerCase())) ||
                          (emp.observacion && emp.observacion.toLowerCase().includes(empSearch.toLowerCase()));
    const matchesArea = empFilterArea === 'Todos' || emp.areaId === empFilterArea;
    const matchesStatus = empFilterStatus === 'Todos' ||
                          (empFilterStatus === 'Activos' && emp.activo) ||
                          (empFilterStatus === 'Inactivos' && !emp.activo);

    return matchesSearch && matchesArea && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header View */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Personal de Trabajo y Áreas
          </h1>
          <p className="text-xs text-zinc-400">
            Organice los departamentos operativos e ingrese la plantilla de empleados de la academia.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              if (areas.length === 0) {
                await showAlert('Debe crear primero al menos un área de negocio antes de registrar personal.', 'Cree un Área');
                setSubTab('areas');
                setShowAddAreaModal(true);
              } else {
                setEmpAreaId(areas[0].id);
                setShowAddEmpModal(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 font-semibold text-white px-4 py-2.5 text-sm transition-all shadow-md shadow-gold-500/10 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Ingresar Empleado
          </button>

          <button
            onClick={() => setShowAddAreaModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-medium px-4 py-2.5 text-sm transition-all cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-gold-500" />
            Crear Nueva Área
          </button>
        </div>
      </div>

      {/* KPI Stats Cards - Bento grids matching standard layout theme */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Total Personal</span>
            <div className="rounded-lg bg-zinc-900/80 p-2 border border-zinc-850">
              <Briefcase className="h-4 w-4 text-gold-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{totalEmployeesCount}</span>
            <span className="text-[11px] text-zinc-500">registrados</span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-500">
            {activeEmployeesCount} en servicio activo
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Personal Activo</span>
            <div className="rounded-lg bg-zinc-900/80 p-2 border border-zinc-850">
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{activeEmployeesCount}</span>
            <span className="text-[11px] text-zinc-500">en servicio</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 font-mono">
            ● {totalEmployeesCount - activeEmployeesCount} inactivos/licencia
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Presupuesto Nómina</span>
            <div className="rounded-lg bg-zinc-900/80 p-2 border border-zinc-850">
              <DollarSign className="h-4 w-4 text-gold-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-xs font-black text-gold-500">RD$</span>
            <span className="text-3xl font-black text-white tracking-tight">
              {totalSalariesPayroll.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-500">
            Suma del salario mensual activo
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Áreas Operativas</span>
            <div className="rounded-lg bg-zinc-900/80 p-2 border border-zinc-850">
              <Building className="h-4 w-4 text-gold-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{totalAreasCount}</span>
            <span className="text-[11px] text-zinc-500">departamentos</span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-500">
            Estructura operativa de academia
          </div>
        </div>

      </div>

      {/* Tabs navigation for Employees vs. Areas */}
      <div className="flex border-b border-zinc-900">
        <button
          onClick={() => setSubTab('employees')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            subTab === 'employees'
              ? 'border-gold-500 text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Directorio de Empleados ({filteredEmployees.length})
        </button>
        <button
          onClick={() => setSubTab('areas')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            subTab === 'areas'
              ? 'border-gold-500 text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Áreas y Departamentos ({totalAreasCount})
        </button>
      </div>

      {/* RENDER EMPLOYEES DIRECTORY */}
      {subTab === 'employees' && (
        <div className="space-y-4">
          
          {/* Header filters */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              
              {/* Search text input */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar empleado por nombre, puesto o teléfono..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 py-2.5 pr-4 pl-11 text-sm text-white placeholder-zinc-550 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                />
                {empSearch && (
                  <button
                    onClick={() => setEmpSearch('')}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Area select filter */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 rounded-xl border border-zinc-850 bg-zinc-900/35 px-3 py-1.5 min-w-[150px]">
                  <Building className="h-3.5 w-3.5 text-gold-500" />
                  <select
                    value={empFilterArea}
                    onChange={(e) => setEmpFilterArea(e.target.value)}
                    className="bg-transparent text-xs text-stone-200 outline-none cursor-pointer w-full"
                  >
                    <option value="Todos" className="bg-zinc-950 text-white">Todas las Áreas</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id} className="bg-zinc-950 text-white">{a.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Status select filter */}
                <div className="flex items-center gap-1.5 rounded-xl border border-zinc-850 bg-zinc-900/35 px-3 py-1.5 min-w-[140px]">
                  <Filter className="h-3.5 w-3.5 text-gold-500" />
                  <select
                    value={empFilterStatus}
                    onChange={(e) => setEmpFilterStatus(e.target.value)}
                    className="bg-transparent text-xs text-stone-200 outline-none cursor-pointer w-full"
                  >
                    <option value="Todos" className="bg-zinc-950 text-white">Cuidadores (Todos)</option>
                    <option value="Activos" className="bg-zinc-950 text-white">Activos</option>
                    <option value="Inactivos" className="bg-zinc-950 text-white">Inactivos</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Directory table container */}
          <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
            {filteredEmployees.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">No se encontraron empleados</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Ajuste la barra de búsqueda u organice su filtro de áreas para visualizar otros empleados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                      <th className="py-3 px-4">Empleado & Puesto</th>
                      <th className="py-3 px-4">Departamento / Área</th>
                      <th className="py-3 px-4">Contacto</th>
                      <th className="py-3 px-4">Salario Mensual</th>
                      <th className="py-3 px-4">Fecha Ingreso</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 text-sm">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-zinc-900/30 transition-colors">
                        {/* Name & Title */}
                        <td className="py-4.5 px-4">
                          <div className="flex items-start gap-3">
                            {emp.foto ? (
                              <img 
                                src={emp.foto} 
                                alt={emp.nombre} 
                                className="h-11 w-11 rounded-lg object-cover border border-gold-500/35 mt-0.5 shadow-md shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gold-500 mt-0.5 shrink-0">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div className="space-y-1 min-w-0">
                              <span className="font-semibold text-white block leading-tight">{emp.nombre}</span>
                              <span className="text-[10px] text-gold-500 font-bold font-mono tracking-wide block uppercase leading-none">{emp.puesto}</span>
                              {emp.horarioTrabajo && (
                                <div className="text-[10px] text-stone-350 font-mono flex items-center gap-1 mt-1">
                                  <span className="text-gold-500/70">📅 Horario:</span>
                                  <span>{emp.horarioTrabajo}</span>
                                </div>
                              )}
                              {emp.direccion && (
                                <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                  <span className="text-zinc-500 font-medium">📍 Dir:</span>
                                  <span className="truncate max-w-[200px]" title={emp.direccion}>{emp.direccion}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Department Area */}
                        <td className="py-4.5 px-4">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-850 px-2.5 py-1 text-xs text-stone-250">
                            <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                            <span>{getAreaName(emp.areaId)}</span>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="py-4.5 px-4 text-zinc-300">
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-bold text-[9px] border border-emerald-500/30 rounded px-1 py-0.5 bg-emerald-950/20 shrink-0">Wsp Pers</span>
                              <span className="font-mono text-stone-200">{emp.whatsappPersonal || emp.contacto || 'Sin contacto'}</span>
                            </div>
                            {emp.whatsappFamiliar && (
                              <div className="text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-1 space-y-0.5">
                                <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Contacto Familiar:</div>
                                <div className="font-semibold text-stone-300">{emp.nombreFamiliar || 'Familiar'}</div>
                                <div className="font-mono flex items-center gap-1 mt-0.5 text-stone-400">
                                  <Phone className="h-2.5 w-2.5 text-zinc-600" />
                                  <span>{emp.whatsappFamiliar}</span>
                                </div>
                              </div>
                            )}
                            {emp.observacion && (
                              <div className="text-[10px] text-zinc-500 border-t border-zinc-900/60 pt-1 italic max-w-[200px] leading-tight" title={emp.observacion}>
                                Obs: {emp.observacion.length > 55 ? `${emp.observacion.substring(0, 52)}...` : emp.observacion}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Monthly Salary */}
                        <td className="py-4.5 px-4 font-semibold text-white font-mono text-xs">
                          RD$ {emp.salario.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Date hired */}
                        <td className="py-4.5 px-4 text-xs text-zinc-400 font-mono">
                          {emp.fechaIngreso}
                        </td>

                        {/* Status tag */}
                        <td className="py-4.5 px-4 text-center">
                          <button
                            onClick={() => onToggleEmployeeStatus(emp.id)}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border cursor-pointer transition-all ${
                              emp.activo 
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-950' 
                                : 'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-950'
                            }`}
                            title="Haz clic para alternar estado"
                          >
                            <span className={`h-1 w-1 rounded-full ${emp.activo ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
                            <span>{emp.activo ? 'Activo' : 'Inactivo'}</span>
                          </button>
                        </td>

                        {/* Actions buttons */}
                        <td className="py-4.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingEmp(emp)}
                              className="rounded bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                              title="Editar ficha"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await showConfirm(
                                  `¿Está seguro de eliminar el empleado ${emp.nombre}?`,
                                  { title: 'Eliminar Empleado', confirmLabel: 'Sí, eliminar', cancelLabel: 'Cancelar', isDanger: true }
                                );
                                if (confirmed) {
                                  onDeleteEmployee(emp.id);
                                }
                              }}
                              className="rounded bg-zinc-900 border border-zinc-800 p-1.5 text-rose-500 hover:bg-rose-950/10 hover:border-rose-900 transition-all cursor-pointer"
                              title="Dar de baja o remover"
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
      )}

      {/* RENDER BUSINESS AREAS */}
      {subTab === 'areas' && (
        <div className="space-y-4">
          {areas.length === 0 ? (
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No hay áreas de negocio creadas</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Toda empresa de baile requiere áreas (ej. Profesorado, Recepción, Ventas). Cree su primera área para empezar.
              </p>
              <button
                onClick={() => setShowAddAreaModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-white px-4 py-2 text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Nueva Área Operativa
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {areas.map((area) => {
                // Employees associated
                const linkedStaffCount = empleados.filter(e => e.areaId === area.id).length;
                const activeLinkedStaffCount = empleados.filter(e => e.areaId === area.id && e.activo).length;
                const areaPayroll = empleados
                  .filter(e => e.areaId === area.id && e.activo)
                  .reduce((sum, e) => sum + e.salario, 0);

                return (
                  <div key={area.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-4 flex flex-col justify-between hover:border-zinc-800 transition-all">
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="bg-zinc-900/60 rounded-xl px-3 py-1 text-[11px] font-mono text-gold-500 uppercase font-semibold border border-zinc-850">
                          Área Operativa
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setEditingArea(area)}
                            className="bg-zinc-900 p-1.5 rounded border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-750 transition-all cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (linkedStaffCount > 0) {
                                await showAlert(`No se puede eliminar esta área porque tiene ${linkedStaffCount} empleado(s) asociado(s). Reasigne primero a estos empleados a otro departamento.`, 'Área con Empleados');
                                return;
                              }
                              const confirmed = await showConfirm(
                                `¿Seguro que desea eliminar el área "${area.nombre}"?`,
                                { title: 'Eliminar Área', confirmLabel: 'Sí, eliminar', cancelLabel: 'Cancelar', isDanger: true }
                              );
                              if (confirmed) {
                                onDeleteArea(area.id);
                              }
                            }}
                            className="bg-zinc-900 p-1.5 rounded border border-zinc-850 text-rose-500 hover:bg-rose-950/20 hover:border-rose-900 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{area.nombre}</h3>
                      <p className="text-xs text-zinc-450 leading-relaxed min-h-[32px]">
                        {area.descripcion || 'Sin descripción detallada disponible.'}
                      </p>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 mt-2 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-zinc-550 uppercase font-mono text-[9px] block">Plantilla</span>
                        <span className="font-semibold text-white">
                          {linkedStaffCount} empleados <span className="text-[10px] text-emerald-400">({activeLinkedStaffCount} act.)</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-550 uppercase font-mono text-[9px] block">Nómina Activa</span>
                        <span className="font-semibold text-gold-500 font-mono">
                          RD$ {areaPayroll.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================= MODALS =======      {/* MODAL: ADD EMPLOYEE */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gold-800/50 bg-zinc-950 p-6 md:p-8 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gold-500" />
                Ingresar Nuevo Empleado
              </h2>
              <button 
                onClick={() => setShowAddEmpModal(false)}
                className="rounded-lg p-1 text-zinc-450 hover:bg-zinc-900 hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 shrink-1">
              {/* SECTION 1: DATOS PERSONALES */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  1. Información Personal y Ocupación
                </h4>

                {/* Photo Upload Row */}
                <div className="flex items-center gap-4 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    {empFoto ? (
                      <img src={empFoto} alt="Vista previa de foto" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="h-8 w-8 text-zinc-600" />
                    )}
                    {empFoto && (
                      <button
                        type="button"
                        onClick={() => setEmpFoto('')}
                        className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 flex items-center justify-center text-[10px] text-rose-400 font-bold transition-opacity"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Foto del Empleado (.JPG)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg"
                        onChange={(e) => handlePhotoChange(e, false)}
                        className="hidden"
                        id="employee-photo-upload"
                      />
                      <label
                        htmlFor="employee-photo-upload"
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-850 hover:border-gold-500/40 hover:bg-zinc-850 px-3.5 py-1.5 text-xs text-stone-200 cursor-pointer transition-all border-zinc-800"
                      >
                        <Camera className="h-3.5 w-3.5 text-gold-500" />
                        <span>Subir Foto JPG</span>
                      </label>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">Formatos JPG o JPEG de hasta 2MB.</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nombre Completo del Empleado *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan de Dios Pérez"
                      value={empNombre}
                      onChange={(e) => setEmpNombre(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5 font-sans">Ocupación o Cargo dentro del Negocio *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Recepcionista de Tarde, Profesor de Salsa"
                      value={empPuesto}
                      onChange={(e) => setEmpPuesto(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Área de Trabajo / Departamento *</label>
                    <select
                      value={empAreaId}
                      onChange={(e) => setEmpAreaId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-[#130f06] p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      {areas.map(a => (
                        <option key={a.id} value={a.id} className="bg-zinc-950 text-white">{a.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Número de WhatsApp Personal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 809-555-0123"
                      value={empWhatsappPersonal}
                      onChange={(e) => {
                        setEmpWhatsappPersonal(e.target.value);
                        setEmpContacto(e.target.value); // Sync standard contacto
                      }}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DATOS DEL FAMILIAR DIRECTO */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  2. Contacto de Familiar Directo (Emergencia)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nombre del Familiar Directo</label>
                    <input
                      type="text"
                      placeholder="Ej. Ana Victoria Pérez (Madre)"
                      value={empNombreFamiliar}
                      onChange={(e) => setEmpNombreFamiliar(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Número de WhatsApp del Familiar</label>
                    <input
                      type="text"
                      placeholder="Ej. 829-555-4567"
                      value={empWhatsappFamiliar}
                      onChange={(e) => setEmpWhatsappFamiliar(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DIRECCIÓN Y HORARIOS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  3. Ubicación, Horarios de Trabajo e Ingreso
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Dirección de Residencia</label>
                    <input
                      type="text"
                      placeholder="Ej. Av. Independencia Esq. Pasteur, Calle #5"
                      value={empDireccion}
                      onChange={(e) => setEmpDireccion(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Horarios de Trabajo</label>
                    <input
                      type="text"
                      placeholder="Ej. Lun a Vie de 2:00 PM a 10:00 PM"
                      value={empHorarioTrabajo}
                      onChange={(e) => setEmpHorarioTrabajo(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Salario Mensual (RD$)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="25000"
                      value={empSalario}
                      onChange={(e) => setEmpSalario(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha de Ingreso</label>
                    <input
                      type="date"
                      value={empFechaIngreso}
                      onChange={(e) => setEmpFechaIngreso(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: OBSERVACIONES */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  4. Observación o Notas Adicionales
                </h4>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Escriba condiciones especiales, experiencia previa o notas clínicas/operativas..."
                    value={empObservacion}
                    onChange={(e) => setEmpObservacion(e.target.value)}
                    className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="rounded-xl px-4 py-2.5 border border-zinc-850 hover:bg-zinc-900 text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-white transition-all cursor-pointer"
                >
                  Guardar Registro de Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gold-800/50 bg-[#0d0903] p-6 md:p-8 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gold-900/40 pb-3 shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-gold-500" />
                Modificar Ficha de Empleado
              </h2>
              <button 
                onClick={() => setEditingEmp(null)}
                className="rounded-lg p-1 text-zinc-450 hover:bg-zinc-900 hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditEmployeeSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 shrink-1">
              
              {/* SECTION 1: DATOS PERSONALES */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  1. Información Personal y Ocupación
                </h4>

                {/* Photo Upload Row (Edit modal) */}
                <div className="flex items-center gap-4 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    {editingEmp.foto ? (
                      <img src={editingEmp.foto} alt="Vista previa de foto" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="h-8 w-8 text-zinc-600" />
                    )}
                    {editingEmp.foto && (
                      <button
                        type="button"
                        onClick={() => setEditingEmp({ ...editingEmp, foto: undefined })}
                        className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 flex items-center justify-center text-[10px] text-rose-400 font-bold transition-opacity"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Foto del Empleado (.JPG)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg"
                        onChange={(e) => handlePhotoChange(e, true)}
                        className="hidden"
                        id="employee-photo-edit"
                      />
                      <label
                        htmlFor="employee-photo-edit"
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-850 hover:border-gold-500/40 hover:bg-zinc-850 px-3.5 py-1.5 text-xs text-stone-200 cursor-pointer transition-all border-zinc-800"
                      >
                        <Camera className="h-3.5 w-3.5 text-gold-500" />
                        <span>Subir Foto JPG</span>
                      </label>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">Formatos JPG o JPEG de hasta 2MB.</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nombre Completo del Empleado *</label>
                    <input
                      type="text"
                      required
                      value={editingEmp.nombre}
                      onChange={(e) => setEditingEmp({ ...editingEmp, nombre: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5 font-sans">Ocupación o Cargo dentro del Negocio *</label>
                    <input
                      type="text"
                      required
                      value={editingEmp.puesto}
                      onChange={(e) => setEditingEmp({ ...editingEmp, puesto: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Área de Trabajo / Departamento *</label>
                    <select
                      value={editingEmp.areaId}
                      onChange={(e) => setEditingEmp({ ...editingEmp, areaId: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-[#130f06] p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      {areas.map(a => (
                        <option key={a.id} value={a.id} className="bg-zinc-950 text-white">{a.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Número de WhatsApp Personal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 809-555-0123"
                      value={editingEmp.whatsappPersonal || ''}
                      onChange={(e) => setEditingEmp({ 
                        ...editingEmp, 
                        whatsappPersonal: e.target.value,
                        contacto: e.target.value // also update standard contact
                      })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DATOS DEL FAMILIAR DIRECTO */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  2. Contacto de Familiar Directo (Emergencia)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nombre del Familiar Directo</label>
                    <input
                      type="text"
                      placeholder="Ej. Ana Victoria Pérez (Madre)"
                      value={editingEmp.nombreFamiliar || ''}
                      onChange={(e) => setEditingEmp({ ...editingEmp, nombreFamiliar: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Número de WhatsApp del Familiar</label>
                    <input
                      type="text"
                      placeholder="Ej. 829-555-4567"
                      value={editingEmp.whatsappFamiliar || ''}
                      onChange={(e) => setEditingEmp({ ...editingEmp, whatsappFamiliar: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DIRECCIÓN Y HORARIOS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  3. Ubicación, Horarios de Trabajo e Ingreso
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Dirección de Residencia</label>
                    <input
                      type="text"
                      placeholder="Ej. Av. Independencia Esq. Pasteur, Calle #5"
                      value={editingEmp.direccion || ''}
                      onChange={(e) => setEditingEmp({ ...editingEmp, direccion: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Horarios de Trabajo</label>
                    <input
                      type="text"
                      placeholder="Ej. Lun a Vie de 2:00 PM a 10:00 PM"
                      value={editingEmp.horarioTrabajo || ''}
                      onChange={(e) => setEditingEmp({ ...editingEmp, horarioTrabajo: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Salario Mensual (RD$)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={editingEmp.salario || 0}
                      onChange={(e) => setEditingEmp({ ...editingEmp, salario: Number(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Fecha de Ingreso</label>
                    <input
                      type="date"
                      value={editingEmp.fechaIngreso}
                      onChange={(e) => setEditingEmp({ ...editingEmp, fechaIngreso: e.target.value })}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: OBSERVACIONES */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 border-b border-zinc-900 pb-1">
                  4. Observación o Notas Adicionales
                </h4>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Escriba condiciones especiales, experiencia previa o notas clínicas/operativas..."
                    value={editingEmp.observacion || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, observacion: e.target.value })}
                    className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Status Row */}
              <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estado Operacional</span>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="radio"
                      name="act-status"
                      checked={editingEmp.activo === true}
                      onChange={() => setEditingEmp({ ...editingEmp, activo: true })}
                      className="accent-gold-500"
                    />
                    Activo
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="radio"
                      name="act-status"
                      checked={editingEmp.activo === false}
                      onChange={() => setEditingEmp({ ...editingEmp, activo: false })}
                      className="accent-gold-500"
                    />
                    Inactivo
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="rounded-xl px-4 py-2.5 border border-zinc-850 hover:bg-zinc-900 text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-white transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD AREA */}
      {showAddAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 animate-pulse-subtle">
                <Building className="h-5 w-5 text-gold-500" />
                Crear Área / Sector
              </h2>
              <button 
                onClick={() => setShowAddAreaModal(false)}
                className="rounded-lg p-1 text-zinc-455 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddAreaSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre del Área *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Administración y Recepción, Profesores de Ritmo"
                  value={areaNombre}
                  onChange={(e) => setAreaNombre(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 focus:border-gold-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Descripción o Función</label>
                <textarea
                  rows={3}
                  placeholder="Ej. Responsables de matriculación, atención telefónica directa y cobro mensual de cuotas."
                  value={areaDescripcion}
                  onChange={(e) => setAreaDescripcion(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 focus:border-gold-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddAreaModal(false)}
                  className="rounded-xl px-4 py-2.5 border border-zinc-850 hover:bg-zinc-900 text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-white transition-all cursor-pointer"
                >
                  Crear Área
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AREA */}
      {editingArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-gold-500" />
                Modificar Área / Sector
              </h2>
              <button 
                onClick={() => setEditingArea(null)}
                className="rounded-lg p-1 text-zinc-455 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditAreaSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre del Área *</label>
                <input
                  type="text"
                  required
                  value={editingArea.nombre}
                  onChange={(e) => setEditingArea({ ...editingArea, nombre: e.target.value })}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 focus:border-gold-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Descripción o Función</label>
                <textarea
                  rows={3}
                  value={editingArea.descripcion}
                  onChange={(e) => setEditingArea({ ...editingArea, d: editingArea.descripcion, descripcion: e.target.value })}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 focus:border-gold-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
                  className="rounded-xl px-4 py-2.5 border border-zinc-850 hover:bg-zinc-900 text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-white transition-all cursor-pointer"
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
