import React, { useState } from 'react';
import { 
  Users, 
  Send, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck, 
  MapPin,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
import { VoluntariadoFormValues } from '../types';
import { ECUADOR_PROVINCIAS } from './FormularioAdopcion';
import { buildWhatsAppVoluntariadoUrl, SHELTER_PHONE_ECUADOR } from '../lib/whatsapp';
import { SubmissionsService } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface VoluntariadoProps {
  onShowToast: (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => void;
}

export const Voluntariado: React.FC<VoluntariadoProps> = ({ onShowToast }) => {
  const [formData, setFormData] = useState<VoluntariadoFormValues>({
    nombre: '',
    apellido: '',
    edad: '',
    provincia: 'Pichincha',
    canton: 'Quito',
    telefono: '',
    email: '',
    rol_interes: 'Paseos y Socialización',
    disponibilidad: 'Fines de semana',
    experiencia_previa: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    {
      titulo: 'Paseos y Socialización',
      icono: '🐕',
      descripcion: 'Paseos recreativos por senderos seguros del refugio, juegos y enriquecimiento ambiental para reducir el estrés de los caniles.',
      horario: 'Sábados y Domingos (09:00 - 13:00)',
    },
    {
      titulo: 'Limpieza y Cuidados',
      icono: '🧼',
      descripcion: 'Apoyo en desinfección de patios, preparación de comidas especiales, cepillado y baños tibios terapéuticos.',
      horario: 'Martes a Domingo (Mañanas)',
    },
    {
      titulo: 'Eventos y Difusión',
      icono: '📸',
      descripcion: 'Fotografía, manejo de stands en ferias de adopción en centros comerciales y parques, y apoyo en redes sociales.',
      horario: 'Jornadas quincenales / Fines de semana',
    },
    {
      titulo: 'Hogar Temporal',
      icono: '🏡',
      descripcion: 'Acoge a un cachorro o perro en post-operatorio durante 2 a 4 semanas mientras finaliza su proceso de recuperación.',
      horario: 'Disponibilidad según necesidad de casos',
    },
  ];

  const capacitaciones = [
    {
      titulo: 'Taller de Manejo Canino Seguro y Lenguaje Corporal',
      fecha: 'Primer sábado de cada mes',
      hora: '10:00 AM - 12:00 PM',
      imparte: 'Ariel y Equipo Etológico DogHouse',
      modalidad: 'Presencial en sede Refugio',
    },
    {
      titulo: 'Protocolo de Primeros Auxilios Veterinarios Básicos',
      fecha: 'Tercer sábado del mes',
      hora: '11:00 AM - 01:00 PM',
      imparte: 'Dra. Patricia V. (Médica Veterinaria)',
      modalidad: 'Híbrida (Práctica presencial)',
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación obligatoria requerida: Nombre, Apellido, Edad, Provincia, Cantón
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.edad || !formData.provincia || !formData.canton.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (Number(formData.edad) < 16) {
      setErrorMsg('Para voluntariado presencial en refugio la edad mínima es 16 años.');
      return;
    }

    if (!formData.telefono.trim()) {
      setErrorMsg('Por favor ingresa tu número de WhatsApp para contactarte.');
      return;
    }

    setLoading(true);

    try {
      // 1. Guardar en Supabase
      await SubmissionsService.saveVoluntariado(formData);

      // 2. Generar WhatsApp a Ariel
      const url = buildWhatsAppVoluntariadoUrl(formData);
      setWhatsappUrl(url);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSubmittedSuccess(true);
      onShowToast('success', '¡Inscripción Guardada!', 'Tus datos se registraron con éxito. Te redirigimos al WhatsApp directo de Ariel.');

      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al registrar tu voluntariado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900">
          Únete a Nuestro Equipo de Voluntariado
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Nuestros voluntarios son el corazón latiente del refugio. Tu tiempo, caricias y compromiso transforman el miedo en confianza y preparan a cada perro para su futura familia.
        </p>
      </div>

      {/* TARJETA DE CONTACTO DIRECTO DE ARIEL (COORDINADOR) */}
      <section className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-4 flex items-center sm:items-start gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md flex-shrink-0 bg-stone-700">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Ariel - Coordinador de Voluntariado"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-900" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                Contacto Directo
              </span>
              <h3 className="text-2xl font-black text-white">Ariel</h3>
              <p className="text-xs text-stone-300 font-medium">Coordinador General de Voluntariado y Bienestar Canino</p>
              <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Refugio DogHouse (Quito - Valle)</span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-stone-700/60 pt-4 lg:pt-0 lg:pl-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-stone-400 text-xs flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Horarios de Turnos
              </span>
              <p className="text-sm font-bold text-white mt-1">Sábados y Domingos</p>
              <p className="text-xs text-stone-300">09:00 AM a 01:30 PM</p>
              <p className="text-[11px] text-stone-400 mt-1">Jornadas entre semana previa cita</p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-stone-400 text-xs flex items-center gap-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Inducción Inicial
              </span>
              <p className="text-sm font-bold text-white mt-1">Capacitación Previa</p>
              <p className="text-xs text-stone-300">Obligatoria antes del 1er turno</p>
              <p className="text-[11px] text-stone-400 mt-1">Incluye credencial de voluntario</p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-stone-400 text-xs flex items-center gap-1.5 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  Escribir a Ariel
                </span>
                <p className="text-sm font-bold text-white mt-1">+593 99 876 5432</p>
              </div>
              <a
                href={`https://wa.me/${SHELTER_PHONE_ECUADOR}?text=${encodeURIComponent('Hola Ariel, me interesa unirme al voluntariado en DogHouse.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ROLES DISPONIBLES Y CAPACITACIONES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Roles */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <span>Áreas donde puedes colaborar</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((r, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-2xl">{r.icono}</span>
                <h4 className="font-bold text-stone-900 mt-2 text-base">{r.titulo}</h4>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{r.descripcion}</p>
                <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] font-semibold text-amber-700">
                  {r.horario}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacitaciones y Requisitos */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Próximas Capacitaciones</span>
          </h3>

          <div className="space-y-3">
            {capacitaciones.map((c, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {c.fecha}
                </span>
                <h4 className="text-sm font-bold text-stone-900">{c.titulo}</h4>
                <p className="text-xs text-stone-500">{c.hora} • {c.modalidad}</p>
                <p className="text-[11px] text-stone-600 font-medium">Instructor: <strong>{c.imparte}</strong></p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-xs text-stone-700 space-y-1.5">
            <h5 className="font-bold text-amber-900">Requisitos para Voluntarios:</h5>
            <ul className="space-y-1 text-stone-600 list-disc list-inside">
              <li>Mayor de 16 años (menores con autorización firmada).</li>
              <li>Amor, paciencia y respeto irrestricto hacia los animales.</li>
              <li>Compromiso mínimo de 2 turnos al mes.</li>
              <li>Ropa cómoda apta para campo y zapatos cerrados.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE INSCRIPCIÓN */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
        <div className="bg-stone-900 text-white p-6 sm:p-8">
          <h3 className="text-2xl font-black">Ficha de Inscripción de Voluntariado</h3>
          <p className="text-xs text-stone-300 mt-1">
            Completa tus datos obligatorios para coordinar tu inducción con Ariel.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-stone-900">¡Bienvenido(a) al Equipo!</h4>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Tus datos fueron almacenados en la base de datos de <strong>DogHouse</strong> y se ha preparado la conversación de WhatsApp con Ariel para agendar tu primera visita.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Abrir WhatsApp con Ariel</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

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
                    placeholder="Ej. Gabriela"
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
                    placeholder="Ej. Paredes"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Edad <span className="text-rose-500">* (Mínimo 16)</span>
                  </label>
                  <input
                    type="number"
                    name="edad"
                    min="16"
                    max="99"
                    value={formData.edad}
                    onChange={handleChange}
                    placeholder="Ej. 22"
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
                    placeholder="Ej. 0987654321"
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
                    placeholder="Ej. Quito / Sangolquí"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tuemail@gmail.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Área o Rol de Mayor Interés
                  </label>
                  <select
                    name="rol_interes"
                    value={formData.rol_interes}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Paseos y Socialización">Paseos y Socialización</option>
                    <option value="Limpieza y Refugio">Limpieza y Cuidados en Refugio</option>
                    <option value="Eventos y Difusión">Eventos, Ferias y Redes Sociales</option>
                    <option value="Hogar Temporal">Hogar Temporal (Temporal Home)</option>
                    <option value="Atención Veterinaria">Apoyo en Atención Veterinaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Disponibilidad Horaria
                </label>
                <select
                  name="disponibilidad"
                  value={formData.disponibilidad}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Fines de semana">Fines de semana (Sábados o Domingos mañanas)</option>
                  <option value="Entre semana (mañanas)">Entre semana (Martes a Viernes mañanas)</option>
                  <option value="Entre semana (tardes)">Entre semana (Tardes)</option>
                  <option value="Tiempo flexible">Tiempo flexible / Eventos puntuales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ¿Tienes experiencia previa con animales o en otros refugios? (Opcional)
                </label>
                <textarea
                  name="experiencia_previa"
                  rows={2}
                  value={formData.experiencia_previa}
                  onChange={handleChange}
                  placeholder="Cuéntanos si has tenido perros, conocimientos de veterinaria, rescates..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Al enviar, se guardará en Supabase y abrirá WhatsApp con el mensaje para Ariel.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Postularme como Voluntario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
