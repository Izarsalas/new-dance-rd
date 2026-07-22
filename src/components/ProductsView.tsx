/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  Edit3, 
  FolderPlus, 
  AlertCircle,
  Package,
  Layers,
  Check,
  X,
  Camera,
  Upload
} from 'lucide-react';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface ProductsViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  departments: string[];
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ProductsView({
  products,
  setProducts,
  departments,
  setDepartments
}: ProductsViewProps) {
  const { showAlert, showConfirm } = useAlertConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('Todos');

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product fields
  const [newCodigo, setNewCodigo] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newPrecio, setNewPrecio] = useState(0);
  const [newCosto, setNewCosto] = useState(0);
  const [newStock, setNewStock] = useState(10);
  const [newStockMinimo, setNewStockMinimo] = useState(3);
  const [newDept, setNewDept] = useState(departments[0] || 'Zapatos de Baile');
  const [newFoto, setNewFoto] = useState('');

  // New department field
  const [showAddDeptForm, setShowAddDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Add department handler
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDept = newDeptName.trim();
    if (!cleanDept) return;

    if (departments.map(d => d.toLowerCase()).includes(cleanDept.toLowerCase())) {
      showAlert('Esta categoría o departamento ya existe.', 'Categoría Duplicada');
      return;
    }

    const updatedDepts = [...departments, cleanDept];
    setDepartments(updatedDepts);
    localStorage.setItem('aura_billing_departments', JSON.stringify(updatedDepts));
    setNewDept(cleanDept);
    setNewDeptName('');
    setShowAddDeptForm(false);
    showAlert('La categoría se ha agregado exitosamente.', 'Éxito');
  };

  // Delete department handler
  const handleDeleteDept = async (deptName: string) => {
    const isUsed = products.some(p => p.departamento === deptName);
    if (isUsed) {
      showAlert('No se puede eliminar esta categoría porque hay productos activos asignados a ella.', 'Categoría en Uso');
      return;
    }

    const confirmed = await showConfirm(
      `¿Está seguro de que desea eliminar la categoría "${deptName}"?`,
      'Confirmar Eliminación'
    );
    if (confirmed) {
      const updatedDepts = departments.filter(d => d !== deptName);
      setDepartments(updatedDepts);
      localStorage.setItem('aura_billing_departments', JSON.stringify(updatedDepts));
      if (selectedDeptFilter === deptName) setSelectedDeptFilter('Todos');
      if (newDept === deptName) setNewDept(updatedDepts[0] || '');
    }
  };

  // Submit product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) {
      showAlert('Por favor escriba el nombre del producto.', 'Faltan Campos');
      return;
    }

    const minStockVal = Number(newStockMinimo) >= 0 ? Number(newStockMinimo) : 3;

    if (editingProduct) {
      // Edit mode
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            codigo: newCodigo.trim() || undefined,
            nombre: newNombre.trim(),
            precio: Number(newPrecio) || 0,
            costo: Number(newCosto) || 0,
            stock: Number(newStock) || 0,
            stockMinimo: minStockVal,
            departamento: newDept,
            foto: newFoto || undefined
          };
        }
        return p;
      });
      setProducts(updated);
      localStorage.setItem('aura_billing_products', JSON.stringify(updated));
      setEditingProduct(null);
      showAlert('Producto actualizado con éxito.', 'Completado');
    } else {
      // Create mode
      const newProduct: Product = {
        id: 'p' + (Date.now() + Math.floor(Math.random() * 100)),
        codigo: newCodigo.trim() || undefined,
        nombre: newNombre.trim(),
        precio: Number(newPrecio) || 0,
        costo: Number(newCosto) || 0,
        stock: Number(newStock) || 0,
        stockMinimo: minStockVal,
        departamento: newDept,
        inventarioActivo: true,
        foto: newFoto || undefined
      };

      const updated = [...products, newProduct];
      setProducts(updated);
      localStorage.setItem('aura_billing_products', JSON.stringify(updated));
      showAlert('Producto registrado en el inventario con éxito.', 'Completado');
    }

    resetForm();
  };

  const resetForm = () => {
    setNewCodigo('');
    setNewNombre('');
    setNewPrecio(0);
    setNewCosto(0);
    setNewStock(10);
    setNewStockMinimo(3);
    setNewDept(departments[0] || '');
    setNewFoto('');
    setShowAddModal(false);
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setNewCodigo(p.codigo || '');
    setNewNombre(p.nombre);
    setNewPrecio(p.precio);
    setNewCosto(p.costo || 0);
    setNewStock(p.stock);
    setNewStockMinimo(p.stockMinimo !== undefined ? p.stockMinimo : 3);
    setNewDept(p.departamento);
    setNewFoto(p.foto || '');
    setShowAddModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isJpg = file.type === 'image/jpeg' || 
                  file.name.toLowerCase().endsWith('.jpg') || 
                  file.name.toLowerCase().endsWith('.jpeg');

    if (!isJpg) {
      showAlert('Por favor seleccione una imagen en formato JPG o JPEG.', 'Formato Incorrecto');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showAlert('La imagen es demasiado grande. Seleccione una menor a 2MB para conservar espacio.', 'Imagen muy Grande');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewFoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProductClick = async (id: string, name: string) => {
    const confirmed = await showConfirm(
      `¿Está realmente seguro de que desea eliminar "${name}" del catálogo? Esta acción no se puede deshacer.`,
      'Eliminar Producto'
    );
    if (confirmed) {
      const nextProducts = products.filter(p => p.id !== id);
      setProducts(nextProducts);
      localStorage.setItem('aura_billing_products', JSON.stringify(nextProducts));
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          p.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDeptFilter === 'Todos' || p.departamento === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6" id="products-view-root">
      
      {/* CAT CONTAINER CONTROLS & HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/60">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="h-4 w-4 text-gold-500" />
            Catálogo de Productos y Danza
          </h2>
          <p className="text-xs text-zinc-300 mt-1">
            Administre los artículos que vende la academia (vestuario, calzado, bebidas, etc.) y asigne precios, stock y cantidad mínima de alerta.
          </p>
        </div>

        <button
          onClick={() => { setEditingProduct(null); resetForm(); setShowAddModal(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-gold-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* RECORDATORIO DE STOCK MÍNIMO / ALERTA DE AGOTAMIENTO */}
      {products.some(p => p.stock <= (p.stockMinimo !== undefined ? p.stockMinimo : 3)) && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg shadow-amber-950/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <span>⚠️ Alerta de Inventario: Productos por Agotarse</span>
                <span className="bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full font-mono text-[10px] font-black">
                  {products.filter(p => p.stock <= (p.stockMinimo !== undefined ? p.stockMinimo : 3)).length}
                </span>
              </h4>
              <p className="text-[11px] text-amber-200/90 mt-0.5">
                Existen productos que han alcanzado o caído por debajo de su <strong>cantidad mínima configurada</strong>. Se sugiere realizar reabastecimiento pronto.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/30 transition-all cursor-pointer shrink-0"
          >
            Ver Catálogo Completo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDE BAR: CATEGORIES (DEPARTMENTS) MANAGEMENT */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Layers className="h-3 w-3 text-gold-500" />
                Categorías ({departments.length})
              </span>
              <button
                onClick={() => setShowAddDeptForm(!showAddDeptForm)}
                className="text-[10px] font-black text-gold-500 hover:underline"
              >
                {showAddDeptForm ? 'Cerrar' : '+ Nueva'}
              </button>
            </div>

            {showAddDeptForm && (
              <form onSubmit={handleAddDept} className="space-y-2 p-2 bg-zinc-900/40 rounded-xl border border-zinc-850">
                <input
                  type="text"
                  placeholder="Ej. Accesorios, Bebidas"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-850 px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-gold-500/40"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gold-600 py-1.5 text-[10px] text-white font-bold hover:bg-gold-500 transition-colors"
                >
                  Agregar Categoría
                </button>
              </form>
            )}

            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedDeptFilter('Todos')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                  selectedDeptFilter === 'Todos' 
                    ? 'bg-zinc-900 text-white border-l-2 border-gold-550' 
                    : 'text-zinc-100 hover:bg-zinc-900/40 hover:text-white'
                }`}
              >
                <span>Mostrar Todas</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-150 px-1.5 py-0.5 rounded font-mono">{products.length}</span>
              </button>

              {departments.map((dept, i) => {
                const count = products.filter(p => p.departamento === dept).length;
                return (
                  <div 
                    key={i} 
                    className={`group w-full rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                      selectedDeptFilter === dept 
                        ? 'bg-zinc-900 text-white border-l-2 border-gold-550 pl-3 pr-2 py-1.5' 
                        : 'text-zinc-100 hover:bg-zinc-900/40 hover:text-white px-3 py-1.5'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedDeptFilter(dept)}
                      className="flex-1 text-left"
                    >
                      {dept}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-zinc-850 text-zinc-150 px-1.5 py-0.5 rounded font-mono">{count}</span>
                      {selectedDeptFilter === dept && count === 0 && (
                        <button
                          onClick={() => handleDeleteDept(dept)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-0.5 transition-opacity"
                          title="Eliminar categoría vacía"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN BODY: PRODUCTS TABLE */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* SEARCH CONTROLS */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-300" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o categoría en el catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-stone-100 placeholder-zinc-500 outline-none focus:border-gold-550 focus:ring-1 focus:ring-gold-550/25 animate-fade-in"
            />
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-200">
                    <th className="py-3 px-4 font-mono">Código</th>
                    <th className="py-3 px-4 font-mono">Nombre del Producto</th>
                    <th className="py-3 px-4 font-mono">Categoría</th>
                    <th className="py-3 px-4 font-mono text-right">Costo (Compra)</th>
                    <th className="py-3 px-4 font-mono text-right">Precio Venta</th>
                    <th className="py-3 px-4 font-mono text-center">Inv. Stock</th>
                    <th className="py-3 px-4 font-mono text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="h-8 w-8 text-zinc-400" />
                          <span className="text-xs text-zinc-200 font-medium">No se encontraron productos registrados en esta sección.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const minStock = p.stockMinimo !== undefined ? p.stockMinimo : 3;
                      const isLowStock = p.stock <= minStock;
                      return (
                        <tr key={p.id} className="hover:bg-zinc-900/10 transition-all">
                          {/* Code */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300 font-medium">
                            {p.codigo || <span className="text-zinc-500 italic">N/A</span>}
                          </td>

                          {/* Name */}
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                                {p.foto ? (
                                  <img src={p.foto} alt={p.nombre} className="h-full w-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                                ) : (
                                  <Package className="h-4 w-4 text-zinc-400" />
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-white block text-xs">{p.nombre}</span>
                                {isLowStock && (
                                  <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.2 rounded inline-block mt-0.5">
                                    ⚠️ Stock Bajo (Mín: {minStock})
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category Tag */}
                          <td className="py-3.5 px-4 text-xs font-medium text-stone-200">
                            <span className="bg-zinc-900 border border-zinc-850 text-gold-550 px-2 py-0.5 rounded text-[10px] font-bold">
                              {p.departamento}
                            </span>
                          </td>

                          {/* Cost */}
                          <td className="py-3.5 px-4 font-mono text-right text-xs text-zinc-300 font-semibold">
                            RD$ {(p.costo || 0).toLocaleString('es-DO')}
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 font-mono text-right text-xs font-bold text-white">
                            RD$ {p.precio.toLocaleString('es-DO')}
                          </td>

                          {/* Stock */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`inline-flex items-center gap-1 rounded font-mono px-2 py-0.5 font-bold text-[11px] ${
                                p.stock === 0
                                  ? 'bg-rose-950/30 text-rose-400 border border-rose-900/40'
                                  : isLowStock 
                                    ? 'bg-amber-950/30 text-amber-400 border border-amber-900/40' 
                                    : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20'
                              }`}>
                                {p.stock} pzas
                                {isLowStock && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                                Mín: {minStock} pzas
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => handleEditClick(p)}
                                className="text-zinc-200 hover:text-gold-500 hover:bg-zinc-900/60 px-2 py-1 rounded-lg flex items-center gap-1 transition-all text-[11px] font-semibold"
                                title="Editar producto"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProductClick(p.id, p.nombre)}
                                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-lg flex items-center gap-1 transition-all text-[11px] font-semibold"
                                title="Eliminar producto"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Quitar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* CREATE / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl gold-glow-intense my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 shrink-0">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-gold-500" />
                {editingProduct ? 'Editar Producto del Catálogo' : 'Añadir Nuevo Producto'}
              </h3>
              <button 
                onClick={resetForm}
                className="rounded-lg p-1 text-zinc-450 hover:bg-zinc-900 hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre o Descripción del Artículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Zapatos de Salsa Pro - Taco 5.5"
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              {/* PHOTO JPG UPLOADER */}
              <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/80">
                <label className="block text-xs font-semibold text-zinc-450 mb-1.5 uppercase tracking-wide font-mono">Foto de Portada (JPG)</label>
                <div className="flex items-center gap-3.5">
                  {newFoto ? (
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      <img src={newFoto} alt="Previsualización de producto" className="h-full w-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setNewFoto('')}
                        className="absolute -top-1 -right-1 rounded-full bg-rose-600 p-0.5 text-white hover:bg-rose-500 transition-colors shadow-md"
                        title="Eliminar imagen"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-xl border-2 border-dashed border-zinc-850 flex flex-col items-center justify-center bg-zinc-950 text-zinc-650 shrink-0 select-none">
                      <Camera className="h-4 w-4" />
                      <span className="text-[7.5px] font-bold text-zinc-600 mt-1 font-sans">Sin Foto</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600/10 hover:bg-gold-600/20 border border-gold-500/30 px-3.5 py-2 text-xs font-bold text-gold-450 hover:text-gold-400 cursor-pointer w-full text-center transition-all">
                      <Upload className="h-3.5 w-3.5 animate-pulse" />
                      <span>{newFoto ? 'Cambiar Foto' : 'Cargar Foto .JPG'}</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-[9px] text-zinc-500 mt-1.5 leading-normal">
                      Cargue fotos en formato **JPG** o **JPEG** (máximo 2MB).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Categoría / Departamento</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-[#130f06] p-2.5 text-xs text-stone-100 outline-none focus:border-gold-500/50 cursor-pointer font-semibold"
                  >
                    {departments.map((d, idx) => (
                      <option key={idx} value={d} className="bg-zinc-950 text-white">{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Código de Barra o Ref. (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. REF-901"
                    value={newCodigo}
                    onChange={(e) => setNewCodigo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-xs text-stone-100 outline-none focus:border-gold-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Costo RD$ *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newCosto}
                    onChange={(e) => setNewCosto(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Precio Venta *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newPrecio}
                    onChange={(e) => setNewPrecio(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Stock Actual *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 p-2.5 text-sm text-stone-100 outline-none focus:border-gold-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center justify-between">
                    <span>Stock Mínimo *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Ej. 3"
                    value={newStockMinimo}
                    onChange={(e) => setNewStockMinimo(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-amber-900/40 bg-zinc-900/60 p-2.5 text-sm text-amber-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-zinc-850 px-4 py-2.5 text-zinc-300 hover:bg-zinc-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-white transition-all font-black"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
