/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Alumno, Clase, Pago, RegistroAsistencia, AreaTrabajo, Empleado, ActividadExtra, RegistroSuplencia } from './types';

export const ALL_MODULE_PERMISSIONS = [
  { id: 'dashboard', label: 'Tablero & Resumen', icon: 'LayoutDashboard', desc: 'Vista principal de indicadores y gráficos' },
  { id: 'students', label: 'Alumnos / Estudiantes', icon: 'GraduationCap', desc: 'Registro, fichas y control de alumnos' },
  { id: 'classes', label: 'Clases & Ritmos', icon: 'Calendar', desc: 'Creación y horarios de clases de baile' },
  { id: 'attendance', label: 'Asistencias & Check-in', icon: 'UserCheck', desc: 'Registro diario de asistencias a clases' },
  { id: 'billing', label: 'Cobro Express (POS)', icon: 'Receipt', desc: 'Facturación y cobranza en el mostrador' },
  { id: 'products', label: 'Catálogo de Productos', icon: 'Package', desc: 'Gestión de productos para venta' },
  { id: 'quotes', label: 'Cotizaciones', icon: 'FileText', desc: 'Presupuestos para clientes y eventos' },
  { id: 'sales', label: 'Histórico de Ventas', icon: 'ShoppingBag', desc: 'Consulta de recibos y facturas' },
  { id: 'inventory', label: 'Inventario & Stock', icon: 'Boxes', desc: 'Control de existencias y almacén' },
  { id: 'clients', label: 'Clientes POS', icon: 'Contact', desc: 'Fichero de clientes particulares' },
  { id: 'staff', label: 'Profesores & Personal', icon: 'Users', desc: 'Administración de nómina y maestros' },
  { id: 'substitutions', label: 'Suplencias', icon: 'UserPlus', desc: 'Registro de reemplazos de profesores' },
  { id: 'activities', label: 'Actividades Extra', icon: 'Compass', desc: 'Excursiones, talleres y eventos' },
  { id: 'income', label: 'Control de Ingresos', icon: 'TrendingUp', desc: 'Entradas de dinero y cobros' },
  { id: 'expenses', label: 'Control de Egresos', icon: 'TrendingDown', desc: 'Gastos operativos, pagos e insumos' },
  { id: 'rental', label: 'Alquiler de Salones', icon: 'Building2', desc: 'Reserva y cobro de espacios de estudio' },
  { id: 'corte_caja', label: 'Corte de Caja', icon: 'Calculator', desc: 'Apertura, arqueo y cierre diario de caja' },
  { id: 'users', label: 'Usuarios y Permisos', icon: 'ShieldCheck', desc: 'Creación de cuentas, claves y cargos' },
  { id: 'config', label: 'Ajustes del Sistema', icon: 'Settings', desc: 'Configuración general de la academia' },
];

export const ROLE_PRESET_PERMISSIONS: Record<string, string[]> = {
  'Director General': ALL_MODULE_PERMISSIONS.map(m => m.id),
  'Administrador': ALL_MODULE_PERMISSIONS.map(m => m.id),
  'Recepcionista': ['dashboard', 'students', 'attendance', 'billing', 'products', 'quotes', 'sales', 'clients', 'activities', 'rental', 'corte_caja'],
  'Profesor': ['dashboard', 'students', 'classes', 'attendance', 'substitutions', 'activities'],
  'Contador': ['dashboard', 'sales', 'income', 'expenses', 'corte_caja', 'rental', 'quotes', 'billing'],
  'Personalizado': ['dashboard', 'students']
};

export const INITIAL_USERS = [
  {
    id: 'usr-admin-1',
    nombre: 'Director General (Administrador)',
    username: 'admin',
    password: 'admin123',
    cargo: 'Director General' as const,
    email: 'director@newdancerd.com',
    telefono: '809-555-0100',
    estado: 'Activo' as const,
    permisos: ALL_MODULE_PERMISSIONS.map(m => m.id),
    esSuperAdmin: true,
    fechaCreacion: '2026-01-01 08:00',
    ultimoAcceso: '2026-07-21 14:30'
  },
  {
    id: 'usr-recep-1',
    nombre: 'Valeria Gómez (Recepcionista)',
    username: 'valeria',
    password: 'dance2026',
    cargo: 'Recepcionista' as const,
    email: 'recepcion@newdancerd.com',
    telefono: '809-555-0122',
    estado: 'Activo' as const,
    permisos: ROLE_PRESET_PERMISSIONS['Recepcionista'],
    esSuperAdmin: false,
    fechaCreacion: '2026-03-15 09:00',
    ultimoAcceso: '2026-07-21 10:15'
  },
  {
    id: 'usr-prof-1',
    nombre: 'Carlos Ruiz (Profesor Titular)',
    username: 'cruiz',
    password: 'salsa123',
    cargo: 'Profesor' as const,
    email: 'cruiz@newdancerd.com',
    telefono: '809-555-0188',
    estado: 'Activo' as const,
    permisos: ROLE_PRESET_PERMISSIONS['Profesor'],
    esSuperAdmin: false,
    fechaCreacion: '2026-02-10 11:00',
    ultimoAcceso: '2026-07-20 18:00'
  }
];

