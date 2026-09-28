import React from 'react';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink,
  Dog,
  Gift,
  ShieldCheck
} from 'lucide-react';
import { DOGHOUSE_LOGO_URL } from './Navbar';
import { 
  SHELTER_PHONE_ECUADOR, 
  SHELTER_PHONE_DISPLAY, 
  SHELTER_EMAIL, 
  SHELTER_LOCATION, 
  SHELTER_HOURS, 
  SHELTER_SOCIALS,
  SHELTER_DELIVERY_POLICY
} from '../lib/whatsapp';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 bg-amber-50 flex-shrink-0">
                <img 
                  src={DOGHOUSE_LOGO_URL} 
                  alt="DogHouse Refugio de Animales Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-2xl text-white font-serif tracking-tight">
                  Dog<span className="text-amber-500">House</span>
                </span>
                <p className="text-xs text-stone-400">Refugio de Animales • {SHELTER_LOCATION}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Organización dedicada al rescate, rehabilitación, esterilización y adopción responsable de perritos en situación vulnerable. Creemos en un mundo donde cada peludito tenga un hogar amoroso y digno.
            </p>

            {/* Social Links */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={SHELTER_SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-pink-950/60 text-pink-300 hover:bg-pink-900 hover:text-white border border-pink-700/50 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={SHELTER_SOCIALS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-950/60 text-blue-300 hover:bg-blue-900 hover:text-white border border-blue-700/50 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={SHELTER_SOCIALS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white border border-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>TikTok</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={`https://wa.me/${SHELTER_PHONE_ECUADOR}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 hover:text-white border border-emerald-700/50 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>WhatsApp: {SHELTER_PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-amber-400 transition-colors"
                >
                  Inicio y Misión
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('adopcion')} 
                  className="hover:text-amber-400 transition-colors"
                >
                  Catálogo de Perros en Adopción
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('apadrinamiento')} 
                  className="hover:text-amber-400 transition-colors"
                >
                  Planes de Apadrinamiento
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('donaciones')} 
                  className="hover:text-amber-400 transition-colors"
                >
                  Donaciones y Cuentas Bancarias
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('voluntariado')} 
                  className="hover:text-amber-400 transition-colors"
                >
                  Voluntariado
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('eventos')} 
                  className="hover:text-amber-400 transition-colors"
                >
                  Eventos y Ferias de Adopción
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('perros-perdidos')} 
                  className="hover:text-amber-400 transition-colors"
                >
                  Alertas de Perros Perdidos
                </button>
              </li>
            </ul>
          </div>

          {/* Bank Summary */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Cuentas de Donación
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div>
                <span className="text-white font-semibold block">Pichincha (Ahorros)</span>
                <span className="font-mono text-[11px]">#2209081738</span>
                <span className="text-[10px] text-stone-500 block">Yeimmy Piguave • CI 0928389253</span>
              </div>
              <div>
                <span className="text-white font-semibold block">Pacífico (Ahorros)</span>
                <span className="font-mono text-[11px]">#1056329695</span>
                <span className="text-[10px] text-stone-500 block">Yeimmy Piguave • CI 0928389253</span>
              </div>
              <div>
                <span className="text-white font-semibold block">Guayaquil (Ahorros)</span>
                <span className="font-mono text-[11px]">#0034356836</span>
                <span className="text-[10px] text-stone-500 block">Ariel Roman • CI 0922691365</span>
              </div>
              <div>
                <a
                  href={SHELTER_SOCIALS.paypal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 font-bold block pt-1 underline"
                >
                  PayPal Oficial &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Ubicación y Atención
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{SHELTER_LOCATION} (Referencia)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={`tel:${SHELTER_PHONE_DISPLAY}`} className="hover:text-emerald-300">
                  {SHELTER_PHONE_DISPLAY}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <a href={`mailto:${SHELTER_EMAIL}`} className="hover:text-sky-300">
                  {SHELTER_EMAIL}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Horarios de visita o atención: {SHELTER_HOURS}</span>
              </div>
              <div className="pt-2 text-[11px] text-amber-400/90 font-medium bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40">
                {SHELTER_DELIVERY_POLICY}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} DogHouse - Maqyasoft. Todos los derechos reservados.</p>
          <button
            onClick={() => onNavigate('loginadmin')}
            className="text-stone-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs focus:outline-none"
            title="Portal de Administración"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500 hover:text-amber-400" />
            <span>Acceso Administrativo</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
