import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Phone, 
  Upload, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  MessageCircle,
  X,
  Sparkles,
  Filter
} from 'lucide-react';
import { PerroPerdidoReporte } from '../types';
import { LostDogsService } from '../lib/supabase';

interface PerrosPerdidosProps {
  reportes?: PerroPerdidoReporte[];
  reports?: PerroPerdidoReporte[];
  onShowToast: (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => void;
  onReloadReports?: () => void;
}

export const PerrosPerdidos: React.FC<PerrosPerdidosProps> = ({ 
  reportes, 
  reports, 
  onShowToast,
  onReloadReports 
}) => {
  const reportList = reportes || reports || [];

  // Filtros en tiempo real requeridos: Filtro por Nombre y Filtro por Fecha
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Modal para nuevo reporte
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulario de Reporte: Nombre, Fecha en que se perdió, Imagen, Ubicación de última vez (enlace a Maps) e Información relevante
  const [reportForm, setReportForm] = useState({
    nombre_perro: '',
    fecha_perdido: new Date().toISOString().split('T')[0],
    foto_url: '',
    ubicacion_ultima_vez: '',
    maps_url: '',
    informacion_relevante: '',
    contacto_nombre: '',
    contacto_telefono: '',
    recompensa: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Filtrado reactivo estricto
  const filteredReports = reportList.filter((rep) => {
    const matchesName = rep.nombre_perro.toLowerCase().includes(filterName.toLowerCase()) ||
      rep.ubicacion_ultima_vez.toLowerCase().includes(filterName.toLowerCase());
    
    const matchesDate = !filterDate || rep.fecha_perdido === filterDate;
    const matchesStatus = filterStatus === 'Todos' || rep.estado === filterStatus;

    return matchesName && matchesDate && matchesStatus;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setReportForm((prev) => ({ ...prev, foto_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportForm.nombre_perro.trim() || !reportForm.fecha_perdido || !reportForm.ubicacion_ultima_vez.trim() || !reportForm.contacto_telefono.trim()) {
      onShowToast('error', 'Campos Incompletos', 'Por favor llena los campos requeridos para publicar la alerta.');
      return;
    }

    setLoading(true);

    try {
      await LostDogsService.create({
        nombre_perro: reportForm.nombre_perro,
        fecha_perdido: reportForm.fecha_perdido,
        foto_url: reportForm.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        ubicacion_ultima_vez: reportForm.ubicacion_ultima_vez,
        maps_url: reportForm.maps_url || (reportForm.ubicacion_ultima_vez ? `https://maps.google.com/?q=${encodeURIComponent(reportForm.ubicacion_ultima_vez + ' Ecuador')}` : undefined),
        informacion_relevante: reportForm.informacion_relevante,
        contacto_nombre: reportForm.contacto_nombre,
        contacto_telefono: reportForm.contacto_telefono,
        recompensa: reportForm.recompensa,
        estado: 'Buscando',
      });

      onShowToast('success', '¡Alerta Publicada!', `El reporte de ${reportForm.nombre_perro} ya está visible para toda la comunidad.`);
      setIsReportModalOpen(false);
      setImagePreview(null);
      setReportForm({
        nombre_perro: '',
        fecha_perdido: new Date().toISOString().split('T')[0],
        foto_url: '',
        ubicacion_ultima_vez: '',
        maps_url: '',
        informacion_relevante: '',
        contacto_nombre: '',
        contacto_telefono: '',
        recompensa: '',
      });
    } catch (err) {
      console.error(err);
      onShowToast('error', 'Error', 'No se pudo guardar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-orange-500/10 p-6 sm:p-8 rounded-3xl border border-rose-200/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
            Perros Perdidos y Encontrados
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Publica alertas inmediatas si extraviaste a tu mascota o si viste a un perro perdido en las calles de tu sector. Nuestra comunidad y voluntarios ayudan a difundir.
          </p>
        </div>

        <button
          id="btn-open-report-modal"
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Reportar Perro Perdido</span>
        </button>
      </div>

      {/* SISTEMA DE FILTROS INTERACTIVOS EN TIEMPO REAL: FILTRO POR NOMBRE Y FILTRO POR FECHA */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Filter className="w-4 h-4 text-amber-600" />
            <span>Filtros de Búsqueda en Tiempo Real</span>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {filteredReports.length} reportes encontrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. FILTRO POR NOMBRE */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Filtro por Nombre o Lugar
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ej. Toby, Bruno, La Floresta..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* 2. FILTRO POR FECHA */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Filtro por Fecha en que se perdió
            </label>
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Estado del Caso
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Buscando">Actualmente Buscando</option>
              <option value="Reunido con familia">Reunido con familia (Éxito)</option>
            </select>
          </div>
        </div>

        {(filterName || filterDate || filterStatus !== 'Todos') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setFilterName('');
                setFilterDate('');
                setFilterStatus('Todos');
              }}
              className="text-xs text-amber-600 hover:text-amber-700 underline font-semibold"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* GRILLA DE REPORTES */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-3">
          <AlertTriangle className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-bold text-stone-800 text-base">No hay reportes que coincidan</h4>
          <p className="text-xs text-stone-500">
            Intenta borrar los filtros de fecha o nombre para ver todos los reportes activos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                item.estado === 'Reunido con familia'
                  ? 'border-emerald-200 opacity-80'
                  : 'border-stone-200'
              }`}
            >
              <div>
                <div className="relative h-60 bg-stone-100 overflow-hidden">
                  <img
                    src={item.foto_url}
                    alt={item.nombre_perro}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      item.estado === 'Buscando'
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {item.estado === 'Buscando' ? '🚨 Se busca' : '🎉 ¡Reunido con familia!'}
                    </span>
                    {item.recompensa && item.estado === 'Buscando' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-xs">
                        Recompensa: {item.recompensa}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg">
                    Perdido el: <strong>{item.fecha_perdido}</strong>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-stone-900">{item.nombre_perro}</h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span><strong>Visto por última vez:</strong> {item.ubicacion_ultima_vez}</span>
                        {item.maps_url && (
                          <a
                            href={item.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 mt-0.5"
                          >
                            <span>Abrir en Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-700">
                    <span className="font-bold text-stone-900 block mb-0.5">Información relevante:</span>
                    <p className="leading-relaxed">{item.informacion_relevante}</p>
                  </div>
                </div>
              </div>

              {/* Botón de Contacto Directo */}
              <div className="p-5 pt-0">
                <a
                  href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(item.contacto_telefono.replace(/\D/g, ''))}&text=${encodeURIComponent(`Hola ${item.contacto_nombre}, vi tu reporte sobre ${item.nombre_perro} en la plataforma de DogHouse.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                    item.estado === 'Buscando'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar a {item.contacto_nombre} ({item.contacto_telefono})</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE PUBLICACIÓN DE REPORTE */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-rose-600 to-amber-600 p-6 text-white rounded-t-3xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded text-white">
                  Formulario Comunitario
                </span>
                <h3 className="text-2xl font-black mt-1">Reportar Perro Perdido</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre del Perro <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre_perro"
                    value={reportForm.nombre_perro}
                    onChange={handleFormChange}
                    placeholder="Ej. Toby"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha en que se perdió <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_perdido"
                    value={reportForm.fecha_perdido}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Imagen del Perro */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Foto del Perro (Subir archivo o pegar URL)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 cursor-pointer text-xs font-bold text-stone-700 flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-stone-400">o enlace web:</span>
                  <input
                    type="url"
                    name="foto_url"
                    value={reportForm.foto_url}
                    onChange={handleFormChange}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="flex-1 w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                {imagePreview && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Ubicación Exacta con Maps y Sector de Referencia */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Enlace de Google Maps (Ubicación exacta de pérdida)
                  </label>
                  <input
                    type="url"
                    name="maps_url"
                    value={reportForm.maps_url}
                    onChange={handleFormChange}
                    placeholder="https://maps.app.goo.gl/... o https://maps.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    📍 Este enlace de Google Maps determinará la ubicación exacta del mapa donde se extravió el perrito.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Sector / Zona (Solo para referencia descriptiva) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ubicacion_ultima_vez"
                    value={reportForm.ubicacion_ultima_vez}
                    onChange={handleFormChange}
                    placeholder="Ej. Sector Chipipe, cerca del malecón, Salinas (Referencia)"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Texto de referencia rápida visible en la tarjeta.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Información Relevante (Señas particulares, collar, carácter) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="informacion_relevante"
                  rows={3}
                  value={reportForm.informacion_relevante}
                  onChange={handleFormChange}
                  placeholder="Ej. Raza mestiza, color caramelo con pecho blanco. Llevaba collar rojo. Responde al nombre de Toby y es temeroso a los truenos..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre del Dueño/Contacto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contacto_nombre"
                    value={reportForm.contacto_nombre}
                    onChange={handleFormChange}
                    placeholder="Ej. Andrea"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Teléfono / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contacto_telefono"
                    value={reportForm.contacto_telefono}
                    onChange={handleFormChange}
                    placeholder="Ej. 0998765432"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Recompensa (Opcional)
                  </label>
                  <input
                    type="text"
                    name="recompensa"
                    value={reportForm.recompensa}
                    onChange={handleFormChange}
                    placeholder="Ej. $100 USD / Gratificación"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Publicando...' : 'Publicar Alerta'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
