/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Alumno {
  id: string;
  nombre: string;
  edad: number;
  ritmo: string; // Ej. Salsa, Bachata, Ballet, Hip Hop, Tango, Flamenco
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  contacto: string;
  fechaInscripcion: string; // YYYY-MM-DD
  activo: boolean;
  representante?: string; // Nombre y apellido del representante (si aplica)
  fechaCulminacion?: string; // Fecha de finalización (opcional)
  telefonoPersonal?: string; // Teléfono personal del alumno
  telefonoReferencia?: string; // Teléfono de referencia
  cedulaPasaporte?: string; // Cédula o pasaporte (alumno si es adulto, representante si es menor)
  correo?: string; // Correo electrónico
  fechaNacimiento?: string; // YYYY-MM-DD
  montoPagoInicial?: number; // Monto asignado o pagado al inscribirse
  fechaPagoInicial?: string; // YYYY-MM-DD de pago inicial
  montoMensualidad?: number; // Monto de la mensualidad recurrente (mensualidades posteriores)
  fechaPagoMensualidad?: string; // YYYY-MM-DD del pago de mensualidad
  planPago?: 'Mensual' | 'Trimestral' | 'Semestral' | 'Pago Único';
  descuentoValor?: number;
  descuentoTipo?: 'Porcentaje' | 'Fijo';
  horarioClases?: string; // Horario de clases
  observaciones?: string; // Notas u observaciones
  foto?: string; // Base64 representation of JPG photo of the student
  es2x1?: boolean; // Is under 2x1 promotion?
  acompananteNombre?: string; // Name of the companion
  acompananteFoto?: string; // Base64 representation of JPG photo of the companion
  acompananteContacto?: string; // Reference contact for the companion
  acompananteTelefono?: string; // Phone for companion
  acompananteCorreo?: string; // Email for companion
  acompananteCedula?: string; // ID/Passport of companion
  acompananteFechaVencimiento?: string; // YYYY-MM-DD for when the 1 month free grace period expires
  acompananteHorarioClases?: string; // Class schedule for the companion
  representanteFoto?: string; // Base64 representation of JPG photo of the representative/guardian
}

export interface Clase {
  id: string;
  nombre: string;
  ritmo: string;
  profesor: string;
  horario: string; // Ej. "18:00 - 19:30"
  dias: string[]; // Ej. ["Lunes", "Miércoles"]
  salon: string; // Ej. "Salón de Oro", "Salón Cristal", "Salón Ébano"
  capacidad: number;
}

export interface Pago {
  id: string;
  alumnoId: string;
  mes: string; // Ej. "2026-05" o "Mayo 2026"
  monto: number;
  montoOriginal?: number;
  planPago?: 'Mensual' | 'Trimestral' | 'Semestral' | 'Pago Único';
  descuentoValor?: number;
  descuentoTipo?: 'Porcentaje' | 'Fijo';
  fechaPago: string | null; // YYYY-MM-DD o null si pendiente
  estado: 'Pagado' | 'Pendiente' | 'Atrasado';
  metodoPago?: 'Efectivo' | 'Transferencia' | 'Tarjeta' | null;
}

export interface RegistroAsistencia {
  id: string;
  fecha: string; // YYYY-MM-DD
  claseId: string;
  alumnoId: string;
  estado: 'Asistió' | 'Faltó' | 'Justificado';
}

export interface HorarioEmpleado {
  id: string;
  dia: string; // Ej. "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  horaEntrada: string; // Ej. "18:00"
  horaSalida: string; // Ej. "20:00"
  observacion?: string; // Ej. "Clase Salsa I"
}

export interface AreaTrabajo {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  areaId: string;
  puesto: string; // Ej. Instructor de Salsa, Recepcionista, Coordinador
  salario: number; // Sueldo fijo mensual (si aplica, o 0)
  tipoPago?: 'Por Alumno' | 'Sueldo Fijo' | 'Mixto'; // Modalidad de pago
  pagoPorAlumno?: number; // Monto RD$ estipulado a pagar por alumno
  contacto: string; // Keep as fallback/general contact info
  fechaIngreso: string; // YYYY-MM-DD
  activo: boolean;
  whatsappPersonal?: string;
  whatsappFamiliar?: string;
  nombreFamiliar?: string;
  direccion?: string;
  horarioTrabajo?: string; // Resumen textual de horarios
  horarios?: HorarioEmpleado[]; // Lista de días y horarios asignados
  observacion?: string;
  foto?: string; // Base64 representation of JPG photo
}

