import React, { useState, useMemo, useRef } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Plus, 
  Building2, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Download, 
  Percent, 
  Search, 
  Sparkles,
  Wallet,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { CorteCaja, Ingreso, Egreso, Sale, Pago, RentaSalon, TicketSettings } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CashRegisterModuleProps {
  cortes: CorteCaja[];
  setCortes: React.Dispatch<React.SetStateAction<CorteCaja[]>>;
  ingresos: Ingreso[];
  egresos: Egreso[];
  sales: Sale[];
  pagos: Pago[];
  rentas: RentaSalon[];
  ticketSettings: TicketSettings;
}

type PeriodType = 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'anual' | 'personalizado';

export default function CashRegisterModule({
  cortes,
  setCortes,
  ingresos,
  egresos,
  sales,
  pagos,
  rentas,
  ticketSettings
}: CashRegisterModuleProps) {
  // Main view state
  const [activeTab, setActiveTab] = useState<'resumen' | 'arqueo' | 'historial'>('resumen');
  const [period, setPeriod] = useState<PeriodType>('diario');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customStartDate, setCustomStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modal / Print & Export PDF states
  const [showCorteModal, setShowCorteModal] = useState(false);
  const [selectedCorteForPrint, setSelectedCorteForPrint] = useState<CorteCaja | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Arqueo / Cierre Form state
  const [fondoInicial, setFondoInicial] = useState<number>(2000); // Default RD$ 2,000
  const [cajeroNombre, setCajeroNombre] = useState<string>('Administración');
  const [observaciones, setObservaciones] = useState<string>('');

  // Bill Breakdown State (Desglose de Billetes en RD$)
  const [b2000, setB2000] = useState<number>(0);
  const [b1000, setB1000] = useState<number>(0);
  const [b500, setB500] = useState<number>(0);
  const [b200, setB200] = useState<number>(0);
  const [b100, setB100] = useState<number>(0);
  const [b50, setB50] = useState<number>(0);
  const [monedas, setMonedas] = useState<number>(0);

  // Ref for PDF Export Element
  const printReportRef = useRef<HTMLDivElement>(null);

  // Helper date calculators
  const dateRange = useMemo(() => {
    const today = new Date(selectedDate + 'T00:00:00');
    let start = new Date(today);
    let end = new Date(today);
    end.setHours(23, 59, 59, 999);

    if (period === 'diario') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'semanal') {
      // Last 7 days
      start.setDate(today.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'quincenal') {
      // 15 days or current fortnight (1-15 or 16-end)
      const day = today.getDate();
      if (day <= 15) {
        start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth(), 15, 23, 59, 59);
      } else {
        start = new Date(today.getFullYear(), today.getMonth(), 16, 0, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      }
    } else if (period === 'mensual') {
      // Full Month
      start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'anual') {
      // Full Year
      start = new Date(today.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
    } else if (period === 'personalizado') {
      start = new Date(customStartDate + 'T00:00:00');
      end = new Date(customEndDate + 'T23:59:59');
    }

    return { start, end };
  }, [period, selectedDate, customStartDate, customEndDate]);

  // Filter Movements within range
  const filteredIngresos = useMemo(() => {
    return ingresos.filter(i => {
      const d = new Date(i.fecha + 'T12:00:00');
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [ingresos, dateRange]);

  const filteredEgresos = useMemo(() => {
    return egresos.filter(e => {
      const d = new Date(e.fecha + 'T12:00:00');
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [egresos, dateRange]);

  // Breakdown of Income by Category & Method
  const financialTotals = useMemo(() => {
    let totalIngresos = 0;
    let efectivo = 0;
    let transferencia = 0;
    let tarjeta = 0;

    const porCategoria: Record<string, number> = {
      'Mensualidades': 0,
      'Inscripciones': 0,
      'Ventas POS': 0,
      'Renta de Salones': 0,
      'Actividades y Talleres': 0,
      'Clases Privadas': 0,
      'Otros': 0
    };

    filteredIngresos.forEach(ing => {
      totalIngresos += ing.monto;
      if (ing.metodoPago === 'Efectivo') efectivo += ing.monto;
      else if (ing.metodoPago === 'Transferencia') transferencia += ing.monto;
      else if (ing.metodoPago === 'Tarjeta') tarjeta += ing.monto;

      if (ing.categoria === 'Mensualidades') porCategoria['Mensualidades'] += ing.monto;
      else if (ing.categoria === 'Inscripciones') porCategoria['Inscripciones'] += ing.monto;
      else if (ing.categoria === 'Ventas') porCategoria['Ventas POS'] += ing.monto;
      else if (ing.categoria === 'Renta de Salones') porCategoria['Renta de Salones'] += ing.monto;
      else if (ing.categoria === 'Eventos') porCategoria['Actividades y Talleres'] += ing.monto;
      else if (ing.categoria === 'Clases Privadas') porCategoria['Clases Privadas'] += ing.monto;
      else porCategoria['Otros'] += ing.monto;
    });

    let totalEgresos = 0;
    let egresosEfectivo = 0;
    filteredEgresos.forEach(eg => {
      totalEgresos += eg.monto;
      if (eg.metodoPago === 'Efectivo') egresosEfectivo += eg.monto;
    });

    const gananciaNeta = totalIngresos - totalEgresos;
    const margenPorcentaje = totalIngresos > 0 ? ((gananciaNeta / totalIngresos) * 100).toFixed(1) : '0.0';

    return {
      totalIngresos,
      efectivo,
      transferencia,
      tarjeta,
      totalEgresos,
      egresosEfectivo,
      gananciaNeta,
      margenPorcentaje,
      porCategoria
    };
  }, [filteredIngresos, filteredEgresos]);

  // Physical Cash Counted
  const totalFisicoContado = useMemo(() => {
    return (
      (b2000 * 2000) +
      (b1000 * 1000) +
      (b500 * 500) +
      (b200 * 200) +
      (b100 * 100) +
      (b50 * 50) +
      (monedas * 1)
    );
  }, [b2000, b1000, b500, b200, b100, b50, monedas]);

  // Expected Cash in Drawer
  const efectivoEsperado = useMemo(() => {
    return fondoInicial + financialTotals.efectivo - financialTotals.egresosEfectivo;
  }, [fondoInicial, financialTotals.efectivo, financialTotals.egresosEfectivo]);

  // Difference (Counted vs Expected)
  const diferenciaCaja = useMemo(() => {
    return totalFisicoContado - efectivoEsperado;
  }, [totalFisicoContado, efectivoEsperado]);

  // Handle Save / Execute Daily Closure
  const handleSaveCorte = (e: React.FormEvent) => {
    e.preventDefault();

    const dateStr = selectedDate;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const countIndex = cortes.length + 1;
    const codigo = `CRTE-${dateStr.replace(/-/g, '')}-${String(countIndex).padStart(2, '0')}`;

    const newCorte: CorteCaja = {
      id: `corte_${Date.now()}`,
      codigo,
      fechaApertura: `${dateStr} 08:00:00`,
      fechaCierre: nowStr,
      cajeroNombre: cajeroNombre || 'Administrador',
      montoFondoInicial: fondoInicial,
      montoEfectivoCalculado: financialTotals.efectivo,
      montoTransferenciaCalculado: financialTotals.transferencia,
      montoTarjetaCalculado: financialTotals.tarjeta,
      totalIngresosCalculado: financialTotals.totalIngresos,
      totalEgresosCalculado: financialTotals.totalEgresos,
      egresosEfectivoCalculado: financialTotals.egresosEfectivo,
      montoEfectivoEsperado: efectivoEsperado,
      montoEfectivoReal: totalFisicoContado,
      diferencia: diferenciaCaja,
      estado: 'Cerrada',
      observaciones,
      desgloseBilletes: {
        b2000,
        b1000,
        b500,
        b200,
        b100,
        b50,
        monedas
      }
    };

    const updated = [newCorte, ...cortes];
    setCortes(updated);
    localStorage.setItem('aura_cortes_caja', JSON.stringify(updated));

    // Prompt to view receipt
    setSelectedCorteForPrint(newCorte);
    setShowCorteModal(false);
  };

  // Printable receipt handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export handler using html2canvas & jsPDF
  const handleExportPdf = async () => {
    if (!printReportRef.current) return;
    try {
      setIsExportingPdf(true);
      const element = printReportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b', // dark background for high resolution match
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = selectedCorteForPrint 
        ? `Corte_Caja_${selectedCorteForPrint.codigo}.pdf` 
        : `Reporte_Financiero_${selectedDate}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert("Ocurrió un inconveniente al generar el documento PDF. Intentando imprimir directamente...");
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-xl">
            <Wallet className="h-6 w-6 text-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white font-display uppercase tracking-wider flex items-center gap-2">
              Corte & Cierre de Caja
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              Control de arqueo diario, ingresos por categoría y análisis de ganancias
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'resumen'
                ? 'bg-gold-500 text-zinc-950 shadow-lg shadow-gold-500/20 font-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Análisis de Ganancias
          </button>

          <button
            onClick={() => setActiveTab('arqueo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'arqueo'
                ? 'bg-gold-500 text-zinc-950 shadow-lg shadow-gold-500/20 font-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            <Calculator className="h-4 w-4" />
            Realizar Corte Diario
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'historial'
                ? 'bg-gold-500 text-zinc-950 shadow-lg shadow-gold-500/20 font-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            <History className="h-4 w-4" />
            Historial de Cortes
          </button>
        </div>
      </div>

      {/* FILTER BAR FOR TIME PERIODS */}
      <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <span className="text-xs font-bold text-zinc-400 mr-2 uppercase tracking-wider text-[10px]">
            Rango:
          </span>
          {(['diario', 'semanal', 'quincenal', 'mensual', 'anual', 'personalizado'] as PeriodType[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                period === p
                  ? 'bg-zinc-800 text-gold-400 border border-gold-500/40 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-3">
          {period === 'personalizado' ? (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-white outline-none focus:border-gold-500/50 font-mono"
              />
              <span className="text-zinc-500">a</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-white outline-none focus:border-gold-500/50 font-mono"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-gold-500/50 cursor-pointer font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* VIEW CONTENT 1: RESUMEN / ANÁLISIS DE GANANCIAS */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Ingresos */}
            <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden shadow-lg group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                  Ingresos Totales
                </span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                RD$ {financialTotals.totalIngresos.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1 font-medium">
                Suma total de cobros en el periodo
              </p>
            </div>

            {/* Total Egresos */}
            <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden shadow-lg group hover:border-rose-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                  Egresos / Gastos
                </span>
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
                RD$ {financialTotals.totalEgresos.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 font-medium">
                Salidas de caja y pagos administrativos
              </p>
            </div>

            {/* Ganancia Neta */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-5 rounded-2xl border border-gold-500/30 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-gold-400 tracking-wider">
                  Ganancia Neta (Utilidad)
                </span>
                <div className="p-2 bg-gold-500/10 rounded-xl text-gold-400">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className={`text-2xl font-black font-mono tracking-tight ${financialTotals.gananciaNeta >= 0 ? 'text-gold-400' : 'text-rose-400'}`}>
                RD$ {financialTotals.gananciaNeta.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-300 mt-2 font-semibold flex items-center justify-between">
                <span>Margen sobre ingresos:</span>
                <strong className="text-gold-400 font-mono">{financialTotals.margenPorcentaje}%</strong>
              </p>
            </div>

            {/* Total Efectivo en Caja */}
            <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                  Efectivo Líquido
                </span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-blue-400 font-mono tracking-tight">
                RD$ {financialTotals.efectivo.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 font-medium">
                Cobrado físicamente en efectivo
              </p>
            </div>

          </div>

          {/* PAYMENT METHODS & CATEGORY BREAKDOWN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Payment Methods Card */}
            <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-850 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
                <CreditCard className="h-4 w-4 text-gold-400" />
                Desglose por Métodos de Pago
              </h3>

              <div className="space-y-3 pt-2">
                {/* Efectivo */}
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div>
                      <span className="text-xs font-bold text-white block">Efectivo</span>
                      <span className="text-[10px] text-zinc-500">Pago en caja física</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    RD$ {financialTotals.efectivo.toLocaleString()}
                  </span>
                </div>

                {/* Transferencia */}
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <span className="text-xs font-bold text-white block">Transferencia Bancaria</span>
                      <span className="text-[10px] text-zinc-500">Acreditaciones directas</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-blue-400">
                    RD$ {financialTotals.transferencia.toLocaleString()}
                  </span>
                </div>

                {/* Tarjeta */}
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div>
                      <span className="text-xs font-bold text-white block">Tarjeta (VMS / Verifone)</span>
                      <span className="text-[10px] text-zinc-500">Pagos POS de débito / crédito</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-purple-400">
                    RD$ {financialTotals.tarjeta.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Income by Category Card */}
            <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-850 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
                <Users className="h-4 w-4 text-gold-400" />
                Fuentes de Ingresos
              </h3>

              <div className="space-y-2.5 pt-1">
                {Object.entries(financialTotals.porCategoria).map(([cat, amount]) => {
                  const numAmount = Number(amount) || 0;
                  const percentage = financialTotals.totalIngresos > 0 
                    ? ((numAmount / financialTotals.totalIngresos) * 100).toFixed(1) 
                    : '0';

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-300">{cat}</span>
                        <span className="font-mono text-gold-400 font-bold">
                          RD$ {amount.toLocaleString()} <span className="text-zinc-500 font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                        <div 
                          className="h-full bg-gold-500/80 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* DETAILED MOVEMENTS TABLE FOR THE PERIOD */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-850 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold-400" />
                Detalle de Movimientos en el Periodo ({filteredIngresos.length + filteredEgresos.length})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCorteForPrint(null); // Print general period summary
                    setShowCorteModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5 text-gold-400" />
                  Imprimir Reporte
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Concepto</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Método Pago</th>
                    <th className="p-3.5 text-right">Monto (RD$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/60 font-medium">
                  {filteredIngresos.map(ing => (
                    <tr key={`ing_${ing.id}`} className="hover:bg-zinc-850/40 transition-all">
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase">
                          + Ingreso
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-zinc-400">{ing.fecha}</td>
                      <td className="p-3.5 font-semibold text-white">{ing.concepto}</td>
                      <td className="p-3.5 text-zinc-300">{ing.categoria}</td>
                      <td className="p-3.5 text-zinc-400">{ing.metodoPago}</td>
                      <td className="p-3.5 text-right font-mono font-black text-emerald-400">
                        RD$ {ing.monto.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {filteredEgresos.map(eg => (
                    <tr key={`eg_${eg.id}`} className="hover:bg-zinc-850/40 transition-all">
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-bold text-[10px] uppercase">
                          - Egreso
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-zinc-400">{eg.fecha}</td>
                      <td className="p-3.5 font-semibold text-white">{eg.concepto}</td>
                      <td className="p-3.5 text-zinc-300">{eg.categoria}</td>
                      <td className="p-3.5 text-zinc-400">{eg.metodoPago}</td>
                      <td className="p-3.5 text-right font-mono font-black text-rose-400">
                        - RD$ {eg.monto.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {filteredIngresos.length === 0 && filteredEgresos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        No hay movimientos registrados para la fecha o rango seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW CONTENT 2: REALIZAR CORTE DIARIO / ARQUEO */}
      {activeTab === 'arqueo' && (
        <form onSubmit={handleSaveCorte} className="space-y-6 animate-fade-in">
          
          <div className="bg-zinc-900/90 p-6 rounded-2xl border border-zinc-850 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-gold-400" />
                  Formulario de Arqueo y Cierre de Caja
                </h2>
                <p className="text-xs text-zinc-400">
                  Cuadre el efectivo contado físicamente contra el saldo del sistema ({selectedDate})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono">
                  Fecha de Cierre: <strong className="text-white">{selectedDate}</strong>
                </span>
              </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cajero / Administrador a Cargo *
                </label>
                <input
                  type="text"
                  required
                  value={cajeroNombre}
                  onChange={(e) => setCajeroNombre(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none focus:border-gold-500/50"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Fondo Inicial en Caja Chica (RD$) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={fondoInicial}
                  onChange={(e) => setFondoInicial(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm font-mono text-gold-400 font-bold outline-none focus:border-gold-500/50"
                />
              </div>
            </div>

            {/* SYSTEM CALCULATED VALUES SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                  + Cobrado en Efectivo
                </span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  RD$ {financialTotals.efectivo.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                  - Salidas / Egresos Efectivo
                </span>
                <span className="text-base font-bold font-mono text-rose-400">
                  RD$ {financialTotals.egresosEfectivo.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gold-400 font-bold uppercase font-mono block">
                  = Efectivo Esperado en Caja
                </span>
                <span className="text-lg font-black font-mono text-gold-400">
                  RD$ {efectivoEsperado.toLocaleString()}
                </span>
              </div>
            </div>

            {/* BILLS CALCULATOR / DESGLOSE DE BILLETES */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <CoinsIcon className="h-4 w-4 text-gold-400" />
                Desglose Físico de Billetes y Monedas (Conteo Real)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* 2000 */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block">Billetes RD$ 2,000</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={b2000 || ''}
                      onChange={(e) => setB2000(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white text-center font-bold outline-none focus:border-gold-500"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                      = {(b2000 * 2000).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 1000 */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block">Billetes RD$ 1,000</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={b1000 || ''}
                      onChange={(e) => setB1000(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white text-center font-bold outline-none focus:border-gold-500"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                      = {(b1000 * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 500 */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block">Billetes RD$ 500</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={b500 || ''}
                      onChange={(e) => setB500(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white text-center font-bold outline-none focus:border-gold-500"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                      = {(b500 * 500).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 200 */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block">Billetes RD$ 200</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={b200 || ''}
                      onChange={(e) => setB200(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white text-center font-bold outline-none focus:border-gold-500"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                      = {(b200 * 200).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 100 */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block">Billetes RD$ 100</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={b100 || ''}
                      onChange={(e) => setB100(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white text-center font-bold outline-none focus:border-gold-500"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                      = {(b100 * 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 50 */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block">Billetes RD$ 50</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={b50 || ''}
                      onChange={(e) => setB50(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white text-center font-bold outline-none focus:border-gold-500"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                      = {(b50 * 50).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Monedas */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block">Suma Total Monedas (RD$)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={monedas || ''}
                      onChange={(e) => setMonedas(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white text-center font-bold outline-none focus:border-gold-500"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                      = {monedas.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* COMPARISON RESULT & DIFFERENCE BANNER */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              diferenciaCaja === 0 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : diferenciaCaja > 0 
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                  {diferenciaCaja === 0 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span>Caja Perfectamente Cuadrada</span>
                    </>
                  ) : diferenciaCaja > 0 ? (
                    <>
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      <span>Sobrante en Caja</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                      <span>Faltante / Descuadre de Caja</span>
                    </>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-300">
                  Esperado: <strong className="font-mono">RD$ {efectivoEsperado.toLocaleString()}</strong> |
                  Físico Contado: <strong className="font-mono">RD$ {totalFisicoContado.toLocaleString()}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono block opacity-80 font-bold">
                  Diferencia Final
                </span>
                <span className="text-2xl font-black font-mono">
                  RD$ {diferenciaCaja.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Observaciones del Arqueo / Justificación de Descuadre
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Se pagaron RD$200 de imprevisto por agua embotellada no registrado..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500/50 resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-gold-500/20 flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Registrar & Cerrar Caja del Día
              </button>
            </div>

          </div>

        </form>
      )}

      {/* VIEW CONTENT 3: HISTORIAL DE CORTES */}
      {activeTab === 'historial' && (
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-850 overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <History className="h-4 w-4 text-gold-400" />
              Historial de Cortes y Cierres Registrados ({cortes.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Código</th>
                  <th className="p-3.5">Fecha Cierre</th>
                  <th className="p-3.5">Cajero</th>
                  <th className="p-3.5">Total Ingresos</th>
                  <th className="p-3.5">Esperado</th>
                  <th className="p-3.5">Real Contado</th>
                  <th className="p-3.5">Diferencia</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {cortes.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-850/40 transition-all font-medium">
                    <td className="p-3.5 font-mono font-bold text-gold-400">{c.codigo}</td>
                    <td className="p-3.5 font-mono text-zinc-300">{c.fechaCierre}</td>
                    <td className="p-3.5 text-white font-semibold">{c.cajeroNombre || 'Admin'}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      RD$ {c.totalIngresosCalculado.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      RD$ {c.montoEfectivoEsperado.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      RD$ {c.montoEfectivoReal.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      {c.diferencia === 0 ? (
                        <span className="text-emerald-400">RD$ 0 (Cuadrada)</span>
                      ) : c.diferencia > 0 ? (
                        <span className="text-blue-400">+ RD$ {c.diferencia.toLocaleString()}</span>
                      ) : (
                        <span className="text-rose-400">RD$ {c.diferencia.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCorteForPrint(c);
                          setShowCorteModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-gold-400 transition-all cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Ver / Imprimir
                      </button>
                    </td>
                  </tr>
                ))}

                {cortes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-500">
                      No hay cierres de caja registrados en el historial todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE / EXPORT PDF MODAL */}
      {showCorteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            
            {/* Control Header */}
            <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between no-print shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Reporte & Comprobante de Corte de Caja
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isExportingPdf ? 'Exportando...' : 'Exportar PDF'}
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-zinc-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-gold-500/20"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir
                </button>

                <button
                  onClick={() => setShowCorteModal(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE CONTENT AREA */}
            <div className="p-6 sm:p-8 space-y-6 text-zinc-200 bg-zinc-950 overflow-y-auto flex-1" ref={printReportRef}>
              
              {/* Header */}
              <div className="text-center space-y-1.5 border-b border-zinc-800 pb-5">
                <h2 className="text-xl font-black text-white uppercase tracking-wider font-display">
                  {ticketSettings.nombreAcademia || 'NEW DANCE ACADEMY'}
                </h2>
                {ticketSettings.rnc && (
                  <p className="text-xs font-mono text-zinc-400">RNC: {ticketSettings.rnc}</p>
                )}
                <p className="text-xs text-zinc-400">{ticketSettings.direccion || 'Santo Domingo, Rep. Dominicana'}</p>
                <div className="pt-2">
                  <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono font-bold text-xs uppercase tracking-widest inline-block">
                    {selectedCorteForPrint ? `CORTE DE CAJA: ${selectedCorteForPrint.codigo}` : `REPORTE FINANCIERO: ${period.toUpperCase()}`}
                  </span>
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Fecha de Cierre:</span>
                  <span className="text-white font-bold">{selectedCorteForPrint ? selectedCorteForPrint.fechaCierre : selectedDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Responsable / Cajero:</span>
                  <span className="text-white font-bold">{selectedCorteForPrint ? selectedCorteForPrint.cajeroNombre : cajeroNombre}</span>
                </div>
              </div>

              {/* Summary Totals Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                  Resumen Contable del Cierre
                </h4>
                
                <div className="border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs">
                  <div className="bg-zinc-900 p-2.5 flex justify-between font-bold border-b border-zinc-800">
                    <span className="text-zinc-300">Fondo Inicial Caja Chica:</span>
                    <span className="text-white">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.montoFondoInicial : fondoInicial).toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 flex justify-between border-b border-zinc-850">
                    <span className="text-zinc-400">+ Cobrado en Efectivo:</span>
                    <span className="text-emerald-400 font-bold">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.montoEfectivoCalculado : financialTotals.efectivo).toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 flex justify-between border-b border-zinc-850">
                    <span className="text-zinc-400">+ Cobrado en Transferencia:</span>
                    <span className="text-blue-400 font-bold">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.montoTransferenciaCalculado : financialTotals.transferencia).toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 flex justify-between border-b border-zinc-850">
                    <span className="text-zinc-400">+ Cobrado en Tarjeta:</span>
                    <span className="text-purple-400 font-bold">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.montoTarjetaCalculado : financialTotals.tarjeta).toLocaleString()}</span>
                  </div>

                  <div className="bg-zinc-900/80 p-2.5 flex justify-between font-bold border-b border-zinc-800">
                    <span className="text-white uppercase">Total Ingresos Brutos:</span>
                    <span className="text-emerald-400 text-sm font-black">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.totalIngresosCalculado : financialTotals.totalIngresos).toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 flex justify-between border-b border-zinc-850">
                    <span className="text-zinc-400">- Total Egresos / Gastos:</span>
                    <span className="text-rose-400 font-bold">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.totalEgresosCalculado : financialTotals.totalEgresos).toLocaleString()}</span>
                  </div>

                  <div className="bg-zinc-900 p-3 flex justify-between font-black text-sm">
                    <span className="text-gold-400 uppercase">Efectivo Esperado en Caja:</span>
                    <span className="text-gold-400 font-mono">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.montoEfectivoEsperado : efectivoEsperado).toLocaleString()}</span>
                  </div>

                  <div className="bg-zinc-950 p-3 flex justify-between font-black text-sm border-t border-zinc-800">
                    <span className="text-white uppercase">Efectivo Físico Contado:</span>
                    <span className="text-white font-mono">RD$ {(selectedCorteForPrint ? selectedCorteForPrint.montoEfectivoReal : totalFisicoContado).toLocaleString()}</span>
                  </div>

                  <div className="p-3 flex justify-between font-black text-xs border-t border-zinc-800 bg-zinc-900/90">
                    <span className="uppercase text-zinc-300">Diferencia / Arqueo:</span>
                    <span className="font-mono">
                      {selectedCorteForPrint 
                        ? selectedCorteForPrint.diferencia === 0 
                          ? 'RD$ 0 (Cuadrado)' 
                          : `RD$ ${selectedCorteForPrint.diferencia.toLocaleString()}`
                        : diferenciaCaja === 0 
                          ? 'RD$ 0 (Cuadrado)' 
                          : `RD$ ${diferenciaCaja.toLocaleString()}`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center border-t border-zinc-800 text-xs">
                <div className="space-y-8">
                  <div className="border-b border-zinc-700 w-3/4 mx-auto"></div>
                  <span className="text-zinc-400 uppercase tracking-wider block font-bold">
                    Firma Cajero / Receptor
                  </span>
                </div>
                <div className="space-y-8">
                  <div className="border-b border-zinc-700 w-3/4 mx-auto"></div>
                  <span className="text-zinc-400 uppercase tracking-wider block font-bold">
                    Firma Administrador / Auditor
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Helper Coins icon component
function CoinsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18 0.99a6 6 0 0 1 0 12" />
      <path d="M6 18h12" />
      <path d="M6 14h12" />
    </svg>
  );
}
