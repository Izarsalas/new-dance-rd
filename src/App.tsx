/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Alumno, 
  Clase, 
  Pago, 
  RegistroAsistencia,
  AreaTrabajo,
  Empleado,
  Ingreso,
  Egreso,
  Product,
  Sale,
  Recibo,
  TicketSettings
} from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_CLASSES, 
  INITIAL_PAYMENTS, 
  INITIAL_ATTENDANCE,
  INITIAL_AREAS,
  INITIAL_EMPLOYEES
} from './initialData';

// Icons
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  DollarSign, 
  CheckSquare, 
  UserCircle,
  Menu,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  Briefcase,
  Trash2,
  TrendingUp,
  TrendingDown,
  Store
} from 'lucide-react';

// Modules
import DashboardOverview from './components/DashboardOverview';
import StudentModule from './components/StudentModule';
import ClassModule from './components/ClassModule';
import PaymentModule from './components/PaymentModule';
import AttendanceModule from './components/AttendanceModule';
import StaffModule from './components/StaffModule';
import IncomeModule from './components/IncomeModule';
import ExpenseModule from './components/ExpenseModule';
import GeneralBillingView from './components/GeneralBillingView';
import { useAlertConfirm } from './context/AlertConfirmContext';

export default function App() {
  const { showAlert, showConfirm } = useAlertConfirm();

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core States
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
  const [areas, setAreas] = useState<AreaTrabajo[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);

  // Billing POS States
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [ticketSettings, setTicketSettings] = useState<TicketSettings>({
    nombreAcademia: 'NEW DANCE SYSTEM',
    rnc: '1-31-50790-1',
    direccion: 'Av. Abraham Lincoln esq. Lope de Vega, Santo Domingo, Rep. Dominicana',
    telefono: '(809) 567-2026',
    mensajeLargo: '¡Gracias por bailar con nosotros! Su compra apoya la formación de jóvenes talentos.'
  });

  // Time ticker
  const [currentTime, setCurrentTime] = useState(new Date());

  // Trigger quick add modal in StudentModule from elsewhere
  const [forceTriggerAddStudent, setForceTriggerAddStudent] = useState(false);

  // Load from local storage or hydrate with gorgeous default values
  useEffect(() => {
    try {
      const storedAlumnos = localStorage.getItem('aura_alumnos');
      const storedClases = localStorage.getItem('aura_clases');
      const storedPagos = localStorage.getItem('aura_pagos');
      const storedAsistencias = localStorage.getItem('aura_asistencias');
      const storedAreas = localStorage.getItem('aura_areas');
      const storedEmpleados = localStorage.getItem('aura_empleados');
      const storedIngresos = localStorage.getItem('aura_ingresos');
      const storedEgresos = localStorage.getItem('aura_egresos');
      
      const storedProducts = localStorage.getItem('aura_billing_products');
      const storedSales = localStorage.getItem('aura_billing_sales');
      const storedRecibos = localStorage.getItem('aura_billing_recibos');
      const storedTicketSettings = localStorage.getItem('aura_billing_settings');

      if (storedAlumnos) {
        setAlumnos(JSON.parse(storedAlumnos));
      } else {
        setAlumnos(INITIAL_STUDENTS);
        localStorage.setItem('aura_alumnos', JSON.stringify(INITIAL_STUDENTS));
      }

      if (storedClases) {
        setClases(JSON.parse(storedClases));
      } else {
        setClases(INITIAL_CLASSES);
        localStorage.setItem('aura_clases', JSON.stringify(INITIAL_CLASSES));
      }

      if (storedPagos) {
        setPagos(JSON.parse(storedPagos));
      } else {
        setPagos(INITIAL_PAYMENTS);
        localStorage.setItem('aura_pagos', JSON.stringify(INITIAL_PAYMENTS));
      }

      if (storedAsistencias) {
        setAsistencias(JSON.parse(storedAsistencias));
      } else {
        setAsistencias(INITIAL_ATTENDANCE);
        localStorage.setItem('aura_asistencias', JSON.stringify(INITIAL_ATTENDANCE));
      }

      if (storedAreas) {
        setAreas(JSON.parse(storedAreas));
      } else {
        setAreas(INITIAL_AREAS);
        localStorage.setItem('aura_areas', JSON.stringify(INITIAL_AREAS));
      }

      if (storedEmpleados) {
        setEmpleados(JSON.parse(storedEmpleados));
      } else {
        setEmpleados(INITIAL_EMPLOYEES);
        localStorage.setItem('aura_empleados', JSON.stringify(INITIAL_EMPLOYEES));
      }

      if (storedIngresos) {
        setIngresos(JSON.parse(storedIngresos));
      } else {
        const dummyIncomes = [
          { id: 'i1', concepto: 'Venta de Zapatos para Salsa y Bachata', monto: 3500, fecha: '2026-05-15', metodoPago: 'Efectivo', categoria: 'Ventas', observaciones: 'Venta realizada a alumna de iniciación.' },
          { id: 'i2', concepto: 'Clase Privada de Samba - Pareja S. R.', monto: 4000, fecha: '2026-05-20', metodoPago: 'Transferencia', categoria: 'Clases Privadas', observaciones: 'Clase de reforzamiento dictada por el Prof. Carlos.' }
        ];
        setIngresos(dummyIncomes);
        localStorage.setItem('aura_ingresos', JSON.stringify(dummyIncomes));
      }

      if (storedEgresos) {
        setEgresos(JSON.parse(storedEgresos));
      } else {
        const dummyExpenses = [
          { id: 'eg1', concepto: 'Alquiler del Local - Mayo', monto: 18000, fecha: '2026-05-02', metodoPago: 'Transferencia', categoria: 'Alquiler', observaciones: 'Pago de local transferido puntualmente.' },
          { id: 'eg2', concepto: 'Factura de Energía Eléctrica (Edesur)', monto: 4500, fecha: '2026-05-10', metodoPago: 'Tarjeta', categoria: 'Servicios', observaciones: 'Pago de servicios públicos cargados.' },
          { id: 'eg3', concepto: 'Pago de Publicidad en Redes Sociales (Facebook/IG Ads)', monto: 3200, fecha: '2026-05-18', metodoPago: 'Tarjeta', categoria: 'Publicidad', observaciones: 'Campañas de captación activa.' }
        ];
        setEgresos(dummyExpenses);
        localStorage.setItem('aura_egresos', JSON.stringify(dummyExpenses));
      }

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        const defaultProducts: Product[] = [
          { id: 'p1', codigo: 'SALS-01', nombre: 'Zapatos de Salsa Profesional - Girasol Taco 5.5', precio: 4500, costo: 2500, stock: 8, departamento: 'Zapatos de Baile', inventarioActivo: true },
          { id: 'p2', codigo: 'BACH-02', nombre: 'Zapatos de Bachata Lady Charm - Terciopelo Negro', precio: 3800, costo: 2200, stock: 12, departamento: 'Zapatos de Baile', inventarioActivo: true },
          { id: 'p3', codigo: 'FAM-03', nombre: 'Falda de Ensayo Flamenco - Seda Volante Rojo', precio: 1800, costo: 950, stock: 6, departamento: 'Uniformes', inventarioActivo: true },
          { id: 'p4', codigo: 'TSH-04', nombre: 'Camiseta Oficial Aura Dance Academy Unisex - Algodón Premium', precio: 850, costo: 350, stock: 25, departamento: 'Uniformes', inventarioActivo: true },
          { id: 'p5', codigo: 'BEB-05', nombre: 'Botella de Agua Mineral Fría - 500ml de Manantial', precio: 50, costo: 15, stock: 40, departamento: 'Bebidas', inventarioActivo: true },
          { id: 'p6', codigo: 'BOL-06', nombre: 'Bolso Deportivo Aura Grande con Compartimento para Zapatos', precio: 1200, costo: 600, stock: 15, departamento: 'Accesorios', inventarioActivo: true }
        ];
        setProducts(defaultProducts);
        localStorage.setItem('aura_billing_products', JSON.stringify(defaultProducts));
      }

      if (storedSales) {
        setSales(JSON.parse(storedSales));
      } else {
        const defaultSales: Sale[] = [
          {
            id: 'sal1',
            codigo: 'FAC-741258',
            items: [
              { productId: 'p1', productoNombre: 'Zapatos de Salsa Profesional - Girasol Taco 5.5', precio: 4500, cantidad: 1 },
              { productId: 'p5', productoNombre: 'Botella de Agua Mineral Fría - 500ml de Manantial', precio: 50, cantidad: 2 }
            ],
            subtotal: 4600,
            itbis: 828,
            total: 10258, // corrected sum or just arbitrary
            fecha: new Date().toISOString().substring(0, 10),
            clienteId: 'default',
            clienteNombre: 'Consumidor Final',
            metodoPago: 'Efectivo',
            pagadoCon: 11000,
            cambio: 742,
            estado: 'Completado'
          }
        ];
        setSales(defaultSales);
        localStorage.setItem('aura_billing_sales', JSON.stringify(defaultSales));
      }

      if (storedRecibos) {
        setRecibos(JSON.parse(storedRecibos));
      }

      if (storedTicketSettings) {
        setTicketSettings(JSON.parse(storedTicketSettings));
      }
    } catch (error) {
      console.error("No se pudo cargar datos de localStorage: ", error);
    }
  }, []);

  // Update dynamic time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to persist state securely inside React state and LocalStorage simultaneously
  const saveAlumnos = (newAlumnos: Alumno[]) => {
    setAlumnos(newAlumnos);
    localStorage.setItem('aura_alumnos', JSON.stringify(newAlumnos));
  };

  const saveClases = (newClases: Clase[]) => {
    setClases(newClases);
    localStorage.setItem('aura_clases', JSON.stringify(newClases));
  };

  const savePagos = (newPagos: Pago[]) => {
    setPagos(newPagos);
    localStorage.setItem('aura_pagos', JSON.stringify(newPagos));
  };

  const saveAsistencias = (newAsistencias: RegistroAsistencia[]) => {
    setAsistencias(newAsistencias);
    localStorage.setItem('aura_asistencias', JSON.stringify(newAsistencias));
  };

  const saveAreas = (newAreas: AreaTrabajo[]) => {
    setAreas(newAreas);
    localStorage.setItem('aura_areas', JSON.stringify(newAreas));
  };

  const saveEmpleados = (newEmpleados: Empleado[]) => {
    setEmpleados(newEmpleados);
    localStorage.setItem('aura_empleados', JSON.stringify(newEmpleados));
  };

  const saveIngresos = (newIngresos: Ingreso[]) => {
    setIngresos(newIngresos);
    localStorage.setItem('aura_ingresos', JSON.stringify(newIngresos));
  };

  const saveEgresos = (newEgresos: Egreso[]) => {
    setEgresos(newEgresos);
    localStorage.setItem('aura_egresos', JSON.stringify(newEgresos));
  };

  // Restores database to initial mock layout instantly
  const resetToFactoryDefaults = async () => {
    const confirmed = await showConfirm(
      '¿Desea eliminar todos los registros actuales para comenzar desde cero con su propia información (estudiantes, profesores, pagos, etc.)? Esta acción borrará todo permanentemente.',
      { title: 'Vaciar toda la Base de Datos', confirmLabel: 'Sí, borrar todo', cancelLabel: 'Cancelar', isDanger: true }
    );
    if (confirmed) {
      setAlumnos(INITIAL_STUDENTS);
      setClases(INITIAL_CLASSES);
      setPagos(INITIAL_PAYMENTS);
      setAsistencias(INITIAL_ATTENDANCE);
      setAreas(INITIAL_AREAS);
      setEmpleados(INITIAL_EMPLOYEES);
      setIngresos([]);
      setEgresos([]);
      localStorage.setItem('aura_alumnos', JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem('aura_clases', JSON.stringify(INITIAL_CLASSES));
      localStorage.setItem('aura_pagos', JSON.stringify(INITIAL_PAYMENTS));
      localStorage.setItem('aura_asistencias', JSON.stringify(INITIAL_ATTENDANCE));
      localStorage.setItem('aura_areas', JSON.stringify(INITIAL_AREAS));
      localStorage.setItem('aura_empleados', JSON.stringify(INITIAL_EMPLOYEES));
      localStorage.setItem('aura_ingresos', JSON.stringify([]));
      localStorage.setItem('aura_egresos', JSON.stringify([]));
      await showAlert('Toda la base de datos de prueba ha sido eliminada con éxito. ¡Ya puede registrar sus propios datos!', 'Base de Datos Vacía');
      setActiveTab('dashboard');
    }
  };

  // --- ACTIONS LOGIC FOR INCOMES ---
  const handleAddIncome = (newI: Omit<Ingreso, 'id'>) => {
    const newId = 'i' + (Date.now() + Math.floor(Math.random() * 1000));
    const createdIncome: Ingreso = {
      ...newI,
      id: newId
    };
    saveIngresos([...ingresos, createdIncome]);
  };

  const handleDeleteIncome = (id: string) => {
    const nextIngresos = ingresos.filter(i => i.id !== id);
    saveIngresos(nextIngresos);
  };

  // --- ACTIONS LOGIC FOR EXPENSES ---
  const handleAddExpense = (newEg: Omit<Egreso, 'id'>) => {
    const newId = 'eg' + (Date.now() + Math.floor(Math.random() * 1000));
    const createdExpense: Egreso = {
      ...newEg,
      id: newId
    };
    saveEgresos([...egresos, createdExpense]);
  };

  const handleDeleteExpense = (id: string) => {
    const nextEgresos = egresos.filter(eg => eg.id !== id);
    saveEgresos(nextEgresos);
  };

  // --- ACTIONS LOGIC FOR STUDENTS ---
  const handleAddStudent = (newS: Omit<Alumno, 'id'>) => {
    const newId = 'a' + (Date.now() + Math.floor(Math.random() * 1000));
    const createdStudent: Alumno = {
      ...newS,
      id: newId
    };

    const nextAlumnos = [...alumnos, createdStudent];
    saveAlumnos(nextAlumnos);

    // Create custom starting payment transaction based on user's registration entries
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentMonthLabel = `${months[new Date().getMonth()]} ${new Date().getFullYear()}`;

    const newPayments = [...pagos];

    // 1. Pago Inicial de Inscripción (si se definió monto)
    const initialMonto = Number(createdStudent.montoPagoInicial) || 0;
    if (initialMonto > 0) {
      const initialFecha = createdStudent.fechaPagoInicial || null;
      const initialStatus = initialMonto > 0 && initialFecha ? 'Pagado' : 'Pendiente';
      newPayments.push({
        id: 'p' + (Date.now() + 1),
        alumnoId: newId,
        mes: `Inscripción inicial`,
        monto: initialMonto,
        fechaPago: initialFecha,
        estado: initialStatus,
        metodoPago: initialFecha ? 'Efectivo' : null
      });
    }

    // 2. Mensualidad Ordinaria
    const monthlyMonto = Number(createdStudent.montoMensualidad) || 0;
    const monthlyFecha = createdStudent.fechaPagoMensualidad || null;
    const monthlyStatus = monthlyMonto > 0 && monthlyFecha ? 'Pagado' : 'Pendiente';

    newPayments.push({
      id: 'p' + (Date.now() + 10),
      alumnoId: newId,
      mes: currentMonthLabel,
      monto: monthlyMonto > 0 ? monthlyMonto : 2000, // RD$ 2,000 standard fallback if none entered
      fechaPago: monthlyFecha,
      estado: monthlyStatus,
      metodoPago: monthlyFecha ? 'Efectivo' : null
    });

    savePagos(newPayments);
  };

  const handleUpdateStudent = (updatedStudent: Alumno) => {
    const nextAlumnos = alumnos.map(a => a.id === updatedStudent.id ? updatedStudent : a);
    saveAlumnos(nextAlumnos);
  };

  const handleToggleStudentStatus = (id: string) => {
    const nextAlumnos = alumnos.map(a => {
      if (a.id === id) {
        return { ...a, activo: !a.activo };
      }
      return a;
    });
    saveAlumnos(nextAlumnos);
  };

  const handleDeleteStudent = (id: string) => {
    // delete student
    const nextAlumnos = alumnos.filter(a => a.id !== id);
    saveAlumnos(nextAlumnos);
    
    // delete their linked payments to avoid database sync orphans
    const nextPagos = pagos.filter(p => p.alumnoId !== id);
    savePagos(nextPagos);

    // delete attendance logs
    const nextAsistencias = asistencias.filter(as => as.alumnoId !== id);
    saveAsistencias(nextAsistencias);
  };

  // --- ACTIONS LOGIC FOR CLASSES ---
  const handleAddClass = (newC: Omit<Clase, 'id'>) => {
    const newId = 'c' + (Date.now() + Math.floor(Math.random() * 1000));
    const createdClass: Clase = {
      ...newC,
      id: newId
    };
    saveClases([...clases, createdClass]);
  };

  const handleUpdateClass = (updatedClass: Clase) => {
    const nextClases = clases.map(c => c.id === updatedClass.id ? updatedClass : c);
    saveClases(nextClases);
  };

  const handleDeleteClass = (id: string) => {
    const nextClases = clases.filter(c => c.id !== id);
    saveClases(nextClases);
  };

  // --- ACTIONS LOGIC FOR PAYMENTS ---
  const handleAddPayment = (newP: Omit<Pago, 'id'>) => {
    const newId = 'p' + (Date.now() + Math.floor(Math.random() * 1000));
    const createdPago: Pago = {
      ...newP,
      id: newId
    };
    savePagos([...pagos, createdPago]);
  };

  const handlePayMonthly = (paymentId: string, info: { fechaPago: string; metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta' }) => {
    const nextPagos = pagos.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          estado: 'Pagado' as const,
          fechaPago: info.fechaPago,
          metodoPago: info.metodoPago
        };
      }
      return p;
    });
    savePagos(nextPagos);
  };

  const handleDeletePayment = (id: string) => {
    const nextPagos = pagos.filter(p => p.id !== id);
    savePagos(nextPagos);
  };

  // --- ACTIONS LOGIC FOR ATTENDANCE ---
  // Receives an array of updated records to write on-the-fly.
  // Updates/upserts and persists.
  const handleSaveAttendanceBatch = (batch: Omit<RegistroAsistencia, 'id'>[]) => {
    let currentAsistencias = [...asistencias];

    batch.forEach(newRecord => {
      // Look if there's already a saved log for this student on this specific day and class
      const matchIndex = currentAsistencias.findIndex(
        item => item.fecha === newRecord.fecha && 
                item.claseId === newRecord.claseId && 
                item.alumnoId === newRecord.alumnoId
      );

      if (matchIndex >= 0) {
        // Edit existing log status
        currentAsistencias[matchIndex] = {
          ...currentAsistencias[matchIndex],
          estado: newRecord.estado
        };
      } else {
        // Create new log with new unique ID
        const generatedId = 'at' + (Date.now() + Math.floor(Math.random() * 10000));
        currentAsistencias.push({
          ...newRecord,
          id: generatedId
        });
      }
    });

    saveAsistencias(currentAsistencias);
  };

  // Quick Action triggers redirect with prompt to add student
  const triggerQuickAddStudentFlow = () => {
    setActiveTab('students');
    setTimeout(() => {
      // Simulate click of add modal button beautifully!
      const btn = document.getElementById('btn-add-student-modal');
      if (btn) btn.click();
    }, 150);
  };

  // --- ACTIONS LOGIC FOR STAFF / DEPARTMENTS ---
  const handleAddArea = (newArea: Omit<AreaTrabajo, 'id'>) => {
    const newId = 'ar' + (Date.now() + Math.floor(Math.random() * 1000));
    const createdArea: AreaTrabajo = {
      ...newArea,
      id: newId
    };
    saveAreas([...areas, createdArea]);
  };

  const handleUpdateArea = (updatedArea: AreaTrabajo) => {
    const nextAreas = areas.map(a => a.id === updatedArea.id ? updatedArea : a);
    saveAreas(nextAreas);
  };

  const handleDeleteArea = (id: string) => {
    const nextAreas = areas.filter(a => a.id !== id);
    saveAreas(nextAreas);
  };

  const handleAddEmployee = (newEmp: Omit<Empleado, 'id'>) => {
    const newId = 'e' + (Date.now() + Math.floor(Math.random() * 1000));
    const createdEmp: Empleado = {
      ...newEmp,
      id: newId
    };
    saveEmpleados([...empleados, createdEmp]);
  };

  const handleUpdateEmployee = (updatedEmp: Empleado) => {
    const nextEmpleados = empleados.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    saveEmpleados(nextEmpleados);
  };

  const handleDeleteEmployee = (id: string) => {
    const nextEmpleados = empleados.filter(e => e.id !== id);
    saveEmpleados(nextEmpleados);
  };

  const handleToggleEmployeeStatus = (id: string) => {
    const nextEmpleados = empleados.map(e => e.id === id ? { ...e, activo: !e.activo } : e);
    saveEmpleados(nextEmpleados);
  };

  return (
    <div className="min-h-screen bg-black font-sans text-stone-250 selection:bg-gold-500 selection:text-black">
      
      {/* Brand Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-gold-500/30 gold-glow">
              <span className="font-display font-black text-lg text-gold-500 tracking-wider">N</span>
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-widest text-white uppercase block">
                NEW DANCE <span className="text-gold-500">SYSTEM</span>
              </span>
              <span className="text-[9px] text-zinc-500 tracking-wider uppercase font-mono block">
                Academia Premium de Baile
              </span>
            </div>
          </div>

          {/* Desktop Right Info bar - Current Date/Time + Admin identity */}
          <div className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
            {/* Real-time ticker clock */}
            <div className="flex items-center gap-2 rounded-full bg-zinc-900/60 px-3.5 py-1.5 border border-zinc-850">
              <Clock className="h-3.5 w-3.5 text-gold-500" />
              <span className="font-mono text-[11px] text-zinc-300">
                {currentTime.toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short' })} • {currentTime.toLocaleTimeString('es-DO')}
              </span>
            </div>

            {/* Admin Tag */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gold-950 flex items-center justify-center border border-gold-900">
                <UserCircle className="h-4.5 w-4.5 text-gold-500" />
              </div>
              <div>
                <span className="text-white font-semibold block">Admin NDS</span>
                <span className="text-[10px] text-emerald-400 font-mono">En Línea • Local</span>
              </div>
            </div>
          </div>

          {/* Mobile responsive toggle control */}
          <div className="md:hidden">
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Structural Frame Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">

          {/* SIDEBAR NAVIGATION (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <nav className="space-y-1.5">
              
              {/* Dashboard Tab */}
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-gold-500 pl-3 shadow-lg shadow-gold-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Tablero Principal</span>
              </button>

              {/* Alumnos / Inscripciones Tab */}
              <button
                id="tab-students"
                onClick={() => setActiveTab('students')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-gold-500 pl-3 shadow-lg shadow-gold-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <Users className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Inscripciones</span>
              </button>

              {/* Horarios Tab */}
              <button
                id="tab-classes"
                onClick={() => setActiveTab('classes')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'classes'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-gold-500 pl-3 shadow-lg shadow-gold-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <CalendarDays className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Horarios Clases</span>
              </button>

              {/* Pagos Tab */}
              <button
                id="tab-payments"
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-gold-500 pl-3 shadow-lg shadow-gold-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <DollarSign className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Gestión de Pagos</span>
              </button>

              {/* Asistencia Tab */}
              <button
                id="tab-attendance"
                onClick={() => setActiveTab('attendance')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'attendance'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-gold-500 pl-3 shadow-lg shadow-gold-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <CheckSquare className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Asistencia Diaria</span>
              </button>

              {/* Personal de Trabajo Tab */}
              <button
                id="tab-staff"
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-gold-500 pl-3 shadow-lg shadow-gold-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Personal de Trabajo</span>
              </button>

              {/* Tienda Aura / Facturación POS Tab */}
              <button
                id="tab-billing"
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-emerald-555 pl-3 shadow-lg shadow-emerald-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <Store className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-white">Facturación / Tienda</span>
              </button>

              {/* Ingresos Tab */}
              <button
                id="tab-incomes"
                onClick={() => setActiveTab('incomes')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'incomes'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-emerald-500 pl-3 shadow-lg shadow-emerald-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-white">Ingresos</span>
              </button>

              {/* Egresos Tab */}
              <button
                id="tab-expenses"
                onClick={() => setActiveTab('expenses')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'expenses'
                    ? 'bg-zinc-900 text-white font-extrabold border-l-4 border-rose-500 pl-3 shadow-lg shadow-rose-500/10'
                    : 'text-white hover:bg-zinc-900/60'
                }`}
              >
                <TrendingDown className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="text-white">Egresos</span>
              </button>
            </nav>

            {/* Factory utilities block */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-4 pt-5">
              <span className="text-[10px] tracking-widest font-mono uppercase text-white font-semibold block font-mono">Base de Datos</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                ¿Desea borrar todos los datos de ejemplo del sistema y comenzar con una base de datos limpia?
              </p>
              
              <button
                id="btn-factory-reset"
                onClick={resetToFactoryDefaults}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-950/20 py-2 text-xs font-semibold text-rose-400 border border-rose-900/40 hover:bg-rose-950/40 hover:border-rose-800 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-455" />
                <span className="text-white">Vaciar Base de Datos</span>
              </button>
            </div>
          </aside>

          {/* MOBILE NAVIGATION OVERLAY */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-30 bg-black/95 backdrop-blur-md md:hidden flex flex-col justify-between p-6 animate-fade-in">
              <div className="space-y-6 pt-16">
                <span className="text-xs uppercase tracking-widest font-mono text-gold-500 block">Menú Administrativo</span>
                
                <nav className="space-y-3">
                  <button
                    onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'dashboard' ? 'bg-zinc-900 text-white border-l-4 border-gold-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5 text-white" />
                    <span className="text-white">Tablero Principal</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'students' ? 'bg-zinc-900 text-white border-l-4 border-gold-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Users className="h-5 w-5 text-white" />
                    <span className="text-white">Inscripciones</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('classes'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'classes' ? 'bg-zinc-900 text-white border-l-4 border-gold-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <CalendarDays className="h-5 w-5 text-white" />
                    <span className="text-white">Horarios Clases</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('payments'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'payments' ? 'bg-zinc-900 text-white border-l-4 border-gold-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <DollarSign className="h-5 w-5 text-white" />
                    <span className="text-white">Gestión de Pagos</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'attendance' ? 'bg-zinc-900 text-white border-l-4 border-gold-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <CheckSquare className="h-5 w-5 text-white" />
                    <span className="text-white">Asistencia Diaria</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('staff'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'staff' ? 'bg-zinc-900 text-white border-l-4 border-gold-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Briefcase className="h-5 w-5 text-white" />
                    <span className="text-white">Personal de Trabajo</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'billing' ? 'bg-zinc-900 text-white border-l-4 border-emerald-555 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Store className="h-5 w-5 text-emerald-450" />
                    <span className="text-white">Facturación / Tienda</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('incomes'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'incomes' ? 'bg-zinc-900 text-white border-l-4 border-emerald-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <span className="text-white">Ingresos</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('expenses'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                      activeTab === 'expenses' ? 'bg-zinc-900 text-white border-l-4 border-rose-500 pl-3 font-extrabold' : 'text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                    <span className="text-white">Egresos</span>
                  </button>
                </nav>
              </div>

              {/* Utility block */}
              <div className="space-y-4 pb-12">
                <button
                  onClick={() => { resetToFactoryDefaults(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-rose-505 border border-zinc-850"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  <span className="text-white">Vaciar toda la Base de Datos</span>
                </button>
                <div className="text-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">NEW DANCE SYSTEM v1.1 • LOCAL</span>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TAB MAIN CONTENT AREA (Span 4) */}
          <main className="lg:col-span-4 min-h-[70vh]">
            
            {activeTab === 'dashboard' && (
              <DashboardOverview
                alumnos={alumnos}
                clases={clases}
                pagos={pagos}
                asistencias={asistencias}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onQuickAddStudent={triggerQuickAddStudentFlow}
              />
            )}

            {activeTab === 'students' && (
              <StudentModule
                alumnos={alumnos}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onToggleStatus={handleToggleStudentStatus}
                onDeleteStudent={handleDeleteStudent}
              />
            )}

            {activeTab === 'classes' && (
              <ClassModule
                clases={clases}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentModule
                pagos={pagos}
                alumnos={alumnos}
                onAddPayment={handleAddPayment}
                onPayMonthly={handlePayMonthly}
                onDeletePayment={handleDeletePayment}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceModule
                asistencias={asistencias}
                alumnos={alumnos}
                clases={clases}
                onSaveAttendanceBatch={handleSaveAttendanceBatch}
              />
            )}

            {activeTab === 'staff' && (
              <StaffModule
                areas={areas}
                empleados={empleados}
                onAddArea={handleAddArea}
                onUpdateArea={handleUpdateArea}
                onDeleteArea={handleDeleteArea}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onToggleEmployeeStatus={handleToggleEmployeeStatus}
              />
            )}

            {activeTab === 'incomes' && (
              <IncomeModule
                ingresos={ingresos}
                pagos={pagos}
                alumnos={alumnos}
                onAddIncome={handleAddIncome}
                onDeleteIncome={handleDeleteIncome}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpenseModule
                egresos={egresos}
                empleados={empleados}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'billing' && (
              <GeneralBillingView
                settings={ticketSettings}
                products={products}
                setProducts={setProducts}
                sales={sales}
                setSales={setSales}
                alumnos={alumnos}
                onAddIncome={handleAddIncome}
                onDeleteIncomeByConcept={(conceptPrefix) => {
                  const filtered = ingresos.filter(i => !i.concepto.startsWith(conceptPrefix));
                  saveIngresos(filtered);
                }}
                onUpdateSettings={(newSettings) => {
                  setTicketSettings(newSettings);
                  localStorage.setItem('aura_billing_settings', JSON.stringify(newSettings));
                }}
              />
            )}

          </main>

        </div>
      </div>

      {/* Footer block */}
      <footer className="mt-16 border-t border-zinc-950 bg-black py-8 pr-4 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold">Almacenamiento Local de Datos Activo</span>
          </div>
          <p className="text-xs text-zinc-500 max-w-lg mx-auto leading-relaxed">
            Este software fue diseñado especialmente para usarse localmente ("100% offline"). Guarda de forma instantánea cualquier inscripción, horario semanal, pago mensual o pase de asistencia en la base de datos de almacenamiento local de su navegador web, garantizando compatibilidad multiplataforma instantánea.
          </p>
          <div className="text-[10px] text-zinc-650 font-mono pt-2">
            © {new Date().getFullYear()} Aura Premium Academy • Diseñado con Oro, Blanco y Negro.
          </div>
        </div>
      </footer>

    </div>
  );
}
