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
  salario: number;
  contacto: string; // Keep as fallback/general contact info
  fechaIngreso: string; // YYYY-MM-DD
  activo: boolean;
  whatsappPersonal?: string;
  whatsappFamiliar?: string;
  nombreFamiliar?: string;
  direccion?: string;
  horarioTrabajo?: string;
  observacion?: string;
  foto?: string; // Base64 representation of JPG photo
}

export interface Ingreso {
  id: string;
  concepto: string; // Ej. Inscripción Inicial, Venta de Zapatos de Baile, Evento Especial
  monto: number;
  fecha: string; // YYYY-MM-DD
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  categoria: 'Inscripciones' | 'Mensualidades' | 'Clases Privadas' | 'Eventos' | 'Ventas' | 'Otros';
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