export const INITIAL_STUDENTS: Alumno[] = [];
export const INITIAL_CLASSES: Clase[] = [];
export const INITIAL_PAYMENTS: Pago[] = [];
export const INITIAL_ATTENDANCE: RegistroAsistencia[] = [];
export const INITIAL_AREAS: AreaTrabajo[] = [];
export const INITIAL_EMPLOYEES: Empleado[] = [];

export const INITIAL_SUBSTITUTIONS: RegistroSuplencia[] = [
  {
    id: 'sup1',
    fecha: '2026-07-20',
    profesorTitular: 'Prof. Carlos Ruiz',
    profesorSuplente: 'Prof. Marcos Peña (Suplente)',
    telefonoSuplente: '809-555-0199',
    claseNombre: 'Salsa Intermedio II',
    horario: '18:00 - 19:30',
    salon: 'Salón de Oro',
    montoPago: 1500,
    estadoPago: 'Pagado',
    metodoPago: 'Efectivo',
    fechaPago: '2026-07-20',
    alumnosCorrespondientes: [
      { alumnoId: 's1', alumnoNombre: 'Carlos Eduardo Ramírez' },
      { alumnoId: 's2', alumnoNombre: 'Sofía María Martínez' }
    ],
    motivoObservacion: 'Suplencia por viaje personal del titular'
  },
  {
    id: 'sup2',
    fecha: '2026-07-22',
    profesorTitular: 'Prof. Ana María Santos',
    profesorSuplente: 'Prof. Laura Díaz',
    telefonoSuplente: '829-555-0244',
    claseNombre: 'Bachata Sensual Parejas',
    horario: '19:30 - 21:00',
    salon: 'Salón Cristal',
    montoPago: 1800,
    estadoPago: 'Pendiente',
    alumnosCorrespondientes: [
      { alumnoId: 's3', alumnoNombre: 'Alejandro José Gómez' }
    ],
    motivoObservacion: 'Permiso médico del titular'
  }
];


export const INITIAL_ACTIVITIES: ActividadExtra[] = [
  {
    id: 'act1',
    titulo: 'Tour Bachata & Salsa Resort Punta Cana 2026',
    tipo: 'Tour',
    fecha: '2026-08-15',
    hora: '07:00 AM - 08:00 PM (Fin de Semana)',
    lugar: 'Punta Cana Resort & Club',
    precio: 8500,
    cuposMaximos: 30,
    instructorProfesor: 'Prof. Carlos Ruiz & Staff NDS',
    estado: 'Abierto',
    descripcion: 'Viaje extracurricular con transporte privado, hospedaje, talleres de playa, fiesta de gala nocturna y alimentos incluidos.',
    inscritos: [
      { id: 'ins1', alumnoId: 's1', alumnoNombre: 'Carlos Eduardo Ramírez', fechaInscripcion: '2026-07-01', montoPagado: 8500, estadoPago: 'Pagado', metodoPago: 'Transferencia', observaciones: 'Pago completo del paquete con transporte' },
      { id: 'ins2', alumnoId: 's2', alumnoNombre: 'Sofía María Martínez', fechaInscripcion: '2026-07-05', montoPagado: 4000, estadoPago: 'Abono Parcial', metodoPago: 'Efectivo', observaciones: 'Abono inicial 50%, restan RD$ 4,500' }
    ]
  },
  {
    id: 'act2',
    titulo: 'Masterclass Intensiva: Pasitos Dominicanos & Musicalidad',
    tipo: 'Masterclass',
    fecha: '2026-08-02',
    hora: '04:00 PM - 07:00 PM',
    lugar: 'Salón de Oro - Academia NDS',
    precio: 2500,
    cuposMaximos: 20,
    instructorProfesor: 'Maestro Invitado Juan "El Guaguancó"',
    estado: 'Abierto',
    descripcion: 'Taller práctico intensivo enfocado en sincopación, juegos de pies avanzados y aislamiento corporal en Salsa Dura.',
    inscritos: [
      { id: 'ins3', alumnoId: 's3', alumnoNombre: 'Alejandro José Gómez', fechaInscripcion: '2026-07-10', montoPagado: 2500, estadoPago: 'Pagado', metodoPago: 'Tarjeta' }
    ]
  },
  {
    id: 'act3',
    titulo: 'Curso Especial: Acrobacias y Cargas para Parejas de Baile',
    tipo: 'Curso Especial',
    fecha: '2026-08-20',
    hora: '06:00 PM - 08:00 PM (4 Sesiones)',
    lugar: 'Salón Cristal - Academia NDS',
    precio: 4500,
    cuposMaximos: 12,
    instructorProfesor: 'Prof. Roberto Almonte & Prof. Lucía',
    estado: 'Abierto',
    descripcion: 'Taller de 4 módulos teóricos y prácticos sobre biomecánica, seguridad y ejecución de trucos aéreos para competencias.',
    inscritos: []
  },
  {
    id: 'act4',
    titulo: 'Viaje y Exhibición Inter-Academia Santiago de los Caballeros',
    tipo: 'Viaje',
    fecha: '2026-09-12',
    hora: '06:00 AM - 10:00 PM',
    lugar: 'Centro Cultural Eduardo León Jimenes, Santiago',
    precio: 6000,
    cuposMaximos: 25,
    instructorProfesor: 'Dirección Artística NDS',
    estado: 'Abierto',
    descripcion: 'Participación en el Gran Encuentro Nacional de Academias de Baile en Santiago. Incluye transporte VIP y traje de presentación.',
    inscritos: []
  }
];

