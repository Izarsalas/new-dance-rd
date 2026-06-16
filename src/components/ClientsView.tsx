/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alumno, Sale } from '../types';
import { 
  Users, 
  Search, 
  ShoppingBag, 
  Phone, 
  Tag, 
  DollarSign, 
  UserCheck, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface ClientsViewProps {
  alumnos: Alumno[];
  sales: Sale[];
}

export default function ClientsView({ alumnos, sales }: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract custom clients from actual completed sales who aren't registered alumnos
  const completedSales = sales.filter(s => s.estado === 'Completado');
  
  const customClientsFromSales = Array.from(
    new Set(
      completedSales
        .filter(s => s.clienteId === 'custom' || s.clienteId === 'default')
        .map(s => s.clienteNombre || 'Consumidor Final')
    )
  ).map((name, i) => ({
    id: `custom-cli-${i}`,
    nombre: name,
    esAlumno: false,
    contacto: 'Venta Directa de Caja',
    ritmo: '-'
  }));

  // Build the list of alumnos to map
  const alumnosClients = alumnos.map(a => ({
    id: a.id,
    nombre: a.nombre,
    esAlumno: true,
    contacto: a.contacto || 'Sin contacto',
    ritmo: a.ritmo
  }));

  // Combine both sources
  const combinedClients = [...alumnosClients, ...customClientsFromSales];

  // Map spending and transactions metrics
  const clientsWithMetrics = combinedClients.map(c => {
    // Math matching
    const matchingSales = completedSales.filter(s => {
      if (c.esAlumno) {
        return s.clienteId === c.id;
      } else {
        return s.clienteNombre === c.nombre && (s.clienteId === 'custom' || s.clienteId === 'default');
      }
    });

    const totalSpent = matchingSales.reduce((sum, s) => sum + s.total, 0);
    const purchasesCount = matchingSales.length;

    return {
      ...c,
      totalSpent,
      purchasesCount,
      lastPurchaseDate: matchingSales.length > 0 ? matchingSales[matchingSales.length - 1].fecha : null
    };
  });

  // Filter clients
  const filteredClients = clientsWithMetrics.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.ritmo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="clients-view-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/60">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500 animate-pulse" />
            Historial de Clientes y Consumo Aura
          </h2>
          <p className="text-xs text-zinc-450 mt-1">
            Gestione historiales de compras, identifique a sus dancistas con mayor nivel de facturación y consulte sus preferencias registradas.
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-650" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-900 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-stone-200 outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* CORE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/20 py-20 text-center text-xs text-zinc-500">
            <AlertCircle className="h-8 w-8 text-zinc-800 mx-auto mb-2" />
            <span>No se encontraron clientes que coincidan con la búsqueda.</span>
          </div>
        ) : (
          filteredClients.map((client) => {
            return (
              <div 
                key={client.id}
                className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 space-y-4 hover:border-zinc-800/80 transition-all flex flex-col justify-between"
              >
                {/* Client header information */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      client.esAlumno 
                        ? 'bg-gold-550/10 border-gold-500/10 text-gold-550' 
                        : 'bg-zinc-900 border-zinc-850 text-zinc-400'
                    }`}>
                      {client.esAlumno ? 'Dancista Activo' : 'Consumidor Casual'}
                    </span>

                    {client.lastPurchaseDate && (
                      <span className="text-[9px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock className="h-2.5 w-2.5 text-zinc-600" />
                        U. Compra: {client.lastPurchaseDate}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm tracking-tight">{client.nombre}</h3>
                  
                  {client.esAlumno && (
                    <span className="text-[10px] text-zinc-450 block font-semibold">
                      Ritmo Principal: <span className="text-white">{client.ritmo}</span>
                    </span>
                  )}
                </div>

                {/* Analytical breakdown */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-900/15 p-3 rounded-xl border border-zinc-905">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block font-mono">Compras en POS</span>
                    <span className="text-xs font-mono font-black text-white flex items-center gap-1 mt-0.5">
                      <ShoppingBag className="h-3 w-3 text-zinc-405" />
                      {client.purchasesCount} facturas
                    </span>
                  </div>

                  <div className="border-l border-zinc-900/60 pl-3">
                    <span className="text-[9px] text-zinc-500 uppercase block font-mono">Consumo Total</span>
                    <span className="text-xs font-mono font-black text-emerald-400 mt-0.5 block">
                      RD$ {client.totalSpent.toLocaleString('es-DO')}
                    </span>
                  </div>
                </div>

                {/* Subinfo */}
                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-zinc-650" />
                  <span>Contacto:</span>
                  <span className="text-zinc-400 font-medium truncate max-w-[200px]">{client.contacto}</span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