export interface Ingreso {
  id: string;
  concepto: string; // Ej. Inscripción Inicial, Venta de Zapatos de Baile, Evento Especial
  monto: number;
  fecha: string; // YYYY-MM-DD
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  categoria: 'Inscripciones' | 'Mensualidades' | 'Clases Privadas' | 'Eventos' | 'Ventas' | 'Renta de Salones' | 'Otros';
  referencia?: string;
  observaciones?: string;
}

export interface Egreso {
  id: string;
  concepto: string; // Ej. Alquiler del Local, Pago de Nómina, Compra de Bebidas
  monto: number;
  fecha: string; // YYYY-MM-DD
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  categoria: 'Alquiler' | 'Nómina' | 'Servicios' | 'Mantenimiento' | 'Publicidad' | 'Insumos' | 'Otros';
  observaciones?: string;
}

export interface TicketSettings {
  nombreAcademia: string;
  rnc?: string;
  direccion?: string;
  telefono?: string;
  mensajeLargo?: string;
  
  // Custom Typography & Sizing configurations
  fuenteFamilia?: 'sans' | 'mono' | 'serif' | 'grotesk' | 'courier';
  tamanoLetraTitulo?: 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl';
  tamanoLetraCuerpo?: 'text-[10px]' | 'text-xs' | 'text-sm' | 'text-base';
  tamanoLetraFooter?: 'text-[8px]' | 'text-[9px]' | 'text-[10px]' | 'text-xs' | 'text-sm';
  alineacionTexto?: 'text-left' | 'text-center' | 'text-right';
  mostrarBordes?: boolean;
  mostrarRNC?: boolean;
  mostrarDireccion?: boolean;
  mostrarTelefono?: boolean;
  mostrarSeparadorDoble?: boolean;
  colorTemaTicket?: 'light-classic' | 'dark-premium' | 'cream-retro' | 'white-clean';
  logoUrl?: string; // Base64 image
  mostrarLogo?: boolean;
  logoFondoUrl?: string; // Watermark image (defaulting to New Dance RD)
  mostrarLogoFondo?: boolean; // Show background watermark in tickets
  opacidadLogoFondo?: number; // Opacity level (0.01 to 0.3)
  mostrarLogoFondoPanel?: boolean; // Show background watermark in dashboard/workspace panel
}

export interface Product {
  id: string;
  codigo?: string;
  nombre: string;
  precio: number;
  costo?: number;
  stock: number;
  stockMinimo?: number; // Cantidad mínima para alerta de agotamiento / reabastecimiento
  departamento: string;
  inventarioActivo?: boolean;
  foto?: string; // Representation of JPG photo
}

export interface SaleItem {
  productId: string;
  productoNombre: string;
  precio: number;
  cantidad: number;
}

export interface Sale {
  id: string;
  codigo: string;
  items: SaleItem[];
  subtotal: number;
  itbis: number;
  total: number;
  fecha: string; // YYYY-MM-DD
  clienteId: string; // ID o "default"
  clienteNombre?: string;
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  pagadoCon?: number;
  cambio?: number;
  estado: 'Completado' | 'Cotización';
}

export interface Recibo {
  id: string;
  saleId: string;
  fecha: string;
  total: number;
  clienteNombre?: string;
}

export interface InscripcionActividad {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  fechaInscripcion: string;
  montoPagado: number;
  estadoPago: 'Pagado' | 'Pendiente' | 'Abono Parcial';
  metodoPago?: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  observaciones?: string;
}

export interface ActividadExtra {
  id: string;
  titulo: string;
  tipo: 'Viaje' | 'Tour' | 'Taller' | 'Curso Especial' | 'Masterclass' | 'Competencia' | 'Otro';
  fecha: string; // YYYY-MM-DD
  hora?: string; // Ej. "09:00 AM - 05:00 PM"
  lugar?: string; // Ej. "Punta Cana, Rep. Dom."
  precio: number;
  cuposMaximos: number;
  instructorProfesor?: string;
  estado: 'Abierto' | 'Agotado' | 'Finalizado' | 'Cancelado';
  descripcion?: string;
  foto?: string; // Base64 or image URL
  inscritos: InscripcionActividad[];
}

export interface AlumnoSuplencia {
  alumnoId: string;
  alumnoNombre: string;
}

