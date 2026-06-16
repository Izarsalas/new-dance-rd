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
  horarioClases?: string; // Horario de clases
  observaciones?: string; // Notas u observaciones
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


