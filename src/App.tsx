/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast, ToastNotification } from './components/Toast';
import { Home } from './components/Home';
import { AdopcionCatalogo } from './components/AdopcionCatalogo';
import { FormularioAdopcion } from './components/FormularioAdopcion';
import { Apadrinamiento } from './components/Apadrinamiento';
import { Donaciones } from './components/Donaciones';
import { Voluntariado } from './components/Voluntariado';
import { EventosModal } from './components/EventosModal';
import { PerrosPerdidos } from './components/PerrosPerdidos';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Perro, 
  InsumoNecesidad, 
  EventoRefugio, 
  PerroPerdidoReporte 
} from './types';
import { 
  DogService, 
  NeedsService, 
  EventsService, 
  LostDogsService,
  INITIAL_DOGS,
  INITIAL_NEEDS,
  INITIAL_EVENTS,
  INITIAL_LOST_DOGS
} from './lib/supabase';
import { MessageCircle, Heart, Phone } from 'lucide-react';
import { SHELTER_PHONE_ECUADOR } from './lib/whatsapp';

function isLoginAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/loginadmin' ||
    path.startsWith('/loginadmin/') ||
    hash === '#/loginadmin' ||
    hash === '#loginadmin' ||
    search.includes('loginadmin')
  );
}

function isAdminPanelRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/panel-admin' ||
    path.startsWith('/panel-admin/') ||
    hash === '#/panel-admin' ||
    hash === '#panel-admin' ||
    search.includes('panel-admin')
  );
}

function getInitialSection(): string {
  if (isAdminPanelRoute()) return 'admin';
  if (isLoginAdminRoute()) return 'loginadmin';
  return 'home';
}

export default function App() {
  // Navegación por estados y sincronización de URL para login y panel admin
  const [activeSection, setActiveSection] = useState<string>(() => {
    return getInitialSection();
  });

  // Estado del Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Estados de datos principales
  const [dogs, setDogs] = useState<Perro[]>(INITIAL_DOGS);
  const [needs, setNeeds] = useState<InsumoNecesidad[]>(INITIAL_NEEDS);
  const [events, setEvents] = useState<EventoRefugio[]>(INITIAL_EVENTS);
  const [lostDogs, setLostDogs] = useState<PerroPerdidoReporte[]>(INITIAL_LOST_DOGS);

  // Modal de Adopción
  const [selectedDogForAdoption, setSelectedDogForAdoption] = useState<Perro | null>(null);
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);

  // Sincronización de eventos de historial del navegador para /loginadmin y /panel-admin
  useEffect(() => {
    const handleUrlChange = () => {
      if (isAdminPanelRoute()) {
        setActiveSection('admin');
      } else if (isLoginAdminRoute()) {
        setActiveSection('loginadmin');
      } else if (activeSection === 'admin' || activeSection === 'loginadmin' || activeSection === 'panel-admin') {
        setActiveSection('home');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [activeSection]);

  // Cargar datos asíncronos de Supabase
  const refreshData = async () => {
    try {
      const [loadedDogs, loadedNeeds, loadedEvents, loadedLostDogs] = await Promise.all([
        DogService.getAll(),
        NeedsService.getAll(),
        EventsService.getAll(),
        LostDogsService.getAll(),
      ]);

      setDogs(loadedDogs);
      setNeeds(loadedNeeds);
      setEvents(loadedEvents);
      setLostDogs(loadedLostDogs);
    } catch (err) {
      console.error('Error cargando datos de Supabase:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => {
    setToast({ tipo, titulo, mensaje });
  };

  const handleOpenAdoptionModal = (dog: Perro) => {
    setSelectedDogForAdoption(dog);
    setIsAdoptionModalOpen(true);
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'panel-admin' || section === 'admin') {
      if (window.location.pathname !== '/panel-admin') {
        try {
          window.history.pushState(null, '', '/panel-admin');
        } catch (e) {}
      }
    } else if (section === 'loginadmin') {
      if (window.location.pathname !== '/loginadmin') {
        try {
          window.history.pushState(null, '', '/loginadmin');
        } catch (e) {}
      }
    } else {
      if (
        window.location.pathname === '/loginadmin' ||
        window.location.pathname === '/panel-admin' ||
        isLoginAdminRoute() ||
        isAdminPanelRoute()
      ) {
        try {
          window.history.pushState(null, '', '/');
        } catch (e) {}
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Barra de Navegación Principal */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Contenido Principal según la sección activa */}
      <main className="flex-1">
        {activeSection === 'home' && (
          <Home
            dogs={dogs}
            needs={needs}
            onNavigate={handleNavigate}
            onAdoptDog={handleOpenAdoptionModal}
          />
        )}

        {activeSection === 'adopcion' && (
          <AdopcionCatalogo
            dogs={dogs}
            onAdoptDog={handleOpenAdoptionModal}
            onShowToast={showToast}
          />
        )}

        {activeSection === 'apadrinamiento' && (
          <Apadrinamiento
            dogs={dogs}
            onShowToast={showToast}
          />
        )}

        {activeSection === 'donaciones' && (
          <Donaciones
            needs={needs}
            onShowToast={showToast}
            onReloadNeeds={refreshData}
          />
        )}

        {activeSection === 'voluntariado' && (
          <Voluntariado
            onShowToast={showToast}
          />
        )}

        {activeSection === 'eventos' && (
          <EventosModal
            eventos={events}
            onShowToast={showToast}
          />
        )}

        {activeSection === 'perros-perdidos' && (
          <PerrosPerdidos
            reportes={lostDogs}
            onShowToast={showToast}
          />
        )}

        {(activeSection === 'admin' || activeSection === 'loginadmin' || activeSection === 'panel-admin') && (
          <AdminDashboard
            onShowToast={showToast}
            onDogListUpdated={refreshData}
            onNavigateToHome={() => handleNavigate('home')}
            onAdminLoginSuccess={() => {
              setActiveSection('admin');
              if (window.location.pathname !== '/panel-admin') {
                try {
                  window.history.pushState(null, '', '/panel-admin');
                } catch (e) {}
              }
            }}
            onAdminLogout={() => {
              setActiveSection('loginadmin');
              if (window.location.pathname !== '/loginadmin') {
                try {
                  window.history.pushState(null, '', '/loginadmin');
                } catch (e) {}
              }
            }}
          />
        )}
      </main>

      {/* MODAL GLOBAL DE FORMULARIO DE ADOPCIÓN */}
      {isAdoptionModalOpen && selectedDogForAdoption && (
        <FormularioAdopcion
          perro={selectedDogForAdoption}
          isOpen={isAdoptionModalOpen}
          onClose={() => {
            setIsAdoptionModalOpen(false);
            setSelectedDogForAdoption(null);
          }}
          onShowToast={showToast}
        />
      )}

      {/* Botón flotante permanente de WhatsApp para emergencias y rescates */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <a
          href={`https://wa.me/${SHELTER_PHONE_ECUADOR}?text=${encodeURIComponent('Hola DogHouse, me gustaría comunicarme con el refugio.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
          title="Escríbenos a nuestro WhatsApp oficial"
        >
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span className="hidden sm:inline">WhatsApp Refugio</span>
        </a>
      </div>

      {/* Pie de Página */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
