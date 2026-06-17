import React, { useState } from 'react';
import { 
  Settings, 
  Type, 
  Sliders, 
  Check, 
  RefreshCw, 
  FileText, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Layout,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { TicketSettings } from '../types';

interface ConfigurationModuleProps {
  settings: TicketSettings;
  onUpdateSettings: (newSettings: TicketSettings) => void;
  showAlert: (message: string, title?: string, isError?: boolean) => void;
}

export default function ConfigurationModule({ 
  settings, 
  onUpdateSettings,
  showAlert 
}: ConfigurationModuleProps) {
  
  // Local state for all fields initialized with active or sensible defaults
  const [nombreAcademia, setNombreAcademia] = useState(settings.nombreAcademia || 'NEW DANCE SYSTEM');
  const [rnc, setRnc] = useState(settings.rnc || '1-31-50790-1');
  const [direccion, setDireccion] = useState(settings.direccion || 'Av. Abraham Lincoln esq. Lope de Vega, Santo Domingo, Rep. Dominicana');
  const [telefono, setTelefono] = useState(settings.telefono || '(809) 567-2026');
  const [mensajeLargo, setMensajeLargo] = useState(settings.mensajeLargo || '¡Gracias por bailar con nosotros! Su compra apoya la formación de jóvenes talentos.');
  
  const [fuenteFamilia, setFuenteFamilia] = useState<TicketSettings['fuenteFamilia']>(settings.fuenteFamilia || 'grotesk');
  const [tamanoLetraTitulo, setTamanoLetraTitulo] = useState<TicketSettings['tamanoLetraTitulo']>(settings.tamanoLetraTitulo || 'text-lg');
  const [tamanoLetraCuerpo, setTamanoLetraCuerpo] = useState<TicketSettings['tamanoLetraCuerpo']>(settings.tamanoLetraCuerpo || 'text-xs');
  const [tamanoLetraFooter, setTamanoLetraFooter] = useState<TicketSettings['tamanoLetraFooter']>(settings.tamanoLetraFooter || 'text-[10px]');
  const [alineacionTexto, setAlineacionTexto] = useState<TicketSettings['alineacionTexto']>(settings.alineacionTexto || 'text-center');
  
  const [mostrarBordes, setMostrarBordes] = useState<boolean>(settings.mostrarBordes !== false);
  const [mostrarRNC, setMostrarRNC] = useState<boolean>(settings.mostrarRNC !== false);
  const [mostrarDireccion, setMostrarDireccion] = useState<boolean>(settings.mostrarDireccion !== false);
  const [mostrarTelefono, setMostrarTelefono] = useState<boolean>(settings.mostrarTelefono !== false);
  const [mostrarSeparadorDoble, setMostrarSeparadorDoble] = useState<boolean>(settings.mostrarSeparadorDoble || false);
  const [colorTemaTicket, setColorTemaTicket] = useState<TicketSettings['colorTemaTicket']>(settings.colorTemaTicket || 'dark-premium');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);
  const [mostrarLogo, setMostrarLogo] = useState<boolean>(settings.mostrarLogo !== false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isJpg = fileType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');

    if (!isJpg) {
      showAlert('Solo se permiten imágenes en formato JPG / JPEG.', 'Formato Incorrecto', true);
      return;
    }

    if (file.size > 1.2 * 1024 * 1024) {
      showAlert('La imagen es demasiado grande. Se recomienda usar una imagen menor a 1.2MB para un óptimo rendimiento.', 'Archivo muy Grande', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setLogoUrl(event.target.result);
        showAlert('El logo se ha previsualizado correctamente. Recuerde Guardar los cambios.', 'Logo Cargado', false);
      }
    };
    reader.onerror = () => {
      showAlert('Error al procesar la imagen.', 'Error de Lectura', true);
    };
    reader.readAsDataURL(file);
  };

  // Trigger save
  const handleSave = () => {
    if (!nombreAcademia.trim()) {
      showAlert('El nombre de la academia es requerido.', 'Nombre Requerido', true);
      return;
    }

    const updated: TicketSettings = {
      nombreAcademia: nombreAcademia.trim(),
      rnc: rnc.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      mensajeLargo: mensajeLargo.trim(),
      fuenteFamilia,
      tamanoLetraTitulo,
      tamanoLetraCuerpo,
      tamanoLetraFooter,
      alineacionTexto,
      mostrarBordes,
      mostrarRNC,
      mostrarDireccion,
      mostrarTelefono,
      mostrarSeparadorDoble,
      colorTemaTicket,
      logoUrl,
      mostrarLogo
    };

    onUpdateSettings(updated);
    showAlert('Todas las configuraciones del sistema e impresión de facturas fueron guardadas correctamente.', 'Configuraciones Guardadas', false);
  };

  // Reset defaults
  const handleResetDefaults = () => {
    setNombreAcademia('NEW DANCE SYSTEM');
    setRnc('1-31-50790-1');
    setDireccion('Av. Abraham Lincoln esq. Lope de Vega, Santo Domingo, Rep. Dominicana');
    setTelefono('(809) 567-2026');
    setMensajeLargo('¡Gracias por bailar con nosotros! Su compra apoya la formación de jóvenes talentos.');
    setFuenteFamilia('grotesk');
    setTamanoLetraTitulo('text-lg');
    setTamanoLetraCuerpo('text-xs');
    setTamanoLetraFooter('text-[10px]');
    setAlineacionTexto('text-center');
    setMostrarBordes(true);
    setMostrarRNC(true);
    setMostrarDireccion(true);
    setMostrarTelefono(true);
    setMostrarSeparadorDoble(false);
    setColorTemaTicket('dark-premium');
    setLogoUrl(undefined);
    setMostrarLogo(true);
    
    showAlert('Se han reestablecido los valores predeterminados para el diseño de facturas.', 'Diseño de Fábrica', false);
  };

  // Helper selectors for class style mapping in real-time preview
  const getFontFamilyClass = (f?: string) => {
    switch (f) {
      case 'sans': return 'font-sans';
      case 'mono': return 'font-mono';
      case 'serif': return 'font-serif';
      case 'courier': return 'font-[Courier,monospace]';
      case 'grotesk':
      default:
        return 'font-[Space\\ Grotesk,sans-serif] tracking-tight';
    }
  };

  const getThemeColorClass = (t?: string) => {
    switch (t) {
      case 'light-classic': return 'bg-white text-zinc-950 border-zinc-200';
      case 'cream-retro': return 'bg-[#faf6e8] text-amber-950 border-amber-900/20';
      case 'white-clean': return 'bg-slate-50 text-slate-900 border-slate-200';
      case 'dark-premium':
      default:
        return 'bg-zinc-950 text-stone-100 border-zinc-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12" id="configuration-module-primary">
      
      {/* Title & Header block */}
      <div className="border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-mono text-gold-500 font-bold border border-gold-500/20 px-2 py-0.5 rounded bg-gold-950/20 flex items-center gap-1">
            <Settings size={11} /> Ajustes del Sistema
          </span>
        </div>
        <h1 className="font-display text-2xl font-black text-white sm:text-3xl tracking-tight mt-1 uppercase">
          Configuración <span className="text-gold-500">Avanzada NDS</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Modifique los textos, identidades, estilo tipográfico y tamaños de letra del comprobante de caja a su antojo. Los cambios impactan el punto de venta en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Configuration Controls (span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 0: Logo de la Academia (Cargar JPG) */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-mono text-gold-500 font-bold flex items-center gap-2">
              <ImageIcon size={14} /> Logotipo de la Academia
            </h2>
            <p className="text-xs text-zinc-400 font-serif leading-relaxed">
              Personalice la cabecera de su factura o cotización con un logo oficial corporativo en formato <strong className="text-gold-500">JPG (o JPEG)</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Drag n drop box */}
              <div className="md:col-span-8">
                <div 
                  className="border-2 border-dashed border-zinc-805 bg-zinc-900/30 hover:border-gold-500/50 rounded-xl p-4 text-center relative group transition-all"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="logo-file-input"
                  />
                  <div className="space-y-1.5 pointer-events-none">
                    <div className="flex justify-center">
                      <Upload size={20} className="text-zinc-500 group-hover:text-gold-500 transition-colors" />
                    </div>
                    <div className="text-xs text-stone-300 font-semibold group-hover:text-white transition-colors">
                      Seleccione archivo JPG o arrástrelo
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono uppercase">
                      Exclusivo JPG, máx 1.2MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="md:col-span-4 flex flex-col items-center justify-center border border-zinc-900/80 bg-zinc-900/20 rounded-xl p-3 h-28 relative">
                {logoUrl ? (
                  <div className="relative group/thumb w-full h-full flex items-center justify-center">
                    <img 
                      src={logoUrl} 
                      alt="Logo Academia" 
                      className="max-h-full max-w-full object-contain rounded bg-white p-1 shadow-inner"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoUrl(undefined);
                        showAlert('Se ha removido el logo. Recuerde presionar "Guardar Configuraciones" para aplicar los cambios.', 'Logo Removido', false);
                      }}
                      className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-lg transition-all cursor-pointer hover:scale-110"
                      title="Eliminar logo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-1 pointer-events-none">
                    <ImageIcon size={24} className="text-zinc-700 mx-auto" />
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600 block">Sin Logo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Switch */}
            <div className="pt-2 border-t border-zinc-900">
              <label className="flex items-center gap-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 p-3.5 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={mostrarLogo && !!logoUrl}
                  disabled={!logoUrl}
                  onChange={(e) => setMostrarLogo(e.target.checked)}
                  className="rounded border-zinc-750 text-gold-500 focus:ring-transparent h-4 w-4 disabled:opacity-40"
                />
                <div className="space-y-0.5 animate-fade-in">
                  <span className={`text-xs font-bold block ${!logoUrl ? 'text-zinc-500' : 'text-stone-150'}`}>
                    Mostrar Logotipo en Facturas
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    {!logoUrl ? 'Debe cargar un logotipo primero para poder habilitar esta casilla' : 'Dibuja el logotipo arriba del nombre comercial'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Card 1: Bill Text & Metadata */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-6 space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-mono text-gold-500 font-bold flex items-center gap-2">
              <FileText size={14} /> 1. Información de la Factura (Textos)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  Nombre de la Academia / Empresa
                </label>
                <input
                  type="text"
                  value={nombreAcademia}
                  onChange={(e) => setNombreAcademia(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-3 text-sm text-white outline-none focus:border-gold-500/50"
                  placeholder="Ej. NEW DANCE SYSTEM S.R.L."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  RNC / Registro Fiscal
                </label>
                <input
                  type="text"
                  value={rnc}
                  onChange={(e) => setRnc(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-3 text-sm font-mono text-white outline-none focus:border-gold-500/50"
                  placeholder="Ej. 1-31-50790-1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  Teléfono Comercial
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-3 text-sm font-mono text-white outline-none focus:border-gold-500/50"
                  placeholder="Ej. (809) 567-2026"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  Dirección Física
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-3 text-sm text-white outline-none focus:border-gold-500/50"
                  placeholder="Ubicación comercial de la escuela de baile"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  Mensaje al Pie de Página (Garantías/Términos)
                </label>
                <textarea
                  rows={2}
                  value={mensajeLargo}
                  onChange={(e) => setMensajeLargo(e.target.value)}
                  className="w-full rounded-xl border border-zinc-855 bg-zinc-900/60 p-3 text-xs text-stone-100 outline-none focus:border-gold-500/50 resize-none"
                  placeholder="Ej. Las devoluciones de uniformes deben realizarse en menos de 5 días. No aplica reembolso."
                />
              </div>
            </div>
          </div>

          {/* Card 2: Layout Style, Typography and Size customization */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-6 space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-mono text-gold-500 font-bold flex items-center gap-2">
              <Type size={14} /> 2. Tipografía y Tamaño de Letras
            </h2>
            
            <div className="space-y-4">
              
              {/* Typography Font Family Choices */}
              <div className="space-y-2">
                <label className="block text-[11px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  Familia Tipográfica (Fuente Base)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'grotesk' as const, label: 'Space G.', desc: 'Moderna y Premium' },
                    { id: 'sans' as const, label: 'Inter Sans', desc: 'Standard Minimal' },
                    { id: 'mono' as const, label: 'JBrains Mono', desc: 'Sólida / Datos' },
                    { id: 'serif' as const, label: 'Editorial S.', desc: 'Clásica Elegante' },
                    { id: 'courier' as const, label: 'Courier N.', desc: 'Térmica Pura' }
                  ].map((fontItem) => (
                    <button
                      key={fontItem.id}
                      type="button"
                      onClick={() => setFuenteFamilia(fontItem.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        fuenteFamilia === fontItem.id 
                          ? 'bg-gold-500/10 border-gold-500 text-gold-300 font-extrabold shadow-md' 
                          : 'border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <span className="block text-xs truncate">{fontItem.label}</span>
                      <span className="block text-[8px] text-zinc-500 truncate mt-0.5">{fontItem.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <label className="block text-[11px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  Alineación del Encabezado
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'text-left' as const, label: 'Izquierda', icon: <AlignLeft size={14} /> },
                    { id: 'text-center' as const, label: 'Centrado', icon: <AlignCenter size={14} /> },
                    { id: 'text-right' as const, label: 'Derecha', icon: <AlignRight size={14} /> }
                  ].map((align) => (
                    <button
                      key={align.id}
                      type="button"
                      onClick={() => setAlineacionTexto(align.id)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        alineacionTexto === align.id 
                          ? 'bg-gold-500/15 border-gold-500 text-gold-400' 
                          : 'border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {align.icon}
                      <span>{align.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
                
                {/* Header Font Size */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                    Título (Nombre)
                  </label>
                  <select
                    value={tamanoLetraTitulo}
                    onChange={(e: any) => setTamanoLetraTitulo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900 p-2.5 text-xs text-white outline-none cursor-pointer focus:border-gold-500/50"
                  >
                    <option value="text-sm">Muy Pequeño (sm)</option>
                    <option value="text-base">Pequeño (base)</option>
                    <option value="text-lg">Intermedio (lg)</option>
                    <option value="text-xl">Grande (xl)</option>
                    <option value="text-2xl">Muy Grande (2xl)</option>
                    <option value="text-3xl">Display Gigante (3xl)</option>
                  </select>
                </div>

                {/* Body Font Size */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                    Cuerpo (Items/Precios)
                  </label>
                  <select
                    value={tamanoLetraCuerpo}
                    onChange={(e: any) => setTamanoLetraCuerpo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900 p-2.5 text-xs text-white outline-none cursor-pointer focus:border-gold-500/50"
                  >
                    <option value="text-[10px]">Compacto (10px)</option>
                    <option value="text-xs">Estándar (xs)</option>
                    <option value="text-sm">Fácil Lectura (sm)</option>
                    <option value="text-base">Grande (base)</option>
                  </select>
                </div>

                {/* Footer Font Size */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                    Textos del Pie (Garantías)
                  </label>
                  <select
                    value={tamanoLetraFooter}
                    onChange={(e: any) => setTamanoLetraFooter(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900 p-2.5 text-xs text-white outline-none cursor-pointer focus:border-gold-500/50"
                  >
                    <option value="text-[8px]">Micro (8px)</option>
                    <option value="text-[9px]">Muy Comprimido (9px)</option>
                    <option value="text-[10px]">Normal (10px)</option>
                    <option value="text-xs">Fácil Lectura (xs)</option>
                    <option value="text-sm">Grande (sm)</option>
                  </select>
                </div>

              </div>

            </div>
          </div>

          {/* Card 3: Toggle Visible Elements */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-mono text-gold-500 font-bold flex items-center gap-2">
              <Sliders size={14} /> 3. Elementos y Estructura del Ticket
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <label className="flex items-center gap-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 p-3.5 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={mostrarRNC}
                  onChange={(e) => setMostrarRNC(e.target.checked)}
                  className="rounded border-zinc-700 text-gold-500 focus:ring-transparent h-4 w-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-150 block">Mostrar RNC de la empresa</span>
                  <span className="text-[10px] text-zinc-500 block">Identificación fiscal fiscalizada</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 p-3.5 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={mostrarDireccion}
                  onChange={(e) => setMostrarDireccion(e.target.checked)}
                  className="rounded border-zinc-700 text-gold-500 focus:ring-transparent h-4 w-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-150 block">Mostrar Dirección</span>
                  <span className="text-[10px] text-zinc-500 block">Dirección comercial para auditoría</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 p-3.5 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={mostrarTelefono}
                  onChange={(e) => setMostrarTelefono(e.target.checked)}
                  className="rounded border-zinc-700 text-gold-500 focus:ring-transparent h-4 w-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-150 block">Mostrar Teléfono</span>
                  <span className="text-[10px] text-zinc-500 block">Contacto comercial en cabecera</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 p-3.5 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={mostrarSeparadorDoble}
                  onChange={(e) => setMostrarSeparadorDoble(e.target.checked)}
                  className="rounded border-zinc-700 text-gold-500 focus:ring-transparent h-4 w-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-150 block">Separador Doble Estilo Térmico</span>
                  <span className="text-[10px] text-zinc-500 block">Usa líneas dobles en lugar de punteadas</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 p-3.5 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={mostrarBordes}
                  onChange={(e) => setMostrarBordes(e.target.checked)}
                  className="rounded border-zinc-700 text-gold-500 focus:ring-transparent h-4 w-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-150 block">Contenedor Impreso con Borde</span>
                  <span className="text-[10px] text-zinc-500 block">Encierra el ticket en bordes definidos</span>
                </div>
              </label>

              {/* Theme Selector for Ticket Preview */}
              <div className="rounded-xl bg-zinc-900/40 border border-zinc-850 p-3 flex flex-col justify-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest block">Color de Fondo en Vista</span>
                <div className="flex gap-1.5 pt-1">
                  {[
                    { id: 'dark-premium' as const, title: 'Oscuro', style: 'bg-zinc-950 border-zinc-800' },
                    { id: 'light-classic' as const, title: 'Clásico', style: 'bg-white border-zinc-300' },
                    { id: 'cream-retro' as const, title: 'Crema', style: 'bg-[#faf6e8] border-amber-900/10' },
                    { id: 'white-clean' as const, title: 'Slate', style: 'bg-slate-100 border-slate-300' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.title}
                      onClick={() => setColorTemaTicket(preset.id)}
                      className={`h-6 flex-1 rounded border cursor-pointer relative ${preset.style} ${
                        colorTemaTicket === preset.id ? 'ring-1 ring-gold-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {colorTemaTicket === preset.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={10} className={`${preset.id === 'light-classic' || preset.id === 'white-clean' || preset.id === 'cream-retro' ? 'text-zinc-900' : 'text-gold-500'} font-bold`} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Action Row buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-save-sys-settings"
              type="button"
              onClick={handleSave}
              className="w-full sm:flex-1 rounded-xl bg-gold-500 text-black font-extrabold text-xs uppercase tracking-widest py-4 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={15} />
              <span>Guardar Configuraciones</span>
            </button>

            <button
              id="btn-reset-sys-settings"
              type="button"
              onClick={handleResetDefaults}
              className="w-full sm:w-auto rounded-xl bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800 text-zinc-400 px-5 py-4 text-xs font-semibold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Fábrica</span>
            </button>
          </div>

        </div>

        {/* Right Side: Live High Fidelity Dynamic Ticket Preview (span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1"><Eye size={13} className="text-gold-500" /> Vista Previa Real</span>
              <span className="font-mono text-[10px] text-zinc-500">80mm Térmica Impresora</span>
            </div>

            {/* Simulated Receipt Component responding directly to configuration choices */}
            <div className={`w-full rounded-2xl border p-6 transition-all duration-300 shadow-2xl ${getThemeColorClass(colorTemaTicket)} ${getFontFamilyClass(fuenteFamilia)}`}>
              
              {/* Surrounding design border if toggle active */}
              <div className={`p-4 space-y-4 ${mostrarBordes ? 'border border-dashed border-current/25 rounded-xl' : ''}`}>
                
                {/* Header Block alignment customizable */}
                <div className={`space-y-1.5 ${alineacionTexto}`}>
                  {mostrarLogo && logoUrl && (
                    <div className="flex justify-center mb-3">
                      <img 
                        src={logoUrl} 
                        alt="Logo Academia" 
                        className="max-h-16 max-w-[140px] object-contain rounded p-1 bg-white border border-zinc-200/50 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <span className="h-4 w-4 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-[10px] font-black text-amber-500">N</span>
                    <span className="text-[8px] uppercase tracking-widest font-mono text-zinc-500">ESTUDIO PREMIUM</span>
                  </div>
                  
                  <h3 className={`font-black uppercase tracking-tight leading-tight ${tamanoLetraTitulo}`}>
                    {nombreAcademia || 'NEW DANCE SYSTEM'}
                  </h3>

                  {mostrarRNC && rnc && (
                    <p className="text-[10px] font-mono tracking-wider opacity-85">RNC: {rnc}</p>
                  )}
                  {mostrarDireccion && direccion && (
                    <p className="text-[9px] leading-tight opacity-75">{direccion}</p>
                  )}
                  {mostrarTelefono && telefono && (
                    <p className="text-[9px] font-mono opacity-80">Tel: {telefono}</p>
                  )}

                  {/* Separador Custom type */}
                  <div className="pt-2">
                    {mostrarSeparadorDoble ? (
                      <div className="border-t-2 border-double border-current opacity-40 w-full" />
                    ) : (
                      <div className="border-t border-dashed border-current opacity-30 w-full" />
                    )}
                  </div>
                </div>

                {/* Simulated Metadata */}
                <div className={`space-y-1 ${tamanoLetraCuerpo} opacity-90`}>
                  <div className="flex justify-between font-mono">
                    <span>COMPROBANTE:</span>
                    <span className="font-bold">NDS-DEMO-001</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>MODO VENTA:</span>
                    <span>Consumidor Final</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>FECHA / HORA:</span>
                    <span>17-JunIO-2026 12:00</span>
                  </div>
                  
                  <div className="pt-1">
                    {mostrarSeparadorDoble ? (
                      <div className="border-t-2 border-double border-current opacity-40 w-full" />
                    ) : (
                      <div className="border-t border-dashed border-current opacity-30 w-full" />
                    )}
                  </div>
                </div>

                {/* Simulated items with custom typography elements */}
                <div className="space-y-2">
                  <div className={`font-bold grid grid-cols-12 opacity-80 ${tamanoLetraFooter}`}>
                    <span className="col-span-6 text-left">CONCEPTO</span>
                    <span className="col-span-2 text-center">CANT</span>
                    <span className="col-span-4 text-right">TOTAL</span>
                  </div>
                  <div className="border-t border-current/10" />

                  {/* Example rows */}
                  <div className={`space-y-1.5 ${tamanoLetraCuerpo}`}>
                    {[
                      { name: 'Salsa Iniciación - Mensualidad', qty: 1, price: 3000 },
                      { name: 'Zapatos Salsa Tacón Alto', qty: 1, price: 4500 },
                      { name: 'Agua de Manantial Premium 500ml', qty: 2, price: 50 },
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-12">
                        <span className="col-span-6 text-left truncate uppercase leading-tight font-sans tracking-wide font-medium">{row.name}</span>
                        <span className="col-span-2 text-center opacity-80 font-mono">{row.qty}</span>
                        <span className="col-span-4 text-right font-bold font-mono">RD$ {(row.qty * row.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    {mostrarSeparadorDoble ? (
                      <div className="border-t-2 border-double border-current opacity-40 w-full" />
                    ) : (
                      <div className="border-t border-dashed border-current opacity-30 w-full" />
                    )}
                  </div>
                </div>

                {/* Mathematical calculations wrapper matching chosen size */}
                <div className={`space-y-1.5 pl-8 ${tamanoLetraCuerpo}`}>
                  <div className="flex justify-between text-current/80">
                    <span>SUBTOTAL:</span>
                    <span className="font-mono">RD$ 7,600.00</span>
                  </div>
                  <div className="flex justify-between text-current/70 text-[10px]">
                    <span>ITBIS IGUALADO (18%):</span>
                    <span className="font-mono">RD$ 1,368.00</span>
                  </div>
                  <div className="flex justify-between font-black text-current border-t border-current/15 pt-1.5">
                    <span>TOTAL FACTURA:</span>
                    <span className="font-mono">RD$ 8,968.00</span>
                  </div>
                </div>

                {/* Bottom customizable message */}
                <div className={`text-center pt-2 space-y-2 ${alineacionTexto}`}>
                  {mostrarSeparadorDoble ? (
                    <div className="border-t-2 border-double border-current opacity-40 w-full" />
                  ) : (
                    <div className="border-t border-dashed border-current opacity-30 w-full" />
                  )}
                  
                  <p className={`leading-relaxed uppercase font-medium ${tamanoLetraFooter}`}>
                    {mensajeLargo || '¡Gracias por apoyar el arte y la danza en NEW DANCE SYSTEM!'}
                  </p>
                  
                  <div className="text-[7.5px] uppercase tracking-widest opacity-40 pt-1 font-mono">
                    PULSE IMPRIMIR DESDE EL POS PARA EMISIÓN FÍSICA
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
