/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Sale, SaleItem, Alumno, TicketSettings } from '../types';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  User, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Undo2,
  Receipt,
  Printer,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X,
  Clock
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface SalesViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  cart: (Product & { quantity: number })[];
  setCart: React.Dispatch<React.SetStateAction<(Product & { quantity: number })[]>>;
  selectedClientId: string;
  setSelectedClientId: React.Dispatch<React.SetStateAction<string>>;
  settings: TicketSettings;
  alumnos: Alumno[];
  onAddReceipt?: (r: any) => void;
  // Let's also pass a hook to register a direct income in Aura's financial ledger!
  onAddIncome?: (income: { concepto: string; monto: number; fecha: string; metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta'; categoria: 'Inscripciones' | 'Mensualidades' | 'Clases Privadas' | 'Eventos' | 'Ventas' | 'Otros'; observaciones?: string }) => void;
}

export default function SalesView({
  products,
  setProducts,
  sales,
  setSales,
  cart,
  setCart,
  selectedClientId,
  setSelectedClientId,
  settings,
  alumnos,
  onAddReceipt,
  onAddIncome
}: SalesViewProps) {
  const { showAlert, showConfirm } = useAlertConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Sales Form parameters
  const [customClientName, setCustomClientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [isQuotation, setIsQuotation] = useState(false); // Sale vs Cotizacion

  // Post-sale Receipt modal parameters
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // High Fidelity Custom POS controls
  const [applyItbis, setApplyItbis] = useState(true);
  const [propina, setPropina] = useState<number>(0);
  const [showCommonItemModal, setShowCommonItemModal] = useState(false);
  const [commonItemName, setCommonItemName] = useState('');
  const [commonItemPrice, setCommonItemPrice] = useState<number>('');

  // Parked Cart (ESPERA) state
  const [parkedCartItems, setParkedCartItems] = useState<(Product & { quantity: number })[]>(() => {
    const stored = localStorage.getItem('aura_parked_cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Handler to park the cart in ESPERA
  const handleParkCart = () => {
    if (cart.length === 0) {
      showAlert('No hay artículos en el carrito actual para colocar en espera.', 'Carrito Vacío');
      return;
    }
    localStorage.setItem('aura_parked_cart', JSON.stringify(cart));
    setParkedCartItems(cart);
    setCart([]);
    showAlert('El carrito de compras ha sido colocado en ESPERA de forma segura.', 'Carrito en Espera');
  };

  // Handler to restore parked cart
  const handleRestoreParkedCart = () => {
    if (parkedCartItems.length === 0) return;
    if (cart.length > 0) {
      const merge = confirm('Tiene artículos activos en caja. ¿Desea fusionar el carrito en espera con los productos actuales?');
      if (!merge) return;
    }
    
    // Merge or set
    const updated = [...cart];
    parkedCartItems.forEach(parkedItem => {
      const idx = updated.findIndex(i => i.id === parkedItem.id);
      if (idx > -1) {
        updated[idx].quantity += parkedItem.quantity;
      } else {
        updated.push(parkedItem);
      }
    });

    setCart(updated);
    setParkedCartItems([]);
    localStorage.removeItem('aura_parked_cart');
    showAlert('Carrito en espera restaurado con éxito.', 'Operación Exitosa');
  };

  // Quick "+ COMÚN" additions
  const handleAddCommonItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonItemName.trim() || !commonItemPrice || Number(commonItemPrice) <= 0) {
      showAlert('Por favor escriba una descripción y un precio válido.', 'Datos Inválidos');
      return;
    }

    const customProduct: Product = {
      id: 'custom_prod_' + Date.now(),
      nombre: `[COMÚN] ${commonItemName.trim()}`,
      precio: Number(commonItemPrice),
      stock: 9999, // unlimited fallback
      departamento: "Ventas"
    };

    setCart(prev => {
      const idx = prev.findIndex(item => item.nombre === customProduct.nombre);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { ...customProduct, quantity: 1 }];
    });

    // Reset common form
    setCommonItemName('');
    setCommonItemPrice('');
    setShowCommonItemModal(false);
  };

  // Derive active lists
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.departamento)))];

  // Filtered Products Catalog
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'Todos' || p.departamento === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Shopping Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  const itbis = applyItbis ? Math.round(subtotal * 0.18) : 0; // standard 18% Dominican Republic tax
  const total = subtotal + itbis + Number(propina || 0);

  // Calculate change for Cash payment
  const changeAmount = cashReceived && typeof cashReceived === 'number' && cashReceived >= total 
    ? cashReceived - total 
    : 0;

  // Add Item to cart
  const handleAddToCart = (product: Product) => {
    // Check general stock availability
    if (product.stock <= 0) {
      showAlert('Este producto no cuenta con unidades disponibles en el inventario actual.', 'Sin Stock');
      return;
    }

    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      const activeQty = cart[existingIndex].quantity;
      if (activeQty >= product.stock) {
        showAlert(`Solo hay ${product.stock} unidades de este producto en el inventario actual.`, 'Límite de Stock');
        return;
      }

      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Decrease quantity or remove item
  const handleDecreaseQuantity = (productId: string) => {
    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      const updated = [...cart];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
        setCart(updated);
      } else {
        handleRemoveFromCart(productId);
      }
    }
  };

  // Remove element completely from cart
  const handleRemoveFromCart = (productId: string) => {
    const nextCart = cart.filter(item => item.id !== productId);
    setCart(nextCart);
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Validate and Submit the order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showAlert('Su carrito de ventas se encuentra vacío. Seleccione productos de la izquierda.', 'Carrito Vacío');
      return;
    }

    // Client evaluation
    let clientNameFinal = 'Consumidor Final';
    if (selectedClientId === 'custom') {
      if (!customClientName.trim()) {
        showAlert('Escriba el nombre del cliente personalizado.', 'Nombre de Cliente Faltante');
        return;
      }
      clientNameFinal = customClientName.trim();
    } else if (selectedClientId !== 'default') {
      const activeStudent = alumnos.find(a => a.id === selectedClientId);
      if (activeStudent) {
        clientNameFinal = activeStudent.nombre;
      }
    }

    // Cash validation check
    if (paymentMethod === 'Efectivo' && !isQuotation) {
      if (cashReceived === '' || cashReceived < total) {
        showAlert('El monto recibido en efectivo es insuficiente para cubrir el total de la compra.', 'Efectivo Insuficiente');
        return;
      }
    }

    // Build sale items list
    const saleItems: SaleItem[] = cart.map(item => ({
      productId: item.id,
      productoNombre: item.nombre,
      precio: item.precio,
      cantidad: item.quantity
    }));

    const saleCode = (isQuotation ? 'COT-' : 'FAC-') + Math.floor(100000 + Math.random() * 900000);
    const operationDate = new Date().toISOString().substring(0, 10);

    const newSale: Sale = {
      id: (isQuotation ? 'cot' : 'sal') + Date.now(),
      codigo: saleCode,
      items: saleItems,
      subtotal: subtotal,
      itbis: itbis,
      total: total,
      fecha: operationDate,
      clienteId: selectedClientId,
      clienteNombre: clientNameFinal,
      metodoPago: paymentMethod,
      pagadoCon: paymentMethod === 'Efectivo' && !isQuotation ? Number(cashReceived) : undefined,
      cambio: paymentMethod === 'Efectivo' && !isQuotation ? changeAmount : undefined,
      estado: isQuotation ? 'Cotización' : 'Completado'
    };

    // Confirm logic
    const confirmMessage = isQuotation 
      ? `¿Desea registrar esta Cotización por un total de RD$ ${total.toLocaleString('es-DO')}?`
      : `¿Confirmar cobro y facturación de RD$ ${total.toLocaleString('es-DO')}?`;
    
    const confirmTitle = isQuotation ? 'Registrar Cotización' : 'Finalizar Facturación';

    const proceed = await showConfirm(confirmMessage, confirmTitle);
    if (!proceed) return;

    if (!isQuotation) {
      // 1. DEDUCT PRODUCTS STOCK
      const updatedProducts = products.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.quantity)
          };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem('aura_billing_products', JSON.stringify(updatedProducts));

      // 2. TRIGGER AURA DIRECT INCOME (financial ledger link)
      if (onAddIncome) {
        onAddIncome({
          concepto: `Facturación General POS (${saleCode}) - Cliente: ${clientNameFinal}`,
          monto: total,
          fecha: operationDate,
          metodoPago: paymentMethod,
          categoria: 'Ventas',
          observaciones: `Artículos: ${cart.map(c => `${c.nombre} (x${c.quantity})`).join(', ')}`
        });
      }

      // 3. RECIBO OPTIONAL CALLBACK
      if (onAddReceipt) {
        onAddReceipt({
          id: 'rec' + Date.now(),
          saleId: newSale.id,
          fecha: operationDate,
          total: total,
          clienteNombre: clientNameFinal
        });
      }
    }

    // SAVING SALE RECORD
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    localStorage.setItem('aura_billing_sales', JSON.stringify(updatedSales));

    // STUFF SETUP FOR THERMAL RECEIPT DISPLAY
    setCompletedSale(newSale);
    setShowReceiptModal(true);

    // RESET STATES
    setCart([]);
    setSelectedClientId('default');
    setCustomClientName('');
    setCashReceived('');
    setIsQuotation(false);
  };

  const printTicket = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sales-view-root">
      
      {/* LEFT: PRODUCTS BENTO GRID CATALOGUE (7 COLS) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* FILTERS & SEARCH BAR */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 space-y-3">
          
          {/* Parked Cart Restorer Hint Bar */}
          {parkedCartItems.length > 0 && (
            <div className="animatedPulse bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-400 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin text-amber-550" />
                <span>Tiene un carrito en espera con <strong>{parkedCartItems.reduce((acc, c) => acc + c.quantity, 0)} artículos</strong>.</span>
              </div>
              <button
                type="button"
                onClick={handleRestoreParkedCart}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3 py-1 rounded-lg cursor-pointer transition-all"
              >
                RECUPERAR CARRITO
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-3 left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Código, Nombre o Descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-zinc-900 bg-zinc-900/40 pl-10 pr-28 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700/80"
              />
              <span className="absolute right-3.5 top-3.5 text-[8px] font-mono font-black text-zinc-500 uppercase tracking-wider pointer-events-none select-none">
                |||| ESCÁNER ACTIVO
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setCommonItemName('');
                setCommonItemPrice('');
                setShowCommonItemModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#00a389] hover:bg-[#008c75] text-white text-xs font-black tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shrink-0 uppercase"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3px]" />
              <span>+ COMÚN</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat, idx) => {
              const isSelected = activeCategory === cat;
              
              // Custom colors matching high-fidelity layout
              let buttonStyle = "";
              if (cat === 'Todos') {
                buttonStyle = isSelected
                  ? "bg-rose-700 border-rose-600 text-white font-extrabold"
                  : "bg-zinc-900/60 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-white";
              } else {
                buttonStyle = isSelected
                  ? "bg-gold-500/15 border-gold-500/60 text-gold-500 font-bold"
                  : "bg-zinc-900/60 border-zinc-900 text-zinc-450 hover:bg-zinc-900 hover:text-white";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap border ${buttonStyle}`}
                >
                  {cat === 'Todos' ? 'Todos' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/20 py-20 text-center text-xs text-zinc-500">
              <AlertCircle className="h-8 w-8 text-zinc-850 mx-auto mb-2" />
              <span>No se encontraron productos disponibles para esta categoría.</span>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isOut = p.stock <= 0;
              const isLow = p.stock <= 3 && p.stock > 0;
              return (
                <button
                  key={p.id}
                  disabled={isOut}
                  onClick={() => handleAddToCart(p)}
                  className={`relative p-4 rounded-2xl border bg-zinc-950 text-left transition-all flex flex-col justify-between h-[155px] ${
                    isOut 
                      ? 'border-zinc-900/30 opacity-40 cursor-not-allowed' 
                      : 'border-zinc-900 hover:border-gold-550 cursor-pointer hover:shadow-lg hover:shadow-gold-500/5 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex gap-3.5 items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase font-mono bg-zinc-900 text-zinc-450 px-2 py-0.5 rounded border border-zinc-850 font-bold">
                        {p.departamento}
                      </span>
                      <h4 className="font-semibold text-white text-xs mt-2.5 line-clamp-2 leading-relaxed">
                        {p.nombre}
                      </h4>
                    </div>
                    {p.foto && (
                      <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                        <img src={p.foto} alt={p.nombre} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Precio POS</span>
                      <span className="text-sm font-black text-white font-mono">RD$ {p.precio.toLocaleString('es-DO')}</span>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 rounded font-mono px-1.5 py-0.5 text-[9px] font-bold border ${
                        isOut 
                          ? 'bg-rose-950/20 text-rose-500 border-rose-950' 
                          : isLow 
                            ? 'bg-amber-950/20 text-amber-500 border-amber-900/30' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-850'
                      }`}>
                        {isOut ? 'Agotado' : `${p.stock} uds`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
          
          {/* MÁS PRODUCTOS... high-fidelity design skeleton */}
          <div className="rounded-2xl border-2 border-dashed border-zinc-850 bg-zinc-950/20 p-4 h-[155px] flex flex-col justify-center items-start text-left select-none text-zinc-650">
            <span className="text-[9px] font-sans font-black tracking-wider block uppercase mb-1 opacity-70">MÁS PRODUCTOS...</span>
            <p className="text-[10px] text-zinc-500 leading-tight">Registre artículos adicionales en la pestaña PRODUCTOS de la barra superior.</p>
          </div>
        </div>

      </div>

      {/* RIGHT: LIVE SHOPPING CART & CLIENT GATE (5 COLS) */}
      <div className="lg:col-span-5">
        <form onSubmit={handleCheckoutSubmit} className="rounded-2xl border border-zinc-900 bg-[#0c121f] p-5.5 space-y-4.5 shrink-0 shadow-2xl relative text-xs">
          
          {/* Header layout from image */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-[#00a389]/10 text-white">
                <Receipt className="h-4.5 w-4.5 stroke-[2.5px] text-white" />
              </div>
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider italic">
                FACTURA
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-[9px] font-bold text-white hover:text-rose-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                Vaciar Carrito
              </button>
            )}
          </div>

          {/* ACTIVE CLIENT/COUNTER SELECT */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-white font-sans">
              CLIENTE
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-xl border border-zinc-850 bg-[#121824] p-3 text-xs text-white outline-none focus:border-zinc-700 cursor-pointer font-semibold"
            >
              <option value="default">Ventas de Mostrador</option>
              <option value="custom">-- Cliente Especial (Escribir Nombre) --</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre} ({a.ritmo})</option>
              ))}
            </select>
          </div>

          {/* CUSTOM CLIENT TEXT FIELD */}
          {selectedClientId === 'custom' && (
            <div className="animate-fade-in space-y-1">
              <label className="block text-[9px] font-bold text-white uppercase tracking-wider">Nombre Completo del Cliente *</label>
              <input
                type="text"
                placeholder="Ej. Genara Valdez"
                value={customClientName}
                onChange={(e) => setCustomClientName(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-[#121824]/60 p-3 text-xs text-white outline-none focus:border-emerald-500/50"
                required
              />
            </div>
          )}

          {/* ACTIVE CART ITEMS BAR */}
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-14 text-center bg-zinc-900/5 rounded-xl border border-zinc-900/30 flex flex-col items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-zinc-900/30 flex items-center justify-center mb-2.5 text-white">
                  <Receipt className="h-5 w-5" />
                </div>
                <span className="text-[10px] text-white font-black tracking-widest uppercase">VACÍO</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900/85 gap-2">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    {item.foto && (
                      <div className="h-7 w-7 rounded bg-zinc-950 border border-zinc-900 overflow-hidden shrink-0">
                        <img src={item.foto} alt={item.nombre} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-white text-[11px] truncate">{item.nombre}</h5>
                      <span className="text-[10px] text-white font-mono font-bold block mt-0.5">
                        RD$ {item.precio.toLocaleString('es-DO')} c/u
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center rounded-lg bg-zinc-950 border border-zinc-850 p-1">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQuantity(item.id)}
                        className="rounded-md p-1 hover:bg-zinc-900 text-white transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-white px-2 font-mono">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="rounded-md p-1 hover:bg-zinc-900 text-white transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-white hover:text-rose-500 p-1.5 transition-colors"
                      title="Quitar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-zinc-900 pt-3.5 space-y-3">
            
            {/* TOGGLES FOR VAT (ITBIS) AND SERVICE FEES (PROPINA) */}
            <div className="space-y-2.5">
              
              {/* ITBIS Toggle aligned right */}
              <div className="flex items-center justify-between py-1 border-b border-zinc-900/60">
                <span className="text-[10px] text-white font-bold uppercase tracking-wider font-sans">ITBIS (18%)</span>
                <button
                  type="button"
                  onClick={() => setApplyItbis(!applyItbis)}
                  className={`w-9 h-5 rounded-full transition-all duration-205 relative cursor-pointer ${
                    applyItbis ? 'bg-[#00a389]' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all duration-250 ${
                    applyItbis ? 'left-4.5' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* PROPINA input aligned right */}
              <div className="flex items-center justify-between py-1 border-b border-zinc-900/60">
                <span className="text-[10px] text-white font-bold uppercase tracking-wider font-sans">PROPINA</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={propina === 0 ? '' : propina}
                    onChange={(e) => setPropina(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="0"
                    className="w-12 text-center rounded bg-zinc-905 border border-zinc-800 text-[10px] text-white font-mono py-1 font-bold outline-none focus:border-[#00a389]"
                  />
                </div>
              </div>

            </div>

            {/* PAYMENT METHOD STRIP (ONLY IF NOT A QUOTATION) */}
            {!isQuotation && (
              <div className="space-y-2 pb-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-white font-mono">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Efectivo', 'Transferencia', 'Tarjeta'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setPaymentMethod(m); if (m !== 'Efectivo') setCashReceived(''); }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-[#00a389] text-white'
                          : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* CASH REGISTER MATH */}
                {paymentMethod === 'Efectivo' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                    <div>
                      <label className="block text-[9px] font-semibold text-white uppercase">Paga Con RD$</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Monto"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-850 px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-white uppercase">Cambio RD$</label>
                      <div className="w-full rounded-lg bg-zinc-950 p-1.5 text-center font-bold text-xs text-white font-mono border border-zinc-900/60">
                        RD$ {changeAmount.toLocaleString('es-DO')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BILL DETAILS TOTALS */}
            <div className="space-y-1 border-t border-zinc-900/60 pt-3 text-white font-mono text-[10px]">
              <div className="flex items-center justify-between">
                <span>SUBT:</span>
                <span className="text-white">RD$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ITBIS (18%):</span>
                <span className="text-white">RD$ {itbis.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>TOTAL ARTÍCULOS:</span>
                <span className="text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>

            {/* BIG TOTAL BLOCK FROM SCREENSHOT */}
            <div className="flex items-center justify-between pt-1 border-t border-dashed border-zinc-850">
              <span className="text-white font-black text-xs uppercase italic tracking-widest font-sans">
                TOTAL:
              </span>
              <span className="font-mono text-3xl font-black text-white tracking-tighter">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* ACTIONS: OUTSIDE BUTTONS FOR SUSPEND/CANCEL */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleParkCart}
                className="rounded-xl py-2 px-3 bg-[#131924] hover:bg-[#1c2436] text-white font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-zinc-850"
              >
                <Clock className="h-3.5 w-3.5 text-white" />
                <span>ESPERA</span>
              </button>
              
              <button
                type="button"
                onClick={handleClearCart}
                className="rounded-xl py-2 px-3 bg-[#131924]/50 hover:bg-rose-950/20 text-white hover:text-rose-400 font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-zinc-900/40"
              >
                <X className="h-3.5 w-3.5 text-white" />
                <span>CANCELAR</span>
              </button>
            </div>

            {/* CORE PAYMENT BUTTONS */}
            <div className="space-y-1.5 pt-2">
              <button
                type="submit"
                disabled={cart.length === 0}
                onClick={() => setIsQuotation(false)}
                className={`w-full rounded-xl py-3 font-black text-[11px] tracking-wide transition-all flex items-center justify-center gap-2 uppercase ${
                  cart.length === 0
                    ? 'bg-zinc-900/70 text-white/40 border border-zinc-850/40 cursor-not-allowed'
                    : 'bg-[#00a389] hover:bg-[#008c75] text-white cursor-pointer active:scale-[0.98]'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5 stroke-[3px]" />
                <span>COBRAR</span>
              </button>

              <button
                type="submit"
                disabled={cart.length === 0}
                onClick={() => { setIsQuotation(true); }}
                className={`w-full rounded-xl py-2.5 font-bold text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 uppercase ${
                  cart.length === 0
                    ? 'bg-zinc-900/50 text-white/30 border border-transparent cursor-not-allowed'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-white cursor-pointer active:scale-[0.98]'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-white" />
                <span>COTIZAR</span>
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* MODAL: PRISTINE THERMAL BILL RECEIPT */}
      {showReceiptModal && completedSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col items-center">
            
            {/* TICKET WRAPPER (STANDARDIZED THERMAL TYPE LAYOUT FOR BROWSER PRINT) */}
            <div className="w-full bg-white text-zinc-950 p-5 rounded-lg font-mono text-xs shadow-inner space-y-4 printable-section overflow-y-auto flex-1">
              
              {/* BRAND HEADER */}
              <div className="text-center space-y-1">
                <h4 className="font-sans font-black text-sm uppercase tracking-tight">{settings.nombreAcademia || 'NEW DANCE SYSTEM'}</h4>
                {settings.rnc && <p className="text-[10px] text-zinc-650">RNC: {settings.rnc}</p>}
                {settings.direccion && <p className="text-[10px] text-zinc-600 leading-tight">{settings.direccion}</p>}
                {settings.telefono && <p className="text-[10px] text-zinc-650">Tel: {settings.telefono}</p>}
                <div className="border-b border-dashed border-zinc-400 w-full pt-1" />
              </div>

              {/* TICKET METADATA */}
              <div className="space-y-1 text-[10px] text-zinc-700">
                <div className="flex justify-between">
                  <span>OPERACIÓN:</span>
                  <span className="font-bold">{completedSale.estado === 'Cotización' ? 'COTIZACIÓN' : 'VENTA DIRECTA'}</span>
                </div>
                <div className="flex justify-between">
                  <span>DOCUMENTO:</span>
                  <span className="font-bold">{completedSale.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA:</span>
                  <span>{completedSale.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="max-w-[150px] truncate font-bold uppercase">{completedSale.clienteNombre || 'Consumidor Final'}</span>
                </div>
                <div className="border-b border-dashed border-zinc-400 w-full pt-1" />
              </div>

              {/* PRODUCTS COLUMNS */}
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-zinc-600 grid grid-cols-12">
                  <span className="col-span-6 text-left">ARTÍCULO</span>
                  <span className="col-span-2 text-center">CANT.</span>
                  <span className="col-span-4 text-right">TOTAL (RD$)</span>
                </div>
                <div className="border-b border-zinc-200" />
                
                <div className="space-y-1.5">
                  {completedSale.items.map((it, index) => (
                    <div key={index} className="grid grid-cols-12 text-[10px]">
                      <span className="col-span-6 text-left block truncate uppercase">{it.productoNombre}</span>
                      <span className="col-span-2 text-center text-zinc-600 block">{it.cantidad}</span>
                      <span className="col-span-4 text-right font-bold block">{(it.precio * it.cantidad).toLocaleString('es-DO')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-b border-dashed border-zinc-400 w-full pt-1" />
              </div>

              {/* MATHEMATICAL BALANCE */}
              <div className="text-[11px] space-y-1 pl-12 text-zinc-900">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>RD$ {completedSale.subtotal.toLocaleString('es-DO')}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>ITBIS (18%):</span>
                  <span>RD$ {completedSale.itbis.toLocaleString('es-DO')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-zinc-350 pt-1 text-sm text-zinc-950">
                  <span>TOTAL:</span>
                  <span>RD$ {completedSale.total.toLocaleString('es-DO')}</span>
                </div>

                {completedSale.estado !== 'Cotización' && (
                  <div className="space-y-1 border-t border-dashed border-zinc-300 pt-1 text-[10px] text-zinc-600">
                    <div className="flex justify-between">
                      <span>MÉTODO:</span>
                      <span>{completedSale.metodoPago}</span>
                    </div>
                    {completedSale.pagadoCon !== undefined && (
                      <div className="flex justify-between">
                        <span>RECIBIDO:</span>
                        <span>RD$ {completedSale.pagadoCon.toLocaleString('es-DO')}</span>
                      </div>
                    )}
                    {completedSale.cambio !== undefined && (
                      <div className="flex justify-between font-bold text-zinc-900">
                        <span>SU CAMBIO:</span>
                        <span>RD$ {completedSale.cambio.toLocaleString('es-DO')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BOTTOM SLOGAN */}
              <div className="text-center pt-2 space-y-1.5">
                <div className="border-b border-dashed border-zinc-400 w-full" />
                <p className="text-[9px] text-zinc-600 leading-tight uppercase">
                  {settings.mensajeLargo || '¡Gracias por apoyar el arte y la danza en NEW DANCE SYSTEM!'}
                </p>
                <p className="text-[8px] text-zinc-400 font-sans tracking-widest mt-1">SISTEMA NEW DANCE SYSTEM POS - COMPILADO OK</p>
              </div>

            </div>

            {/* BUTTON CONTROLS */}
            <div className="w-full mt-5 shrink-0 flex items-center justify-between gap-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setShowReceiptModal(false); setCompletedSale(null); }}
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2.5 text-center hover:bg-zinc-850"
              >
                Cerrar Ventana
              </button>

              <button
                type="button"
                onClick={printTicket}
                className="flex-1 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4 stroke-[3px]" />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOR QUICK +COMÚN PRODUCT REGISTER */}
      {showCommonItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-2xl my-auto animate-fade-in text-xs text-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-[#00a389]" />
                Registrar Artículo Común Quick
              </h3>
              <button 
                onClick={() => setShowCommonItemModal(false)}
                className="rounded-lg p-1 text-zinc-450 hover:bg-zinc-900 hover:text-white"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCommonItemSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-450 mb-1">Concepto / Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Servicio de Adaptación o Bebida Extra"
                  value={commonItemName}
                  onChange={(e) => setCommonItemName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-stone-100 outline-none focus:border-[#00a389]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-450 mb-1">Precio Unitario (RD$)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej. 1500"
                  value={commonItemPrice}
                  onChange={(e) => setCommonItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-855 bg-zinc-900/60 p-2.5 text-stone-100 outline-none focus:border-[#00a389] font-mono"
                />
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowCommonItemModal(false)}
                  className="rounded-xl border border-zinc-850 px-4 py-2 text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2 bg-[#00a389] hover:bg-[#008c75] text-white transition-all font-black uppercase tracking-wider cursor-pointer"
                >
                  Agregar a Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