export const INITIAL_SALONES = [
  {
    id: 'sal1',
    nombre: 'Salón Principal Aura (Gran Pista)',
    capacidadPersonas: 80,
    precioPorHora: 2500,
    dimensionesMetros: '15m x 10m (150 m²)',
    equipamiento: ['Aire Acondicionado Inverter', 'Pista de Madera Flotante', 'Espejos de Pared Completa', 'Sistema de Sonido Yamaha 3000W', 'Luces LED RGB Inteligentes', 'Proyector 4K'],
    estado: 'Disponible' as const,
    descripcion: 'Espacio de gran formato con excelente acústica y ventilación, ideal para ensayos multitudinarios, eventos corporativos, talleres y filmaciones.'
  },
  {
    id: 'sal2',
    nombre: 'Salón VIP / Espejos (Pista B)',
    capacidadPersonas: 35,
    precioPorHora: 1800,
    dimensionesMetros: '10m x 7m (70 m²)',
    equipamiento: ['Aire Acondicionado 36,000 BTU', 'Pista Flexi-Dance', 'Espejos Frontales y Laterales', 'Consola Bluetooth JBL', 'Barras de Ballet'],
    estado: 'Disponible' as const,
    descripcion: 'Salón íntimo insonorizado perfecto para clases particulares, ensayos de parejas de competencia y sesiones fotográficas.'
  },
  {
    id: 'sal3',
    nombre: 'Salón C - Ritmos Urbanos & Flamenco',
    capacidadPersonas: 45,
    precioPorHora: 2000,
    dimensionesMetros: '11m x 8m (88 m²)',
    equipamiento: ['Piso de Madera Reforzado para Zapateo', 'Aire Acondicionado', 'Sonido Alta Fidelidad', 'Espejos Panorámicos'],
    estado: 'Disponible' as const,
    descripcion: 'Acondicionado especialmente con resonancia para tap, flamenco y baile urbano.'
  }
];

export const INITIAL_RENTALS = [
  {
    id: 'rnt1',
    codigo: 'RNT-2026-001',
    salonId: 'sal1',
    salonNombre: 'Salón Principal Aura (Gran Pista)',
    clienteNombre: 'Compañía de Danza Expresión Latina',
    clienteContacto: '809-555-8821 (Lic. Fernando Ramos)',
    actividadTipo: 'Ensayo / Compañía' as const,
    fecha: '2026-07-25',
    horaInicio: '14:00',
    horaFin: '18:00',
    duracionHoras: 4,
    precioPorHora: 2500,
    montoTotal: 10000,
    montoPagado: 10000,
    estadoPago: 'Pagado Total' as const,
    estadoReserva: 'Confirmado' as const,
    metodoPago: 'Transferencia' as const,
    observaciones: 'Ensayo general previa a competencia internacional. Requieren aire acondicionado al máximo y uso del sistema de sonido principal.',
    fechaRegistro: '2026-07-15'
  },
  {
    id: 'rnt2',
    codigo: 'RNT-2026-002',
    salonId: 'sal2',
    salonNombre: 'Salón VIP / Espejos (Pista B)',
    clienteNombre: 'Producciones Fotográficas Caribe Pop',
    clienteContacto: '829-555-3300 (Giselle Mota)',
    actividadTipo: 'Sesión Fotográfica / Grabación' as const,
    fecha: '2026-07-28',
    horaInicio: '09:00',
    horaFin: '12:00',
    duracionHoras: 3,
    precioPorHora: 1800,
    montoTotal: 5400,
    montoPagado: 2700,
    estadoPago: 'Abono Parcial' as const,
    estadoReserva: 'Reservado' as const,
    metodoPago: 'Efectivo' as const,
    observaciones: 'Grabación de video musical promocional. Se autoriza la entrada de equipo técnico de iluminación.',
    fechaRegistro: '2026-07-18'
  }
];

