import React, { useState } from 'react';
import { SalonEstudio, RentaSalon, Ingreso } from '../types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  Trash2, 
  Edit, 
  Share2, 
  Maximize2, 
  Users, 
  Sparkles, 
  Check, 
  X,
  CreditCard,
  MessageSquare,
  Bookmark,
  Building
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface RentalModuleProps {
  salones: SalonEstudio[];
  setSalones: React.Dispatch<React.SetStateAction<SalonEstudio[]>>;
  rentas: RentaSalon[];
  setRentas: React.Dispatch<React.SetStateAction<RentaSalon[]>>;
  ingresos: Ingreso[];
  setIngresos: React.Dispatch<React.SetStateAction<Ingreso[]>>;
}

export default function RentalModule({
  salones,
  setSalones,
  rentas,
  setRentas,
  ingresos,
  setIngresos
}: RentalModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();

  // Navigation subtabs
  const [subTab, setSubTab] = useState<'rentas' | 'salones'>('rentas');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalonFilter, setSelectedSalonFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modals
  const [showNewRentalModal, setShowNewRentalModal] = useState(false);
  const [showNewSalonModal, setShowNewSalonModal] = useState(false);
  const [editingSalon, setEditingSalon] = useState<SalonEstudio | null>(null);
  const [selectedRentalForVoucher, setSelectedRentalForVoucher] = useState<RentaSalon | null>(null);
  const [selectedRentalForPayment, setSelectedRentalForPayment] = useState<RentaSalon | null>(null);

  // Form State: New Rental
  const [rentalSalonId, setRentalSalonId] = useState('');
  const [rentalCliente, setRentalCliente] = useState('');
  const [rentalContacto, setRentalContacto] = useState('');
  const [rentalActividad, setRentalActividad] = useState<RentaSalon['actividadTipo']>('Ensayo / Compañía');
  const [rentalFecha, setRentalFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [rentalHoraInicio, setRentalHoraInicio] = useState('14:00');
  const [rentalHoraFin, setRentalHoraFin] = useState('16:00');
  const [rentalPrecioHora, setRentalPrecioHora] = useState(2000);
  const [rentalMontoPagado, setRentalMontoPagado] = useState(0);
  const [rentalMetodoPago, setRentalMetodoPago] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [rentalEstadoReserva, setRentalEstadoReserva] = useState<RentaSalon['estadoReserva']>('Confirmado');
  const [rentalObservaciones, setRentalObservaciones] = useState('');
  const [rentalSyncIngreso, setRentalSyncIngreso] = useState(true);

  // Form State: Salon
  const [salonNombre, setSalonNombre] = useState('');
  const [salonCapacidad, setSalonCapacidad] = useState(50);
  const [salonPrecioHora, setSalonPrecioHora] = useState(2000);
  const [salonDimensiones, setSalonDimensiones] = useState('10m x 8m (80 m²)');
  const [salonEquipamiento, setSalonEquipamiento] = useState('Aire Acondicionado, Espejos, Sonido Bluetooth, Pista de Madera');
  const [salonEstado, setSalonEstado] = useState<'Disponible' | 'Mantenimiento' | 'Inactivo'>('Disponible');
  const [salonDescripcion, setSalonDescripcion] = useState('');

  // Payment Modal State
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');

  // Stats calculation
  const totalRentasCount = rentas.length;
  const totalIngresosRentas = rentas.reduce((sum, r) => sum + r.montoPagado, 0);
  const totalPendienteCobro = rentas.reduce((sum, r) => sum + (r.montoTotal - r.montoPagado), 0);
  const rentasActivas = rentas.filter(r => r.estadoReserva === 'Confirmado' || r.estadoReserva === 'Reservado').length;

  // Helpers for time/duration
  const calculateHours = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 1;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hours = diff / 60;
    return hours > 0 ? parseFloat(hours.toFixed(2)) : 1;
  };

  const currentDuracion = calculateHours(rentalHoraInicio, rentalHoraFin);
  const currentTotal = currentDuracion * rentalPrecioHora;

  // Handle auto filling price when selecting salon
  const handleSalonSelect = (id: string) => {
    setRentalSalonId(id);
    const found = salones.find(s => s.id === id);
    if (found) {
      setRentalPrecioHora(found.precioPorHora);
    }
  };

  // Open New Rental Modal
  const openNewRentalModal = () => {
    const defaultSalon = salones[0];
    setRentalSalonId(defaultSalon ? defaultSalon.id : '');
    setRentalPrecioHora(defaultSalon ? defaultSalon.precioPorHora : 2000);
    setRentalCliente('');
    setRentalContacto('');
    setRentalActividad('Ensayo / Compañía');
    setRentalFecha(new Date().toISOString().split('T')[0]);
    setRentalHoraInicio('14:00');
    setRentalHoraFin('16:00');
    setRentalMontoPagado(0);
    setRentalMetodoPago('Efectivo');
    setRentalEstadoReserva('Confirmado');
    setRentalObservaciones('');
    setRentalSyncIngreso(true);
    setShowNewRentalModal(true);
  };

  // Save Rental
  const handleSaveRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentalSalonId) {
      showAlert('⚠️ Seleccione un salón para la renta.', 'ADVERTENCIA');
      return;
    }
    if (!rentalCliente.trim()) {
      showAlert('⚠️ Ingrese el nombre del cliente o compañía contratante.', 'ADVERTENCIA');
      return;
    }

    const selectedSalon = salones.find(s => s.id === rentalSalonId);
    const duracion = calculateHours(rentalHoraInicio, rentalHoraFin);
    const total = duracion * rentalPrecioHora;
    const pagado = Number(rentalMontoPagado) || 0;

    let estadoPago: RentaSalon['estadoPago'] = 'Pendiente';
    if (pagado >= total && total > 0) {
      estadoPago = 'Pagado Total';
    } else if (pagado > 0) {
      estadoPago = 'Abono Parcial';
    }

    const newCode = `RNT-${new Date().getFullYear()}-${String(rentas.length + 1).padStart(3, '0')}`;

    const newRental: RentaSalon = {
      id: 'rnt_' + Date.now(),
      codigo: newCode,
      salonId: rentalSalonId,
      salonNombre: selectedSalon ? selectedSalon.nombre : 'Salón Aura',
      clienteNombre: rentalCliente.trim(),
      clienteContacto: rentalContacto.trim(),
      actividadTipo: rentalActividad,
      fecha: rentalFecha,
      horaInicio: rentalHoraInicio,
      horaFin: rentalHoraFin,
      duracionHoras: duracion,
      precioPorHora: rentalPrecioHora,
      montoTotal: total,
      montoPagado: pagado,
      estadoPago: estadoPago,
      estadoReserva: rentalEstadoReserva,
      metodoPago: pagado > 0 ? rentalMetodoPago : undefined,
      observaciones: rentalObservaciones.trim() || undefined,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    const nextRentas = [newRental, ...rentas];
    setRentas(nextRentas);
    localStorage.setItem('aura_rentas_salones', JSON.stringify(nextRentas));

    // Optional: Sync payment to Financial Income
    if (rentalSyncIngreso && pagado > 0) {
      const newIngreso: Ingreso = {
        id: 'ing_rnt_' + Date.now(),
        fecha: rentalFecha,
        monto: pagado,
        concepto: `Renta de Salón (${selectedSalon?.nombre || 'Salón'}) - ${rentalCliente} [${newCode}]`,
        categoria: 'Renta de Salones',
        metodoPago: rentalMetodoPago,
        referencia: newCode
      };
      const nextIngresos = [newIngreso, ...ingresos];
      setIngresos(nextIngresos);
      localStorage.setItem('aura_billing_ingresos', JSON.stringify(nextIngresos));
    }

    setShowNewRentalModal(false);
    showAlert(`✅ Renta de Salón [${newCode}] registrada exitosamente por RD$ ${total.toLocaleString()}.`, 'ÉXITO');
  };

  // Delete Rental
  const handleDeleteRental = (id: string, codigo: string) => {
    showConfirm(
      `¿Está seguro de eliminar la reserva de renta ${codigo}? Esta acción cancelará la reserva del salón.`,
      () => {
        const next = rentas.filter(r => r.id !== id);
        setRentas(next);
        localStorage.setItem('aura_rentas_salones', JSON.stringify(next));
        showAlert(`Renta ${codigo} eliminada correctamente.`, 'INFORMACIÓN');
      }
    );
  };

  // Open Register Payment Modal
  const openPaymentModal = (rental: RentaSalon) => {
    const restante = rental.montoTotal - rental.montoPagado;
    setSelectedRentalForPayment(rental);
    setPaymentAmount(restante > 0 ? restante : 0);
    setPaymentMethod('Efectivo');
  };

  // Submit Payment
  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalForPayment) return;

    const abonar = Number(paymentAmount);
    if (abonar <= 0) {
      showAlert('⚠️ Ingrese un monto de abono mayor a cero.', 'ADVERTENCIA');
      return;
    }

    const currentPagado = selectedRentalForPayment.montoPagado;
    const newPagado = currentPagado + abonar;
    const total = selectedRentalForPayment.montoTotal;

    let newEstadoPago: RentaSalon['estadoPago'] = 'Abono Parcial';
    if (newPagado >= total) {
      newEstadoPago = 'Pagado Total';
    }

    const updatedRentas = rentas.map(r => {
      if (r.id === selectedRentalForPayment.id) {
        return {
          ...r,
          montoPagado: newPagado,
          estadoPago: newEstadoPago,
          metodoPago: paymentMethod
        };
      }
      return r;
    });

    setRentas(updatedRentas);
    localStorage.setItem('aura_rentas_salones', JSON.stringify(updatedRentas));

    // Sync to Income module
    const newIngreso: Ingreso = {
      id: 'ing_rnt_' + Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      monto: abonar,
      concepto: `Abono/Pago Renta Salón (${selectedRentalForPayment.salonNombre}) - ${selectedRentalForPayment.clienteNombre} [${selectedRentalForPayment.codigo}]`,
      categoria: 'Renta de Salones',
      metodoPago: paymentMethod,
      referencia: selectedRentalForPayment.codigo
    };
    const nextIngresos = [newIngreso, ...ingresos];
    setIngresos(nextIngresos);
    localStorage.setItem('aura_billing_ingresos', JSON.stringify(nextIngresos));

    setSelectedRentalForPayment(null);
    showAlert(`✅ Pago de RD$ ${abonar.toLocaleString()} registrado correctamente en la renta ${selectedRentalForPayment.codigo}.`, 'ÉXITO');
  };

  // Save Salon (Create/Edit)
  const handleSaveSalon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonNombre.trim()) {
      showAlert('⚠️ Ingrese el nombre del salón.', 'ADVERTENCIA');
      return;
    }

    const equipArray = salonEquipamiento
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (editingSalon) {
      // Edit mode
      const updated = salones.map(s => {
        if (s.id === editingSalon.id) {
          return {
            ...s,
            nombre: salonNombre.trim(),
            capacidadPersonas: Number(salonCapacidad) || 20,
            precioPorHora: Number(salonPrecioHora) || 1000,
            dimensionesMetros: salonDimensiones.trim() || undefined,
            equipamiento: equipArray,
            estado: salonEstado,
            descripcion: salonDescripcion.trim() || undefined
          };
        }
        return s;
      });
      setSalones(updated);
      localStorage.setItem('aura_salones_estudios', JSON.stringify(updated));
      showAlert(`Salón "${salonNombre}" actualizado correctamente.`, 'ÉXITO');
    } else {
      // New Salon
      const newSalon: SalonEstudio = {
        id: 'sal_' + Date.now(),
        nombre: salonNombre.trim(),
        capacidadPersonas: Number(salonCapacidad) || 20,
        precioPorHora: Number(salonPrecioHora) || 1000,
        dimensionesMetros: salonDimensiones.trim() || '10m x 8m (80 m²)',
        equipamiento: equipArray,
        estado: salonEstado,
        descripcion: salonDescripcion.trim() || undefined
      };
      const nextSalones = [...salones, newSalon];
      setSalones(nextSalones);
      localStorage.setItem('aura_salones_estudios', JSON.stringify(nextSalones));
      showAlert(`Salón "${salonNombre}" agregado al sistema.`, 'ÉXITO');
    }

    setShowNewSalonModal(false);
    setEditingSalon(null);
  };

  // Edit Salon modal
  const openEditSalon = (salon: SalonEstudio) => {
    setEditingSalon(salon);
    setSalonNombre(salon.nombre);
    setSalonCapacidad(salon.capacidadPersonas);
    setSalonPrecioHora(salon.precioPorHora);
    setSalonDimensiones(salon.dimensionesMetros || '');
    setSalonEquipamiento(salon.equipamiento ? salon.equipamiento.join(', ') : '');
    setSalonEstado(salon.estado);
    setSalonDescripcion(salon.descripcion || '');
    setShowNewSalonModal(true);
  };

  // Delete Salon
  const handleDeleteSalon = (id: string, nombre: string) => {
    showConfirm(
      `¿Desea eliminar el salón "${nombre}"? Esta acción removerá el espacio de la configuración.`,
      () => {
        const next = salones.filter(s => s.id !== id);
        setSalones(next);
        localStorage.setItem('aura_salones_estudios', JSON.stringify(next));
        showAlert(`Salón "${nombre}" eliminado.`, 'INFORMACIÓN');
      }
    );
  };

  // Filter rentals
  const filteredRentals = rentas.filter(r => {
    const matchesSearch = 
      r.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.salonNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.actividadTipo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSalon = selectedSalonFilter === 'Todos' || r.salonId === selectedSalonFilter;
    const matchesStatus = statusFilter === 'Todos' || r.estadoReserva === statusFilter || r.estadoPago === statusFilter;

    return matchesSearch && matchesSalon && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                Gestión & Renta de Salones
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Alquiler de aulas y pistas para ensayos, eventos corporativos, talleres y grabaciones
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingSalon(null);
              setSalonNombre('');
              setSalonCapacidad(50);
              setSalonPrecioHora(2000);
              setSalonDimensiones('10m x 8m (80 m²)');
              setSalonEquipamiento('Aire Acondicionado, Espejos, Sonido Bluetooth, Pista de Madera');
              setSalonEstado('Disponible');
              setSalonDescripcion('');
              setShowNewSalonModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-gold-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Building className="h-4 w-4 text-gold-400" />
            <span>Configurar Salones</span>
          </button>

          <button
            onClick={openNewRentalModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-600 hover:from-gold-500 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-gold-500/20"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nueva Renta de Salón</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Rentas Registradas</span>
            <Calendar className="h-4 w-4 text-gold-500" />
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            {totalRentasCount}
          </span>
          <span className="text-[10px] text-zinc-500 block">Reservas históricas de aulas</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Reservas Activas</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400 font-mono block">
            {rentasActivas}
          </span>
          <span className="text-[10px] text-zinc-500 block">Confirmadas o en curso</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Ingresos Recaudados</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono block">
            RD$ {totalIngresosRentas.toLocaleString()}
          </span>
          <span className="text-[10px] text-zinc-500 block">Total cobra do por concepto de renta</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Pendiente por Cobrar</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <span className={`text-2xl font-black font-mono block ${totalPendienteCobro > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
            RD$ {totalPendienteCobro.toLocaleString()}
          </span>
          <span className="text-[10px] text-zinc-500 block">Saldos pendientes o abonos parciales</span>
        </div>
      </div>

      {/* SUBTABS TOGGLE */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
        <button
          onClick={() => setSubTab('rentas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'rentas'
              ? 'bg-gold-500 text-zinc-950 shadow-md shadow-gold-500/10'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Control de Rentas & Reservas ({rentas.length})</span>
        </button>

        <button
          onClick={() => setSubTab('salones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'salones'
              ? 'bg-gold-500 text-zinc-950 shadow-md shadow-gold-500/10'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Aulas y Salones de la Academia ({salones.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: RENTAS Y RESERVAS */}
      {subTab === 'rentas' && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar cliente, código, actividad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500/50"
              />
            </div>

            {/* Filter Salon */}
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <select
                value={selectedSalonFilter}
                onChange={(e) => setSelectedSalonFilter(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-gold-500/50 cursor-pointer"
              >
                <option value="Todos">Todos los Salones</option>
                {salones.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 px-3 py-2 text-xs text-white outline-none focus:border-gold-500/50 cursor-pointer"
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Reservado">Reservado</option>
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pago Pendiente</option>
                <option value="Abono Parcial">Abono Parcial</option>
                <option value="Pagado Total">Pagado Total</option>
              </select>
            </div>
          </div>

          {/* RENTALS TABLE / LIST */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-xl">
            {filteredRentals.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Building2 className="h-12 w-12 text-zinc-700 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-400">No hay reservas o rentas registradas</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Utilice el botón "Nueva Renta de Salón" para agregar un contrato de alquiler de aula o ajustar los filtros.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Código / Fecha</th>
                      <th className="py-3 px-4">Salón & Horario</th>
                      <th className="py-3 px-4">Cliente / Actividad</th>
                      <th className="py-3 px-4 text-right">Monto Total</th>
                      <th className="py-3 px-4 text-center">Estado Pago</th>
                      <th className="py-3 px-4 text-center">Reserva</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {filteredRentals.map((r) => {
                      const restante = r.montoTotal - r.montoPagado;
                      return (
                        <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                          {/* Code & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-gold-400 block text-xs">
                              {r.codigo}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3 text-zinc-500" />
                              {r.fecha}
                            </span>
                          </td>

                          {/* Salon & Schedule */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">
                              {r.salonNombre}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-gold-500" />
                              {r.horaInicio} - {r.horaFin} ({r.duracionHoras} hrs @ RD$ {r.precioPorHora}/h)
                            </span>
                          </td>

                          {/* Client & Activity */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-zinc-200 block">
                              {r.clienteNombre}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                              <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                                {r.actividadTipo}
                              </span>
                              {r.clienteContacto && (
                                <span className="text-zinc-500">{r.clienteContacto}</span>
                              )}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 text-right font-mono">
                            <span className="font-bold text-white block text-sm">
                              RD$ {r.montoTotal.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-emerald-400 block">
                              Pagado: RD$ {r.montoPagado.toLocaleString()}
                            </span>
                            {restante > 0 && (
                              <span className="text-[10px] text-rose-400 font-bold block">
                                Restante: RD$ {restante.toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* Payment status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.estadoPago === 'Pagado Total'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : r.estadoPago === 'Abono Parcial'
                                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                                  : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            }`}>
                              {r.estadoPago}
                            </span>
                          </td>

                          {/* Reservation Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              r.estadoReserva === 'Confirmado'
                                ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                                : r.estadoReserva === 'Completado'
                                  ? 'bg-zinc-800 text-zinc-300'
                                  : r.estadoReserva === 'Reservado'
                                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                                    : 'bg-rose-950/60 text-rose-400'
                            }`}>
                              {r.estadoReserva}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Voucher button */}
                              <button
                                onClick={() => setSelectedRentalForVoucher(r)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
                                title="Ver Comprobante / Recibo"
                              >
                                <FileText className="h-4 w-4 text-gold-400" />
                              </button>

                              {/* Register Payment Button if pending balance */}
                              {restante > 0 && (
                                <button
                                  onClick={() => openPaymentModal(r)}
                                  className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/60 text-emerald-400 transition-all cursor-pointer"
                                  title="Registrar Abono / Pago"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </button>
                              )}

                              {/* Delete button */}
                              <button
                                onClick={() => handleDeleteRental(r.id, r.codigo)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                                title="Eliminar Reserva"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SALONES Y AULAS */}
      {subTab === 'salones' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {salones.map((s) => (
            <div 
              key={s.id} 
              className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-gold-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{s.nombre}</h3>
                      {s.dimensionesMetros && (
                        <span className="text-[10px] text-zinc-400 font-mono block">{s.dimensionesMetros}</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    s.estado === 'Disponible' 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                  }`}>
                    {s.estado}
                  </span>
                </div>

                {s.descripcion && (
                  <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900">
                    {s.descripcion}
                  </p>
                )}

                {/* Rates & Capacity */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Tarifa Hora</span>
                    <span className="text-sm font-black text-gold-400 font-mono">
                      RD$ {s.precioPorHora.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">/h</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Capacidad Max.</span>
                    <span className="text-sm font-black text-white font-mono flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-zinc-400" />
                      {s.capacidadPersonas} pers.
                    </span>
                  </div>
                </div>

                {/* Equipment Tags */}
                {s.equipamiento && s.equipamiento.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">
                      Equipamiento e Instalaciones:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {s.equipamiento.map((item, idx) => (
                        <span 
                          key={idx}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-gold-500" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions for Salon */}
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                <button
                  onClick={() => {
                    openNewRentalModal();
                    setRentalSalonId(s.id);
                    setRentalPrecioHora(s.precioPorHora);
                  }}
                  className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Reservar Este Salón</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditSalon(s)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                    title="Editar Salón"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSalon(s.id, s.nombre)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                    title="Eliminar Salón"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: NUEVA RENTA DE SALÓN */}
      {showNewRentalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-2xl max-h-[calc(100vh-1rem)] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            
            {/* Header */}
            <div className="bg-zinc-900/90 p-3.5 sm:p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gold-500" />
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-display">
                  Registrar Renta / Alquiler de Salón
                </h3>
              </div>
              <button
                onClick={() => setShowNewRentalModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRental} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-y-auto flex-1">
                
                {/* Salon selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Salón / Aula a Rentar *
                  </label>
                  <select
                    value={rentalSalonId}
                    onChange={(e) => handleSalonSelect(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50 cursor-pointer font-semibold"
                  >
                    <option value="">-- Seleccione un Salón --</option>
                    {salones.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} (Cap: {s.capacidadPersonas} pers. - RD$ {s.precioPorHora}/hora)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Name & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Cliente / Compañía / Grupo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ballet Nacional / Juan Pérez"
                      value={rentalCliente}
                      onChange={(e) => setRentalCliente(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Contacto (Teléfono / WhatsApp)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 809-555-0000"
                      value={rentalContacto}
                      onChange={(e) => setRentalContacto(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                {/* Activity Type & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Tipo de Actividad
                    </label>
                    <select
                      value={rentalActividad}
                      onChange={(e) => setRentalActividad(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      <option value="Ensayo / Compañía">Ensayo / Compañía de Baile</option>
                      <option value="Evento Privado / Fiesta">Evento Privado / Fiesta</option>
                      <option value="Taller / Masterclass">Taller / Masterclass Externa</option>
                      <option value="Sesión Fotográfica / Grabación">Sesión Fotográfica / Grabación Video</option>
                      <option value="Clase Particular">Clase Particular</option>
                      <option value="Casting">Casting / Audiciones</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Fecha de la Renta *
                    </label>
                    <input
                      type="date"
                      required
                      value={rentalFecha}
                      onChange={(e) => setRentalFecha(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                {/* Schedule: Hora Inicio, Hora Fin, Price/hour */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      required
                      value={rentalHoraInicio}
                      onChange={(e) => setRentalHoraInicio(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 sm:p-2 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      required
                      value={rentalHoraFin}
                      onChange={(e) => setRentalHoraFin(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 sm:p-2 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Precio por Hora (RD$) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={rentalPrecioHora}
                      onChange={(e) => setRentalPrecioHora(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 sm:p-2 text-xs sm:text-sm text-gold-400 font-bold outline-none focus:border-gold-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* Automatic Calculation Banner */}
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-2.5 sm:p-3 rounded-xl border border-gold-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                      Cálculo Automático
                    </span>
                    <span className="text-xs text-zinc-300 font-semibold">
                      Duración Estimada: <strong className="text-white font-mono">{currentDuracion} horas</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gold-400 block font-bold">
                      Monto Total Renta
                    </span>
                    <span className="text-base sm:text-lg font-black text-gold-400 font-mono">
                      RD$ {currentTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Initial Payment / Deposit & Method */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      Monto Cobrado / Abonado (RD$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={rentalMontoPagado}
                      onChange={(e) => setRentalMontoPagado(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-emerald-900/50 bg-zinc-900 p-1.5 sm:p-2 text-xs sm:text-sm text-emerald-300 font-bold outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={rentalMetodoPago}
                      onChange={(e) => setRentalMetodoPago(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 sm:p-2 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia Bancaria</option>
                      <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Estado de Reserva
                    </label>
                    <select
                      value={rentalEstadoReserva}
                      onChange={(e) => setRentalEstadoReserva(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 sm:p-2 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      <option value="Confirmado">Confirmado</option>
                      <option value="Reservado">Reservado (Apartado)</option>
                      <option value="Completado">Completado</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Requerimientos Especiales / Observaciones
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Solicitan 20 sillas plegables, micrófono inalámbrico y aire acondicionado previo..."
                    value={rentalObservaciones}
                    onChange={(e) => setRentalObservaciones(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>

                {/* Sync check */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="rentalSync"
                    checked={rentalSyncIngreso}
                    onChange={(e) => setRentalSyncIngreso(e.target.checked)}
                    className="rounded border-zinc-800 text-gold-500 focus:ring-gold-500 h-4 w-4 bg-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="rentalSync" className="text-xs text-zinc-300 font-semibold cursor-pointer select-none">
                    Registrar automáticamente este cobro como Ingreso en la Contabilidad Financiera
                  </label>
                </div>

              </div>

              {/* Submit buttons - Fixed at bottom */}
              <div className="shrink-0 border-t border-zinc-850 p-3 sm:p-4 bg-zinc-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewRentalModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-gold-500/20"
                >
                  Guardar Renta
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT/CREATE SALON */}
      {showNewSalonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-lg max-h-[calc(100vh-1rem)] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            <div className="bg-zinc-900/90 p-3.5 sm:p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gold-500" />
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-display">
                  {editingSalon ? 'Editar Salón / Aula' : 'Nuevo Salón / Aula'}
                </h3>
              </div>
              <button
                onClick={() => setShowNewSalonModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalon} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre del Salón *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Salón Principal Aura / Salón B"
                    value={salonNombre}
                    onChange={(e) => setSalonNombre(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio por Hora (RD$) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={salonPrecioHora}
                      onChange={(e) => setSalonPrecioHora(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs sm:text-sm text-gold-400 font-bold outline-none focus:border-gold-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Capacidad Máxima *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={salonCapacidad}
                      onChange={(e) => setSalonCapacidad(Number(e.target.value) || 10)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs sm:text-sm text-white font-mono outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Dimensiones / Metros</label>
                    <input
                      type="text"
                      placeholder="Ej. 12m x 8m (96 m²)"
                      value={salonDimensiones}
                      onChange={(e) => setSalonDimensiones(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado</label>
                    <select
                      value={salonEstado}
                      onChange={(e) => setSalonEstado(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Equipamiento (Separado por comas)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Aire Acondicionado, Espejos, Sonido Bluetooth, Pista de Madera"
                    value={salonEquipamiento}
                    onChange={(e) => setSalonEquipamiento(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles del salón, tipo de piso, usos recomendados..."
                    value={salonDescripcion}
                    onChange={(e) => setSalonDescripcion(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="shrink-0 border-t border-zinc-850 p-4 bg-zinc-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewSalonModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-zinc-950 font-black text-xs uppercase cursor-pointer"
                >
                  {editingSalon ? 'Guardar Cambios' : 'Crear Salón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR ABONO / PAGO A RENTA */}
      {selectedRentalForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            <div className="bg-zinc-900/90 p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-display">
                  Registrar Cobro Renta Salón
                </h3>
              </div>
              <button
                onClick={() => setSelectedRentalForPayment(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
                <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-gold-400 font-bold block">
                    {selectedRentalForPayment.codigo} • {selectedRentalForPayment.salonNombre}
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {selectedRentalForPayment.clienteNombre}
                  </span>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 pt-1">
                    <span>Monto Total: RD$ {selectedRentalForPayment.montoTotal.toLocaleString()}</span>
                    <span>Pagado: RD$ {selectedRentalForPayment.montoPagado.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Monto a Abonar / Cobrar (RD$) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRentalForPayment.montoTotal - selectedRentalForPayment.montoPagado}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-emerald-900/50 bg-zinc-900 p-2.5 text-lg font-black text-emerald-300 font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs sm:text-sm text-white outline-none focus:border-gold-500/50 cursor-pointer"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  </select>
                </div>
              </div>

              <div className="shrink-0 border-t border-zinc-850 p-4 bg-zinc-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRentalForPayment(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Procesar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPROBANTE / VOUCHER DE RENTA IMPRIMIBLE */}
      {selectedRentalForVoucher && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            
            {/* Modal Controls Header */}
            <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between no-print shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Comprobante Oficial de Renta de Salón
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-zinc-950 font-bold text-xs cursor-pointer shadow"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedRentalForVoucher(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Area - Scrollable */}
            <div className="p-6 sm:p-8 space-y-5 text-zinc-200 bg-zinc-950 overflow-y-auto flex-1">
              
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-zinc-800 pb-5">
                <h2 className="text-xl font-black text-white uppercase tracking-widest font-display">
                  NEW DANCE <span className="text-gold-500">SYSTEM</span>
                </h2>
                <p className="text-xs font-semibold text-zinc-400">
                  ACADEMIA & ESTUDIO DE DANZA
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  RNC: 131-98765-2 • Tel: (809) 555-DANCE • Rep. Dominicana
                </p>
                <div className="pt-2">
                  <span className="inline-block bg-gold-500/10 border border-gold-500/30 text-gold-400 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                    COMPROBANTE DE RENTA #{selectedRentalForVoucher.codigo}
                  </span>
                </div>
              </div>

              {/* General Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block font-semibold">Cliente / Grupo:</span>
                  <span className="font-bold text-white block text-sm">{selectedRentalForVoucher.clienteNombre}</span>
                  {selectedRentalForVoucher.clienteContacto && (
                    <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">{selectedRentalForVoucher.clienteContacto}</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block font-semibold">Salón Reservado:</span>
                  <span className="font-bold text-gold-400 block text-sm">{selectedRentalForVoucher.salonNombre}</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">{selectedRentalForVoucher.actividadTipo}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block font-semibold">Fecha Renta:</span>
                  <span className="font-mono font-bold text-white block">{selectedRentalForVoucher.fecha}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block font-semibold">Horario & Horas:</span>
                  <span className="font-mono font-bold text-white block">
                    {selectedRentalForVoucher.horaInicio} - {selectedRentalForVoucher.horaFin} ({selectedRentalForVoucher.duracionHoras} hrs)
                  </span>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">
                  Desglose Económico
                </span>
                <table className="w-full text-left text-xs border border-zinc-850 rounded-xl overflow-hidden">
                  <thead className="bg-zinc-900 text-zinc-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Concepto</th>
                      <th className="py-2 px-3 text-center">Horas</th>
                      <th className="py-2 px-3 text-right">Precio/Hora</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-mono">
                    <tr>
                      <td className="py-2.5 px-3 text-white font-semibold">Alquiler {selectedRentalForVoucher.salonNombre}</td>
                      <td className="py-2.5 px-3 text-center">{selectedRentalForVoucher.duracionHoras} hrs</td>
                      <td className="py-2.5 px-3 text-right">RD$ {selectedRentalForVoucher.precioPorHora.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">RD$ {selectedRentalForVoucher.montoTotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Summary Box */}
              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Monto Total Renta:</span>
                  <span className="text-white font-bold text-sm">RD$ {selectedRentalForVoucher.montoTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Monto Pagado / Abonado:</span>
                  <span className="font-bold text-sm">RD$ {selectedRentalForVoucher.montoPagado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-800 pt-2">
                  <span className="font-bold text-white">Saldo Pendiente:</span>
                  <span className={`font-black text-sm ${
                    (selectedRentalForVoucher.montoTotal - selectedRentalForVoucher.montoPagado) > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    RD$ {(selectedRentalForVoucher.montoTotal - selectedRentalForVoucher.montoPagado).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedRentalForVoucher.observaciones && (
                <div className="text-xs text-zinc-400 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
                  <strong className="text-zinc-300 block mb-0.5 font-sans">Notas Requerimientos:</strong>
                  <p className="font-mono text-[11px]">{selectedRentalForVoucher.observaciones}</p>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="text-[9px] text-zinc-500 space-y-1 border-t border-zinc-900 pt-4 leading-normal font-sans">
                <strong className="text-zinc-400 block font-mono uppercase">Términos de la Renta:</strong>
                <p>1. Mantener el salón limpio y entregar las instalaciones en la hora acordada.</p>
                <p>2. Queda prohibido fumar, ingerir bebidas alcohólicas no autorizadas o ingresar con calzado que dañe la madera.</p>
                <p>3. En caso de daños al equipo de sonido, luces o espejos, el contratante asumirá los costos correspondientes.</p>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-mono">
                <div className="border-t border-zinc-800 pt-2">
                  <span className="text-zinc-400 block text-[10px]">Firma del Cliente</span>
                </div>
                <div className="border-t border-zinc-800 pt-2">
                  <span className="text-zinc-400 block text-[10px]">Administración NDS</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
