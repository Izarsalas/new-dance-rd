/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TicketSettings, 
  Product, 
  Sale, 
  Recibo, 
  Alumno 
} from '../types';
import { 
  ShoppingCart, 
  BarChart3, 
  FileText, 
  ClipboardList, 
  Tag, 
  Users,
  Settings,
  X
} from 'lucide-react';

// Subcomponents
import ProductsView from './ProductsView';
import SalesView from './SalesView';
import DailySalesView from './DailySalesView';
import QuotesView from './QuotesView';
import InventoryView from './InventoryView';
import ClientsView from './ClientsView';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface GeneralBillingViewProps {
  settings: TicketSettings;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  onAddReceipt?: (r: Recibo) => void;
  
  // Dynamic extensions to connect the POS into Aura's general pupils and financial matrices
  alumnos: Alumno[];
  onAddIncome?: (income: { concepto: string; monto: number; fecha: string; metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta'; categoria: 'Inscripciones' | 'Mensualidades' | 'Clases Privadas' | 'Eventos' | 'Ventas' | 'Otros'; observaciones?: string }) => void;
  onDeleteIncomeByConcept?: (concept: string) => void;
  onUpdateSettings?: (newSettings: TicketSettings) => void;
}

export default function GeneralBillingView({
  settings,
  products,
  setProducts,
  sales,
  setSales,
  onAddReceipt,
  alumnos,
  onAddIncome,
  onDeleteIncomeByConcept,
  onUpdateSettings
}: GeneralBillingViewProps) {
  const { showAlert } = useAlertConfirm();
  
  // Section router
  const [activeSubTab, setActiveSubTab] = useState<
    | "ventas"
    | "cotizaciones"
    | "inventario"
    | "productos"
    | "clientes"
    | "ventas_dia"
  >("ventas");

  // Load departments from local storage, fallback to dance-centric items
  const [departments, setDepartments] = useState<string[]>(() => {
    const stored = localStorage.getItem('aura_billing_departments');
    if (stored) return JSON.parse(stored);
    return ["Uniformes", "Zapatos de Baile", "Accesorios", "Bebidas", "Material de Danza", "Insumos"];
  });

  // Shared state for current live POS cart
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("default");

  // Receipt Settings Panel Toggle
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsAcademia, setSettingsAcademia] = useState(settings.nombreAcademia);
  const [settingsRNC, setSettingsRNC] = useState(settings.rnc || '');
  const [settingsDireccion, setSettingsDireccion] = useState(settings.direccion || '');
  const [settingsTelefono, setSettingsTelefono] = useState(settings.telefono || '');
  const [settingsMensaje, setSettingsMensaje] = useState(settings.mensajeLargo || '');

  // Subtabs descriptors
  const subTabs = [
    {
      id: "ventas" as const,
      label: "VENTAS",
      icon: <ShoppingCart size={15} />,
    },
    {
      id: "ventas_dia" as const,
      label: "VENTAS DÍA",
      icon: <BarChart3 size={15} />,
    },
    {
      id: "cotizaciones" as const,
      label: "COTIZACIONES",
      icon: <FileText size={15} />,
    },
    {
      id: "inventario" as const,
      label: "INVENTARIO",
      icon: <ClipboardList size={15} />,
    },
    { id: "productos" as const, label: "PRODUCTOS", icon: <Tag size={15} /> },
    { id: "clientes" as const, label: "CLIENTES", icon: <Users size={15} /> },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsAcademia.trim()) {
      showAlert('El nombre de la academia es mandatorio.', 'Error');
      return;
    }

    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        nombreAcademia: settingsAcademia.trim(),
        rnc: settingsRNC.trim() || undefined,
        direccion: settingsDireccion.trim() || undefined,
        telefono: settingsTelefono.trim() || undefined,
        mensajeLargo: settingsMensaje.trim() || undefined
      });
      showAlert('Configuraciones de impresión guardadas exitosamente.', 'Operación Exitosa');
    }
    setShowSettingsModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-14" id="billing-view-primary">
      
      {/* HEADER BAR AND CONFIGURATION HOOK */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-455 font-bold border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-950/20">
              Punto de Venta General
            </span>
          </div>
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl tracking-tight mt-1">
            FACTURACIÓN Y TIENDA <span className="text-emerald-555">NEW DANCE SYSTEM</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Registre ventas al por menor de vestuarios, calzado, complementos y bebidas de la academia. Emita comprobantes físicos impresos con control fiscal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            // Preset fields with active properties
            setSettingsAcademia(settings.nombreAcademia);
            setSettingsRNC(settings.rnc || '');
            setSettingsDireccion(settings.direccion || '');
            setSettingsTelefono(settings.telefono || '');
            setSettingsMensaje(settings.mensajeLargo || '');
            setShowSettingsModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 border border-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>Configurar Impresión Ticket</span>
        </button>
      </div>

      {/* Nav Strip style from user template (emerald boundary, dark container) */}
      <div className="bg-[#0b101b] p-2 sm:p-3 rounded-2xl shadow-xl flex flex-nowrap items-center justify-start sm:justify-center gap-1 sm:gap-1.5 md:gap-3 overflow-x-auto border border-zinc-900 scrollbar-none">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            id={`subtab-${tab.id}`}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === tab.id
                ? "bg-[#00a389] text-white shadow-xl shadow-[#00a389]/10 font-black scale-[1.01]"
                : "text-white font-bold hover:bg-[#131926]/60"
            }`}
          >
            <span className="text-white">
              {tab.icon}
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wide text-white">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Conditional rendering according to active tab */}
      <div className="mt-4">
        {activeSubTab === "productos" ? (
          <ProductsView
            products={products}
            setProducts={setProducts}
            departments={departments}
            setDepartments={setDepartments}
          />
        ) : activeSubTab === "ventas" ? (
          <SalesView
            products={products}
            setProducts={setProducts}
            sales={sales}
            setSales={setSales}
            cart={cart}
            setCart={setCart}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            settings={settings}
            alumnos={alumnos}
            onAddReceipt={onAddReceipt}
            onAddIncome={onAddIncome}
          />
        ) : activeSubTab === "ventas_dia" ? (
          <DailySalesView
            sales={sales}
            setSales={setSales}
            products={products}
            setProducts={setProducts}
            settings={settings}
            onDeleteIncomeByConcept={onDeleteIncomeByConcept}
          />
        ) : activeSubTab === "cotizaciones" ? (
          <QuotesView
            sales={sales}
            setSales={setSales}
            products={products}
            setActiveSubTab={setActiveSubTab}
            setCart={setCart}
            setSelectedClientId={setSelectedClientId}
          />
        ) : activeSubTab === "inventario" ? (
          <InventoryView 
            products={products} 
          />
        ) : activeSubTab === "clientes" ? (
          <ClientsView 
            alumnos={alumnos}
            sales={sales}
          />
        ) : (
          /* Placeholder container */
          <div className="bg-zinc-950 rounded-2xl p-12 border border-zinc-900 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-750">
              {subTabs.find((t) => t.id === activeSubTab)?.icon}
            </div>
            <h3 className="text-xl font-black text-rose-500 uppercase italic mb-2">
              Módulo de {activeSubTab}
            </h3>
            <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto">
              Este módulo de Facturación General está listo para gestionar {activeSubTab}.
            </p>
          </div>
        )}
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 shrink-0">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-500" />
                Configurar Encabezado de Factura
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="rounded-lg p-1 text-zinc-450 hover:bg-zinc-900 hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="mt-4 space-y-4 overflow-y-auto pr-1 text-xs text-zinc-400">
              <div>
                <label className="block font-semibold mb-1">Nombre Comercial de la Academia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Aura Dance Academy SRL"
                  value={settingsAcademia}
                  onChange={(e) => setSettingsAcademia(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-stone-100 outline-none focus:border-emerald-550"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">RNC o Identificación Fiscal</label>
                  <input
                    type="text"
                    placeholder="Ej. 1-31-50790-1"
                    value={settingsRNC}
                    onChange={(e) => setSettingsRNC(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-stone-100 outline-none focus:border-emerald-550 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Teléfono Fijo / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ej. (809) 555-5678"
                    value={settingsTelefono}
                    onChange={(e) => setSettingsTelefono(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-stone-100 outline-none focus:border-emerald-550 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Dirección Física del Local</label>
                <input
                  type="text"
                  placeholder="Ej. Av. 27 de Febrero esq. Lincoln, Santo Domingo, R.D."
                  value={settingsDireccion}
                  onChange={(e) => setSettingsDireccion(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-stone-100 outline-none focus:border-emerald-550"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mensaje de Agradecimiento o Términos (Pie de Ticket)</label>
                <textarea
                  rows={3}
                  placeholder="Ej. ¡Gracias por apoyar la cultura y el arte dancístico! No se aceptan devoluciones de uniformes usados o zapatos abiertos."
                  value={settingsMensaje}
                  onChange={(e) => setSettingsMensaje(e.target.value)}
                  className="w-full rounded-xl border border-zinc-855 bg-zinc-900/60 p-2.5 text-stone-100 outline-none focus:border-emerald-550 resize-none font-sans"
                />
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-xl border border-zinc-850 px-4 py-2.5 text-zinc-300 hover:bg-zinc-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-black"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
