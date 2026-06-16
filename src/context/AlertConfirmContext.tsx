/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, Info, Check, HelpCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ConfirmState {
  isOpen: boolean;
  message: string;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (value: boolean) => void;
  isDanger?: boolean;
}

interface AlertState {
  isOpen: boolean;
  message: string;
  title: string;
  resolve: () => void;
}

interface AlertConfirmContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (
    message: string, 
    options?: { title?: string; confirmLabel?: string; cancelLabel?: string; isDanger?: boolean }
  ) => Promise<boolean>;
}

const AlertConfirmContext = createContext<AlertConfirmContextType | undefined>(undefined);

export const useAlertConfirm = () => {
  const context = useContext(AlertConfirmContext);
  if (!context) {
    throw new Error('useAlertConfirm must be used within an AlertConfirmProvider');
  }
  return context;
};

export const AlertConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const showAlert = (message: string, title = 'Notificación') => {
    return new Promise<void>((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        title,
        resolve,
      });
    });
  };

  const showConfirm = (
    message: string,
    options?: { title?: string; confirmLabel?: string; cancelLabel?: string; isDanger?: boolean }
  ) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        title: options?.title || 'Confirmación',
        confirmLabel: options?.confirmLabel || 'Aceptar',
        cancelLabel: options?.cancelLabel || 'Cancelar',
        isDanger: options?.isDanger ?? true, // Default to true since most are deletions
        resolve,
      });
    });
  };

  const handleConfirmClose = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const handleAlertClose = () => {
    if (alertState) {
      alertState.resolve();
      setAlertState(null);
    }
  };

  return (
    <AlertConfirmContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* RENDER CUSTOM MODALS */}
      <AnimatePresence>
        {/* CONFIRMATION MODAL */}
        {confirmState && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirmClose(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/90"
            >
              {/* Top accent border bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${confirmState.isDanger ? 'bg-rose-500' : 'bg-gold-500'}`} />

              <div className="flex gap-4 items-start mt-2">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                  confirmState.isDanger 
                    ? 'border-rose-900/30 bg-rose-955/20 text-rose-500' 
                    : 'border-amber-900/30 bg-amber-955/20 text-gold-500'
                }`}>
                  {confirmState.isDanger ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <HelpCircle className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display text-base font-bold text-white tracking-tight">
                    {confirmState.title}
                  </h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    {confirmState.message}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirmClose(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
                >
                  {confirmState.cancelLabel}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => handleConfirmClose(true)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-lg ${
                    confirmState.isDanger
                      ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-950/20'
                      : 'bg-gold-500 hover:bg-gold-400 shadow-gold-950/20'
                  }`}
                >
                  {confirmState.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ALERT MODAL */}
        {alertState && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleAlertClose}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/90"
            >
              {/* Top gold design bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold-500" />

              <div className="flex gap-4 items-start mt-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-900/30 bg-gold-955/20 text-gold-500">
                  <Info className="h-5 w-5" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display text-base font-bold text-white tracking-tight">
                    {alertState.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                    {alertState.message}
                  </p>
                </div>
              </div>

              {/* Confirm / Continue button */}
              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  autoFocus
                  onClick={handleAlertClose}
                  className="rounded-xl bg-gold-500 hover:bg-gold-400 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-gold-950/20"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertConfirmContext.Provider>
  );
};