export interface SalonEstudio {
  id: string;
  nombre: string; // Ej. "Salón Principal Aura", "Salón VIP / Espejos"
  capacidadPersonas: number;
  precioPorHora: number; // RD$ / Hora
  dimensionesMetros?: string; // Ej. "12m x 8m (96 m²)"
  equipamiento: string[]; // Ej. ["Aire Acondicionado", "Luces LED RGB", "Sonido Bluetooth 2000W", "Espejos Pared Completa", "Pista de Madera Especial"]
  estado: 'Disponible' | 'Mantenimiento' | 'Inactivo';
  descripcion?: string;
}

export interface RentaSalon {
  id: string;
  codigo: string; // Ej. "RNT-2026-001"
  salonId: string;
  salonNombre: string;
  clienteNombre: string;
  clienteContacto: string; // Teléfono / WhatsApp
  actividadTipo: 'Ensayo / Compañía' | 'Evento Privado / Fiesta' | 'Taller / Masterclass' | 'Sesión Fotográfica / Grabación' | 'Clase Particular' | 'Casting' | 'Otro';
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
  duracionHoras: number;
  precioPorHora: number;
  montoTotal: number;
  montoPagado: number;
  estadoPago: 'Pendiente' | 'Abono Parcial' | 'Pagado Total';
  estadoReserva: 'Reservado' | 'Confirmado' | 'En Curso' | 'Completado' | 'Cancelado';
  metodoPago?: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  observaciones?: string;
  fechaRegistro: string;
}

export interface RegistroSuplencia {
  id: string;
  fecha: string; // YYYY-MM-DD
  profesorTitular: string; // Nombre del profesor fijo a reemplazar
  profesorSuplente: string; // Nombre del profesor suplente contratado
  telefonoSuplente?: string; // Teléfono/WhatsApp del suplente
  claseId?: string; // ID de la clase vinculada
  claseNombre: string; // Nombre de la clase o ritmo
  horario: string; // Ej. "18:00 - 19:30"
  salon?: string; // Ej. "Salón de Oro"
  montoPago: number; // Pago/honorarios acordados RD$
  estadoPago: 'Pagado' | 'Pendiente';
  metodoPago?: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  fechaPago?: string; // YYYY-MM-DD
  alumnosCorrespondientes: AlumnoSuplencia[]; // Alumnos pertenecientes a la clase/horario
  motivoObservacion?: string; // Motivo de suplencia
}

export interface CorteCaja {
  id: string;
  codigo: string; // Ej. "CRTE-2026-07-21-01"
  fechaApertura: string; // YYYY-MM-DD HH:mm:ss
  fechaCierre: string; // YYYY-MM-DD HH:mm:ss
  cajeroNombre?: string;
  montoFondoInicial: number; // Fondo en caja chica
  montoEfectivoCalculado: number; // Ingresos en efectivo registrados
  montoTransferenciaCalculado: number; // Ingresos en transferencia
  montoTarjetaCalculado: number; // Ingresos en tarjeta
  totalIngresosCalculado: number; // Suma de todos los ingresos del periodo
  
  totalEgresosCalculado: number; // Suma de egresos
  egresosEfectivoCalculado: number; // Egresos pagados en efectivo
  
  montoEfectivoEsperado: number; // Fondo inicial + Ingresos efectivo - Egresos efectivo
  montoEfectivoReal: number; // Lo contado en físico
  diferencia: number; // Real - Esperado
  
  estado: 'Abierta' | 'Cerrada';
  observaciones?: string;
  desgloseBilletes?: {
    b2000?: number;
    b1000?: number;
    b500?: number;
    b200?: number;
    b100?: number;
    b50?: number;
    monedas?: number;
  };
}

export type CargoUsuario = 
  | 'Director General' 
  | 'Administrador' 
  | 'Recepcionista' 
  | 'Profesor' 
  | 'Contador' 
  | 'Personalizado';

export interface UsuarioSistema {
  id: string;
  nombre: string;
  username: string; // Nombre de usuario para login
  password: string; // Contraseña de acceso
  cargo: CargoUsuario;
  email?: string;
  telefono?: string;
  estado: 'Activo' | 'Inactivo';
  permisos: string[]; // Lista de IDs de pestañas permitidas (ej. 'dashboard', 'students', 'corte_caja')
  esSuperAdmin?: boolean; // Permiso maestro que no se puede eliminar
  fechaCreacion: string;
  ultimoAcceso?: string;
}





