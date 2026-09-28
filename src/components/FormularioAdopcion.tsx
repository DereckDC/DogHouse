import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  Dog, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Perro, AdopcionFormValues } from '../types';
import { buildWhatsAppAdopcionUrl, SHELTER_LOCATION, SHELTER_DELIVERY_POLICY } from '../lib/whatsapp';
import { SubmissionsService } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface FormularioAdopcionProps {
  perro: Perro;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

export const ECUADOR_PROVINCIAS = [
  'Santa Elena', 'Guayas', 'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
  'Esmeraldas', 'Galápagos', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí',
  'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
  'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
];

export const FormularioAdopcion: React.FC<FormularioAdopcionProps> = ({
  perro,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AdopcionFormValues>({
    perro_id: perro.id,
    perro_nombre: perro.nombre,
    nombre: '',
    apellido: '',
    edad: '',
    provincia: 'Santa Elena',
    canton: 'Salinas',
    telefono: '',
    email: '',
    vivienda_tipo: 'Casa propia',
    tiene_otras_mascotas: false,
    motivo: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación obligatoria requerida: Nombre, Apellido, Edad, Provincia, Cantón
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.edad || !formData.provincia || !formData.canton.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (Number(formData.edad) < 18) {
      setErrorMsg('El titular de la postulación de adopción debe ser mayor de 18 años.');
      return;
    }

    if (!formData.telefono.trim()) {
      setErrorMsg('Por favor ingresa un número de teléfono para poder contactarte.');
      return;
    }

    setLoading(true);

    try {
      /**
       * ==========================================================
       * 1. INSERCIÓN EN LA BASE DE DATOS DE SUPABASE
       * ==========================================================
       * Llamada oficial equivalente:
       * const { data, error } = await supabase
       *   .from('solicitudes_adopcion')
       *   .insert([{
       *      perro_id: formData.perro_id,
       *      perro_nombre: formData.perro_nombre,
       *      nombre: formData.nombre,
       *      apellido: formData.apellido,
       *      edad: Number(formData.edad),
       *      provincia: formData.provincia,
       *      canton: formData.canton,
       *      telefono: formData.telefono,
       *      email: formData.email,
       *      vivienda_tipo: formData.vivienda_tipo,
       *      tiene_otras_mascotas: formData.tiene_otras_mascotas,
       *      motivo: formData.motivo
       *   }]);
       */
      await SubmissionsService.saveAdopcion(formData);

      /**
       * ==========================================================
       * 2. GENERACIÓN AUTOMÁTICA DE URL DE WHATSAPP
       * ==========================================================
       * Genera el enlace enriquecido hacia el WhatsApp oficial de DogHouse
       * prellenando los datos del adoptante y del perro seleccionado.
       */
      const url = buildWhatsAppAdopcionUrl(formData);
      setWhatsappUrl(url);

      // Disparar confeti de celebración
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Ignorar si canvas no está disponible
      }

      setSubmittedSuccess(true);
      onSuccess(`¡Solicitud para adoptar a ${perro.nombre} registrada exitosamente!`);

      // Abrir WhatsApp automáticamente en una pestaña nueva
      const timer = setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 1200);

      return () => clearTimeout(timer);
    } catch (err: any) {
      console.error('Error al procesar solicitud de adopción:', err);
      setErrorMsg('Ocurrió un error al guardar la solicitud. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="modal-formulario-adopcion"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/80 shadow-md flex-shrink-0 bg-stone-100">
              <img 
                src={perro.foto_url} 
                alt={perro.nombre} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded text-amber-100">
                  Formulario Oficial de Adopción
                </span>
              </div>
              <h2 className="text-2xl font-black mt-0.5">Postular para adoptar a {perro.nombre}</h2>
              <p className="text-xs text-amber-100 mt-0.5">
                {perro.edad} • {perro.tamanio} • {perro.genero}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {submittedSuccess ? (
            /* Estado de Éxito y Redirección */
            <div className="text-center py-8 px-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-stone-900">¡Solicitud Registrada con Éxito!</h3>
                <p className="text-stone-600 text-sm mt-2 max-w-md mx-auto">
                  Tus datos han sido guardados en la base de datos de <strong>DogHouse</strong> y se ha notificado a nuestro equipo coordinador.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2 max-w-md mx-auto text-xs text-stone-700">
                <p className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Siguiente paso: Conversación directa por WhatsApp
                </p>
                <p>
                  Si la ventana de WhatsApp no se abrió automáticamente, haz clic en el siguiente botón para enviar el mensaje con tu ficha técnica prellenada:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Abrir WhatsApp Ahora</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cerrar Ventana
                </button>
              </div>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Información sobre el perro vinculado */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Dog className="w-4 h-4 text-amber-600" />
                    Mascota vinculada: {perro.nombre}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {perro.estado}
                  </span>
                </div>
                <p className="line-clamp-2">{perro.descripcion}</p>
                <div className="flex items-center gap-4 text-stone-500 pt-1">
                  <span>Vacunas: <strong>{perro.vacunas ? 'Al día (Sí)' : 'Pendiente'}</strong></span>
                  <span>Esterilizado: <strong>{perro.esterilizado ? 'Sí' : 'No'}</strong></span>
                </div>
              </div>

              {/* Aviso de Entrega Oficial */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Lugar de Entrega:</strong> {SHELTER_DELIVERY_POLICY}
                </span>
              </div>

              {/* Campos Obligatorios */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">
                  1. Datos Obligatorios del Solicitante
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nombre <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Carolina"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Apellido <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Ej. Mendoza"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Edad del Solicitante <span className="text-rose-500">* (Mayor de 18)</span>
                    </label>
                    <input
                      type="number"
                      name="edad"
                      min="18"
                      max="99"
                      value={formData.edad}
                      onChange={handleChange}
                      placeholder="Ej. 28"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Teléfono / Celular (WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej. 0998765432"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Provincia en Ecuador <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      {ECUADOR_PROVINCIAS.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Cantón / Ciudad <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="canton"
                      value={formData.canton}
                      onChange={handleChange}
                      placeholder="Ej. Quito / Guayaquil / Cuenca"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Campos Adicionales de Evaluación Responsable */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">
                  2. Entorno y Compatibilidad del Hogar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Correo Electrónico (Para copia de solicitud)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Tipo de Vivienda
                    </label>
                    <select
                      name="vivienda_tipo"
                      value={formData.vivienda_tipo}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="Casa propia">Casa propia con patio</option>
                      <option value="Departamento">Departamento (pet-friendly)</option>
                      <option value="Arriendo con permiso">Arriendo con permiso formal</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700 font-medium">
                    <input
                      type="checkbox"
                      name="tiene_otras_mascotas"
                      checked={formData.tiene_otras_mascotas}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                    />
                    <span>¿Actualmente convives con otros perros o gatos en tu hogar?</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ¿Por qué elegiste a {perro.nombre}? (Breve motivo)
                  </label>
                  <textarea
                    name="motivo"
                    rows={2}
                    value={formData.motivo}
                    onChange={handleChange}
                    placeholder="Cuéntanos brevemente qué te motivó a postular por él..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Botón de Envío */}
              <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Al enviar, se guardará en Supabase y se abrirá WhatsApp con el mensaje prellenado.
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Procesando...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Solicitud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
