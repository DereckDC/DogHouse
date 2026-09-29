import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  Tag, 
  Info,
  CalendarCheck
} from 'lucide-react';
import { EventoRefugio } from '../types';

interface EventosModalProps {
  eventos?: EventoRefugio[];
  events?: EventoRefugio[];
  onShowToast: (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => void;
}

export const EventosModal: React.FC<EventosModalProps> = ({ eventos, events, onShowToast }) => {
  const rawList = eventos || events || [];
  
  // Separar en Eventos Actuales vs Próximos
  const eventosActuales = rawList.filter((e) => e.tipo === 'Evento Actual');
  const eventosProximos = rawList.filter((e) => e.tipo === 'Próximamente');

  // Ordenar lista para que los eventos actuales sean los primeros por defecto en el contenedor principal
  const eventList = [...eventosActuales, ...eventosProximos];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvento, setSelectedEvento] = useState<EventoRefugio | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'Evento Actual' | 'Próximamente'>('Evento Actual');

  const handleNext = () => {
    if (eventList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % eventList.length);
  };

  const handlePrev = () => {
    if (eventList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + eventList.length) % eventList.length);
  };

  const openModal = (evento: EventoRefugio) => {
    setSelectedEvento(evento);
    setActiveModalTab(evento.tipo);
  };

  const activeCarouselEvent = eventList[currentIndex] || eventosActuales[0] || eventList[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900">
          Eventos y Actividades DogHouse
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Participa en nuestras ferias de adopción al aire libre, jornadas de esterilización a bajo costo y caminatas solidarias. Haz clic en cualquier evento para ver el detalle interactivo.
        </p>
      </div>

      {/* CARRUSEL DESTACADO */}
      {activeCarouselEvent && (
        <div className="relative bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[440px]">
            {/* Foto destacada */}
            <div className="lg:col-span-7 relative overflow-hidden bg-stone-900 h-64 sm:h-80 lg:h-full">
              <img
                src={activeCarouselEvent.foto_url}
                alt={activeCarouselEvent.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                  activeCarouselEvent.tipo === 'Evento Actual'
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-900/90 text-amber-300'
                }`}>
                  {activeCarouselEvent.tipo}
                </span>
              </div>
            </div>

            {/* Info y llamada a acción */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5 text-xs text-stone-500">
                  <div className="flex items-center gap-2 text-amber-700 font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>{activeCarouselEvent.fecha}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>{activeCarouselEvent.hora}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-400" />
                    <span>{activeCarouselEvent.lugar}</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug">
                  {activeCarouselEvent.titulo}
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                  {activeCarouselEvent.descripcion_corta}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-stone-100">
                <button
                  onClick={() => openModal(activeCarouselEvent)}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Ver Información Completa</span>
                </button>

                {/* Controles del Carrusel */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    {eventList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          currentIndex === idx ? 'w-6 bg-amber-600' : 'w-2 bg-stone-300'
                        }`}
                        aria-label={`Ir al evento ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors"
                      aria-label="Evento anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors"
                      aria-label="Evento siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. SECCIÓN: EVENTOS ACTUALES (SIEMPRE ARRIBA) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xl font-black text-stone-900">Eventos Actuales</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            {eventosActuales.length} en curso / activo
          </span>
        </div>

        {eventosActuales.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            No hay eventos marcados como evento actual en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosActuales.map((ev) => (
              <div
                key={ev.id}
                onClick={() => openModal(ev)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[380px] group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100 flex-shrink-0">
                    <img
                      src={ev.foto_url}
                      alt={ev.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                        Evento Actual
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.fecha}</span>
                    </div>
                    <h4 className="font-extrabold text-base text-stone-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-1">
                      {ev.titulo}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {ev.descripcion_corta}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs mt-auto">
                  <span className="text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">{ev.lugar}</span>
                  </span>
                  <span className="font-bold text-amber-600 group-hover:underline flex-shrink-0">Detalles &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. SECCIÓN: PRÓXIMOS EVENTOS (ABAJO) */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <h3 className="text-xl font-black text-stone-900">Próximos Eventos</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {eventosProximos.length} programados
          </span>
        </div>

        {eventosProximos.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            No hay eventos futuros programados por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosProximos.map((ev) => (
              <div
                key={ev.id}
                onClick={() => openModal(ev)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[380px] group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100 flex-shrink-0">
                    <img
                      src={ev.foto_url}
                      alt={ev.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-900/90 text-white shadow-xs">
                        Próximamente
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.fecha}</span>
                    </div>
                    <h4 className="font-extrabold text-base text-stone-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-1">
                      {ev.titulo}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {ev.descripcion_corta}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs mt-auto">
                  <span className="text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">{ev.lugar}</span>
                  </span>
                  <span className="font-bold text-amber-600 group-hover:underline flex-shrink-0">Detalles &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CON DIMENSIONES FIJAS Y ESTABLES */}
      {selectedEvento && (
        <div 
          id="modal-evento-detalle"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-5 rounded-t-3xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                  selectedEvento.tipo === 'Evento Actual' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {selectedEvento.tipo}
                </span>
                <span className="text-xs text-stone-300">Actividades DogHouse</span>
              </div>
              <button
                onClick={() => setSelectedEvento(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Cerrar modal de evento"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body with Fixed Dimension elements */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                <img
                  src={selectedEvento.foto_url}
                  alt={selectedEvento.titulo}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  {selectedEvento.titulo}
                </h3>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">Fecha</span>
                    <span className="font-bold text-stone-900 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {selectedEvento.fecha}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">Horario</span>
                    <span className="font-bold text-stone-900 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {selectedEvento.hora}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">Lugar / Sede</span>
                    <span className="font-bold text-stone-900 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {selectedEvento.lugar}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700">Descripción:</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                  {selectedEvento.descripcion_completa || selectedEvento.descripcion_corta}
                </p>
              </div>

              {selectedEvento.requisitos && selectedEvento.requisitos.length > 0 && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                    Requisitos para Asistentes:
                  </h4>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {selectedEvento.requisitos.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Fixed Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  const textToShare = `${selectedEvento.titulo} - Refugio DogHouse\nFecha: ${selectedEvento.fecha}\nLugar: ${selectedEvento.lugar}`;
                  navigator.clipboard.writeText(textToShare);
                  onShowToast('info', 'Enlace Copiado', 'Información del evento copiada al portapapeles.');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 hover:bg-white text-stone-700 text-xs font-bold transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onShowToast('success', 'Asistencia Confirmada', `Te esperamos en: ${selectedEvento.titulo}`);
                    setSelectedEvento(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Confirmar Asistencia
                </button>
                <button
                  onClick={() => setSelectedEvento(null)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
