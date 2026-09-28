import React, { useState } from 'react';
import { 
  Heart, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle,
  Award,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Perro, ApadrinamientoFormValues } from '../types';
import { ECUADOR_PROVINCIAS } from './FormularioAdopcion';
import { buildWhatsAppApadrinamientoUrl } from '../lib/whatsapp';
import { SubmissionsService } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface ApadrinamientoProps {
  perros?: Perro[];
  dogs?: Perro[];
  onShowToast: (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => void;
}

export const Apadrinamiento: React.FC<ApadrinamientoProps> = ({ perros, dogs, onShowToast }) => {
  const dogList = perros || dogs || [];

  const [formData, setFormData] = useState<ApadrinamientoFormValues>({
    nombre: '',
    apellido: '',
    edad: '',
    provincia: 'Santa Elena',
    canton: 'Salinas',
    telefono: '',
    email: '',
    plan: 'Alimentación',
    monto_mensual: 20,
    perro_id: dogList[0]?.id || '',
    perro_nombre: dogList[0]?.nombre || 'Cualquier perrito que lo necesite',
  });

  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const plans = [
    {
      id: 'Alimentación' as const,
      monto: 20,
      titulo: 'Plan Nutrición',
      subtitulo: '$20 / mes',
      descripcion: 'Cubre saco mensual de alimento balanceado prémium y snacks nutritivos.',
      beneficios: [
        'Reporte mensual con fotos y videos',
        'Visitas especiales al refugio en Salinas',
        'Certificado digital de Padrino DogHouse'
      ],
      popular: false,
    },
    {
      id: 'Salud y Vacunas' as const,
      monto: 35,
      titulo: 'Plan Salud y Vida',
      subtitulo: '$35 / mes',
      descripcion: 'Cubre antiparasitarios, vacunas anuales, exámenes veterinarios y vitaminas.',
      beneficios: [
        'Reportes y videos mensuales del ahijado',
        'Certificado Oficial de Padrino',
        'Visitas especiales (Salinas 10am - 1pm)',
        'Notificaciones de avances de salud'
      ],
      popular: true,
    },
    {
      id: 'Padrino Integral' as const,
      monto: 60,
      titulo: 'Padrino Integral',
      subtitulo: '$60 / mes',
      descripcion: 'Sostiene el 100% de la estadía, medicinas, alimento y adiestramiento del perro.',
      beneficios: [
        'Todos los beneficios anteriores incluidos',
        'Visitas y paseos preferenciales en el refugio',
        'Contacto directo con su cuidador',
        'Placa de honor digital y mención especial'
      ],
      popular: false,
    },
  ];

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setFormData((prev) => ({
      ...prev,
      plan: plan.id,
      monto_mensual: plan.monto,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'perro_id') {
      const selected = perros.find((p) => p.id === value);
      setFormData((prev) => ({
        ...prev,
        perro_id: value,
        perro_nombre: selected ? selected.nombre : 'Refugio General',
      }));
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
      setErrorMsg('Debes ser mayor de 18 años para registrarte como padrino financiero.');
      return;
    }

    if (!formData.telefono.trim()) {
      setErrorMsg('Por favor ingresa tu número de teléfono.');
      return;
    }

    setLoading(true);

    try {
      // 1. Guardar en Supabase
      await SubmissionsService.saveApadrinamiento(formData);

      // 2. Generar WhatsApp URL
      const url = buildWhatsAppApadrinamientoUrl(formData);
      setWhatsappUrl(url);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSubmittedSuccess(true);
      onShowToast('success', '¡Gracias por Apadrinar!', 'Tu registro fue guardado con éxito. Te conectamos por WhatsApp.');

      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al guardar el apadrinamiento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
          <span>Apoyo a la Distancia</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900">
          Apadrina un Peludito en DogHouse
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          ¿No tienes espacio o tiempo en casa para adoptar pero quieres cambiar una vida? Con tu apadrinamiento mensual garantizas el alimento, vacunas y cuidados del perrito que elijas mientras espera su hogar definitivo.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isSelected = formData.plan === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handlePlanSelect(p)}
              className={`rounded-3xl p-6 sm:p-7 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative ${
                isSelected
                  ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-600/20'
                  : 'border-stone-200 bg-white hover:border-amber-300 shadow-xs'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                  Más Elegido
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xl text-stone-900">{p.titulo}</h3>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-stone-300'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-stone-900">${p.monto}</span>
                  <span className="text-xs text-stone-500 font-semibold">USD / mes</span>
                </div>

                <p className="text-xs text-stone-600 mt-3 leading-relaxed">{p.descripcion}</p>

                <div className="mt-5 space-y-2 pt-4 border-t border-stone-100">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Beneficios del Padrino:
                  </span>
                  {p.beneficios.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handlePlanSelect(p)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {isSelected ? 'Plan Seleccionado' : 'Elegir este Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulario de Apadrinamiento */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
        <div className="bg-stone-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-600 text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Formulario de Registro de Padrino</h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Plan activo: <strong>{formData.plan} (${formData.monto_mensual} USD / mes)</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-stone-900">¡Bienvenido a la Familia DogHouse!</h4>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Tu compromiso de apadrinamiento para <strong>{formData.perro_nombre}</strong> ha sido registrado con éxito en nuestro sistema de Supabase.
              </p>
              <div className="pt-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmar por WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Perro a Apadrinar */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ¿A qué perrito deseas apadrinar?
                </label>
                <select
                  name="perro_id"
                  value={formData.perro_id}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium"
                >
                  <option value="">Cualquier perrito con mayor necesidad en el refugio</option>
                  {dogList.map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.nombre} ({dog.edad}, {dog.tamanio}) {dog.urgente ? '⭐ Caso urgente' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos Obligatorios solicitados: Nombre, Apellido, Edad, Provincia, Cantón */}
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
                    placeholder="Ej. Mateo"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
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
                    placeholder="Ej. Cevallos"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Edad <span className="text-rose-500">* (Mayor de 18)</span>
                  </label>
                  <input
                    type="number"
                    name="edad"
                    min="18"
                    max="99"
                    value={formData.edad}
                    onChange={handleChange}
                    placeholder="Ej. 30"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Teléfono / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. 0991234567"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Provincia <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {ECUADOR_PROVINCIAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
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
                    placeholder="Ej. Quito"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Correo Electrónico (Para envío de reportes mensuales) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tucorreo@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Transferencias directas a cuentas del refugio en Ecuador.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Procesando...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Registrar y Conectar a WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
