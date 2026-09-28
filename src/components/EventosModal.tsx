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
  const eventList = eventos || events || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvento, setSelectedEvento] = useState<EventoRefugio | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'Evento Actual' | 'Próximamente'>('Evento Actual');

  // Separar en Eventos Actuales vs Próximos
  const eventosActuales = eventList.filter((e) => e.tipo === 'Evento Actual');
  const eventosProximos = eventList.filter((e) => e.tipo === 'Próximamente');

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

  const activeCarouselEvent = eventList[currentIndex] || eventList[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Comunidad y Encuentros</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900">
          Eventos y Actividades DogHouse
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Participa en nuestras ferias de adopción al aire libre, jornadas de esterilización a bajo costo y caminatas solidarias. Haz clic en cualquier evento para ver el detalle interactivo.
        </p>
      </div>

      {/* CARRUSEL INTERACTIVO */}
      {eventos.length > 0 && (
        <div className="relative bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[440px]">
            
            {/* Foto destacada */}
            <div className="lg:col-span-7 relative overflow-hidden bg-stone-900">
              <img
                src={activeCarouselEvent.foto_url}
                alt={activeCarouselEvent.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[260px] lg:min-h-[440px]"
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
                  <span>Ver Información Completa (Modal)</span>
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

      {/* LISTA COMPLETA DE EVENTOS EN GRILLA */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-stone-900">Todos los Eventos Programados</h3>
          <span className="text-xs font-semibold text-stone-500">{eventList.length} eventos registrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {eventList.map((ev) => (
            <div
              key={ev.id}
              onClick={() => openModal(ev)}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={ev.foto_url}
                    alt={ev.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      ev.tipo === 'Evento Actual' ? 'bg-amber-600 text-white' : 'bg-stone-900/90 text-white'
                    }`}>
                      {ev.tipo}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ev.fecha}</span>
                  </div>
                  <h4 className="font-extrabold text-base text-stone-900 leading-snug group-hover:text-amber-600 transition-colors">
                    {ev.titulo}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {ev.descripcion_corta}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate max-w-[170px]">{ev.lugar}</span>
                </span>
                <span className="font-bold text-amber-600 group-hover:underline">Detalles &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CON INFORMACIÓN COMPLETA DIVIDIDA EN: "EVENTO ACTUAL" Y "PRÓXIMAMENTE" */}
      {selectedEvento && (
        <div 
          id="modal-evento-detalle"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header Tabs: Evento Actual vs Próximamente */}
            <div className="bg-stone-900 text-white p-6 rounded-t-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500 px-2.5 py-0.5 rounded-full text-white">
                    {selectedEvento.tipo}
                  </span>
                  <span className="text-xs text-stone-400">DogHouse Eventos Oficiales</span>
                </div>
                <button
                  onClick={() => setSelectedEvento(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Cerrar modal de evento"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pestañas de Navegación dentro del Modal */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                <button
                  onClick={() => {
                    setActiveModalTab('Evento Actual');
                    if (eventosActuales.length > 0) setSelectedEvento(eventosActuales[0]);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeModalTab === 'Evento Actual'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <span>1. Evento Actual ({eventosActuales.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModalTab('Próximamente');
                    if (eventosProximos.length > 0) setSelectedEvento(eventosProximos[0]);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeModalTab === 'Próximamente'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <span>2. Próximamente ({eventosProximos.length})</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src={selectedEvento.foto_url}
                  alt={selectedEvento.titulo}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
                  {selectedEvento.titulo}
                </h3>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs">
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

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-stone-900">Descripción Completa:</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                  {selectedEvento.descripcion_completa}
                </p>
              </div>

              {selectedEvento.requisitos && selectedEvento.requisitos.length > 0 && (
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                    Requisitos y Recomendaciones para Asistentes:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {selectedEvento.requisitos.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const textToShare = `${selectedEvento.titulo} - Refugio DogHouse\nFecha: ${selectedEvento.fecha}\nLugar: ${selectedEvento.lugar}`;
                    navigator.clipboard.writeText(textToShare);
                    onShowToast('info', 'Enlace Copiado', 'Información del evento copiada al portapapeles.');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir Evento</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onShowToast('success', 'Asistencia Confirmada', `Te esperamos en: ${selectedEvento.titulo}`);
                      setSelectedEvento(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Confirmar Mi Asistencia
                  </button>
                  <button
                    onClick={() => setSelectedEvento(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
