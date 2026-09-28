import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Menu, 
  X, 
  Dog, 
  Calendar, 
  Gift, 
  Users, 
  Search, 
  ShieldCheck, 
  Home as HomeIcon
} from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isAdminLoggedIn?: boolean;
}

export const DOGHOUSE_LOGO_URL = '/DogHouse.jpg';

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate, isAdminLoggedIn }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'home', label: 'Inicio', icon: HomeIcon },
    { id: 'adopcion', label: 'Adopción', icon: Dog },
    { id: 'apadrinamiento', label: 'Apadrinamiento', icon: Heart },
    { id: 'donaciones', label: 'Donaciones', icon: Gift },
    { id: 'voluntariado', label: 'Voluntariado', icon: Users },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'perros-perdidos', label: 'Perdidos', icon: Search },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Main Navbar */}
      <nav 
        id="main-navbar"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-stone-200' 
            : 'bg-white py-3.5 border-b border-stone-100 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button 
            id="brand-logo-btn"
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-500 shadow-sm flex-shrink-0 bg-amber-50">
              {!imgError ? (
                <img 
                  src={DOGHOUSE_LOGO_URL} 
                  alt="DogHouse Refugio Logo" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-500 text-white font-black text-xl">
                  DH
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-stone-900 font-serif">
                  Dog<span className="text-amber-600">House</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Refugio
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Rescate, Rehabilitación y Amor</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleLinkClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-amber-700 bg-amber-50 shadow-xs'
                      : 'text-stone-600 hover:text-amber-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick CTA & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <button
              id="header-adopt-cta-btn"
              onClick={() => handleLinkClick('adopcion')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-sm shadow-amber-600/20 transition-all"
            >
              <Dog className="w-4 h-4" />
              <span>Adoptar</span>
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de navegación"
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div 
            id="mobile-navigation-drawer"
            className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold ${
                    isActive
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <button
                onClick={() => handleLinkClick('adopcion')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 text-white font-bold"
              >
                <Dog className="w-5 h-5" />
                <span>Ver Perros en Adopción</span>
              </button>
              <button
                onClick={() => handleLinkClick('donaciones')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-bold"
              >
                <Gift className="w-5 h-5" />
                <span>Donar al Refugio</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
