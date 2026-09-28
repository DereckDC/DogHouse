import React from 'react';
import { 
  Heart, 
  Dog, 
  ShieldCheck, 
  Users, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Phone,
  Sparkles,
  Award
} from 'lucide-react';
import { Perro, InsumoNecesidad } from '../types';
import { DOGHOUSE_LOGO_URL } from './Navbar';

interface HomeProps {
  onNavigate: (section: string) => void;
  dogs?: Perro[];
  urgentDogs?: Perro[];
  needs?: InsumoNecesidad[];
  onAdoptDog?: (dog: Perro) => void;
  onSelectDog?: (dog: Perro) => void;
}

export const Home: React.FC<HomeProps> = ({ 
  onNavigate, 
  dogs = [], 
  urgentDogs, 
  needs = [], 
  onAdoptDog, 
  onSelectDog 
}) => {
  // Obtener lista prioritaria de adopción
  const allDogs = dogs.length > 0 ? dogs : (urgentDogs || []);
  const urgentList = allDogs.filter((d) => d.urgente);
  const displayedDogs = urgentList.length > 0 ? urgentList : allDogs;

  const handleAdoptClick = (dog: Perro) => {
    if (onAdoptDog) {
      onAdoptDog(dog);
    } else if (onSelectDog) {
      onSelectDog(dog);
      onNavigate('adopcion');
    } else {
      onNavigate('adopcion');
    }
  };
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/70 via-orange-50/40 to-stone-50 pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-amber-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Refugio Oficial DogHouse Ecuador</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
              Cada vida rescatada merece una <span className="text-amber-600 underline decoration-amber-300 decoration-wavy decoration-2">segunda oportunidad</span>.
            </h1>

            <p className="text-lg text-stone-600 max-w-2xl leading-relaxed">
              En <strong>DogHouse</strong> rescatamos, rehabilitamos física y emocionalmente a perritos en situación de riesgo y abandono en Ecuador, brindándoles un hogar temporal lleno de respeto hasta encontrar la familia que siempre soñaron.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-adopt-primary-btn"
                onClick={() => onNavigate('adopcion')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] transition-all shadow-md shadow-amber-600/25"
              >
                <Dog className="w-5 h-5" />
                <span>Adoptar un Peludito</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-donate-btn"
                onClick={() => onNavigate('donaciones')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:scale-[0.99] transition-all border border-emerald-300"
              >
                <Heart className="w-5 h-5 text-emerald-600" />
                <span>Apoyar con Donación</span>
              </button>

              <button
                id="hero-lost-pets-btn"
                onClick={() => onNavigate('perros-perdidos')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-all text-sm"
              >
                <span>Reportar Perro Perdido</span>
              </button>
            </div>

            {/* Micro guarantees */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Esterilizados y Vacunados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Protocolo de Adopción Seguro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Acompañamiento Post-Adopción</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative back layer */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-amber-200/50 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl -z-10" />

              <div className="bg-white p-3 rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden">
                <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80"
                    alt="Perritos felices en DogHouse"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-xs font-bold uppercase tracking-wider">
                        Historia del Mes
                      </span>
                      <span className="text-xs text-stone-300">Rescatados con amor</span>
                    </div>
                    <h3 className="text-xl font-bold mt-1 text-white">
                      "No cambias el mundo adoptando un perro, pero para ese perro su mundo cambiará por siempre."
                    </h3>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="mt-3 bg-amber-50 rounded-xl p-3 flex items-center justify-between border border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">45 Perros bajo nuestro cuidado</p>
                      <p className="text-[11px] text-stone-500">Alimentados, cuidados y amados a diario</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('adopcion')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                  >
                    Conócelos
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Shelter Live Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Dog className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">450+</div>
            <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-1">Perros Rescatados</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">380+</div>
            <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-1">Adopciones Felices</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">600+</div>
            <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-1">Esterilizaciones</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">85+</div>
            <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-1">Voluntarios Activos</p>
          </div>
        </div>
      </section>

      {/* Urgent Adoption Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Prioridad Alta</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Esperan con ansias un hogar
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Peluditos que llevan más tiempo en el refugio o fueron rescatados de casos críticos.
            </p>
          </div>
          <button
            onClick={() => onNavigate('adopcion')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDogs.slice(0, 3).map((dog) => {
            const personalityTraits = Array.isArray(dog.personalidad) 
              ? dog.personalidad 
              : typeof dog.personalidad === 'string' 
              ? (dog.personalidad as string).split(',').map((s) => s.trim()) 
              : [];

            return (
              <div 
                key={dog.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-60 overflow-hidden bg-stone-100">
                  <img
                    src={dog.foto_url}
                    alt={dog.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {dog.urgente && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
                        Adopción Urgente
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-stone-800">
                      {dog.tamanio}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-900/80 backdrop-blur-sm text-white">
                      {dog.edad}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-stone-900">{dog.nombre}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {dog.genero}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                      {dog.descripcion}
                    </p>

                    {personalityTraits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {personalityTraits.map((trait, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-stone-100 mt-4 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-stone-500 space-y-0.5">
                      <div>Vacunas: <span className="font-semibold text-emerald-600">{dog.vacunas ? 'Sí' : 'No'}</span></div>
                      <div>Esterilizado: <span className="font-semibold text-emerald-600">{dog.esterilizado ? 'Sí' : 'No'}</span></div>
                    </div>
                    <button
                      onClick={() => handleAdoptClick(dog)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
                    >
                      Postular Adopción
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shelter Mission & Values */}
      <section className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 my-10 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Nuestra Misión
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Construyendo un Ecuador libre de abandono y maltrato animal.
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              En DogHouse no creemos en jaulas permanentes. Concebimos nuestro refugio como una estación transitoria de sanación integral, donde cada perro recibe alimento de calidad, atención veterinaria especializada, amor y estimulación social.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  <strong>Rescate Ético:</strong> Evaluamos cada caso priorizando animales heridos, gestantes o en peligro inminente.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  <strong>Esterilización Responsable:</strong> Atacamos la raíz de la sobrepoblación canina con jornadas comunitarias periódicas.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  <strong>Filtro Riguroso de Adopción:</strong> Verificamos que cada hogar ofrezca condiciones de dignidad, tiempo y solvencia de por vida.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/50">
              <h4 className="text-amber-400 font-bold text-lg">Padrinazgo</h4>
              <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                Si no puedes adoptar por espacio o tiempo, apadrina la alimentación o vacunas de un perrito desde $15/mes.
              </p>
              <button 
                onClick={() => onNavigate('apadrinamiento')}
                className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
              >
                Saber más &rarr;
              </button>
            </div>

            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/50">
              <h4 className="text-emerald-400 font-bold text-lg">Voluntariado</h4>
              <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                Únete al equipo liderado por Ariel. Ayúdanos en paseos, baños, eventos y jornadas de rescate.
              </p>
              <button 
                onClick={() => onNavigate('voluntariado')}
                className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
              >
                Inscribirme &rarr;
              </button>
            </div>

            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/50">
              <h4 className="text-sky-400 font-bold text-lg">Donaciones</h4>
              <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                Apoya con transferencias bancarias en Ecuador o dona sacos de balanceado y medicinas directamente.
              </p>
              <button 
                onClick={() => onNavigate('donaciones')}
                className="mt-3 text-xs font-bold text-sky-400 hover:text-sky-300 underline"
              >
                Ver cuentas &rarr;
              </button>
            </div>

            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/50">
              <h4 className="text-purple-400 font-bold text-lg">Eventos</h4>
              <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                Ferias de adopción al aire libre, esterilizaciones y perrotón benéfica en parques de la ciudad.
              </p>
              <button 
                onClick={() => onNavigate('eventos')}
                className="mt-3 text-xs font-bold text-purple-400 hover:text-purple-300 underline"
              >
                Ver calendario &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Adoption Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Proceso Simple y Transparente
          </span>
          <h2 className="text-3xl font-black text-stone-900 mt-1">
            ¿Cómo adoptar en DogHouse?
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Tres pasos pensados para asegurar la compatibilidad entre tu familia y el nuevo integrante canino.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-stone-900">1. Conoce y Elige</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Explora nuestro catálogo de perros disponibles. Revisa su nivel de energía, tamaño, edad y requerimientos según tu estilo de vida.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-stone-900">2. Llena la Solicitud</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Completa el formulario de adopción en línea con tus datos obligatorios (Nombre, Apellido, Edad, Provincia, Cantón). El sistema te conectará a WhatsApp al instante.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-stone-900">3. Entrevista y Bienvenida</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Coordinamos una videollamada o visita al refugio para conocerse en persona, firmar el compromiso de adopción responsable y llevarlo a casa.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
