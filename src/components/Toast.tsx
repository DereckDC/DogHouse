import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

export interface ToastNotification {
  tipo: 'success' | 'info' | 'error';
  titulo: string;
  mensaje: string;
}

interface SingleToastProps {
  toast: ToastNotification | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<SingleToastProps> = ({ toast, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isSuccess = toast.tipo === 'success';
  const isError = toast.tipo === 'error';
  const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full px-4 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
            : isError
            ? 'bg-rose-50/95 border-rose-300 text-rose-950'
            : 'bg-amber-50/95 border-amber-300 text-amber-950'
        }`}
      >
        <Icon
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isSuccess ? 'text-emerald-600' : isError ? 'text-rose-600' : 'text-amber-600'
          }`}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm leading-tight">{toast.titulo}</h4>
          <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{toast.mensaje}</p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 p-0.5 rounded-lg transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.tipo === 'success';
        const isError = toast.tipo === 'error';
        const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
                : isError
                ? 'bg-rose-50/95 border-rose-200 text-rose-950'
                : 'bg-amber-50/95 border-amber-200 text-amber-950'
            }`}
          >
            <Icon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isSuccess ? 'text-emerald-600' : isError ? 'text-rose-600' : 'text-amber-600'
              }`}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight">{toast.titulo}</h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{toast.mensaje}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-stone-400 hover:text-stone-600 p-0.5 rounded transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
