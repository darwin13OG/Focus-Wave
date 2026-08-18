import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { ThemePalette } from '../types';

interface OfflineBannerProps {
  theme: ThemePalette;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ theme }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false);
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsDismissed(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      // Ping with cache-busting to check real internet connectivity
      await fetch('/manifest.webmanifest?ping=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
      if (navigator.onLine) {
        setIsOnline(true);
        setShowReconnectedToast(true);
        setTimeout(() => setShowReconnectedToast(false), 4000);
      }
    } catch {
      // Still offline
    } finally {
      setIsChecking(false);
    }
  };

  // Reconnected Toast
  if (showReconnectedToast) {
    return (
      <div
        id="online-reconnected-toast"
        className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/40 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium truncate">
            <span className="font-bold text-white">Conexión restablecida:</span> Todos los audios en línea y transmisiones están activos.
          </p>
        </div>
        <button
          onClick={() => setShowReconnectedToast(false)}
          className="p-1.5 text-emerald-400/70 hover:text-emerald-200 rounded-lg hover:bg-emerald-500/10 transition-colors"
          title="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Offline Notification Banner
  if (!isOnline && !isDismissed) {
    return (
      <div
        id="offline-status-banner"
        className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-xl shadow-amber-950/30 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <WifiOff className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Sin conexión a internet
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Modo Offline PWA Activo
                </span>
              </div>
              <p className="text-xs sm:text-xs text-amber-200/90 leading-relaxed">
                Focus Wave ha cargado el index y la pantalla principal correctamente. Puedes usar el <strong>Temporizador Pomodoro</strong>, los <strong>Ejercicios de Respiración</strong> y tu <strong>Lista de Tareas</strong> sin conexión. Los sonidos que ya se hayan reproducido o estén en la caché del dispositivo seguirán sonando; reconéctate para transmitir nuevos audios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCheckConnection}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all disabled:opacity-50"
              title="Comprobar conexión"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Comprobar</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-amber-400/70 hover:text-amber-200 rounded-lg hover:bg-amber-500/10 transition-colors"
              title="Ocultar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
