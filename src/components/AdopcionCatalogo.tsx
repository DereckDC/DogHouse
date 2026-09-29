import React, { useState, useMemo } from 'react';
import { 
  Dog, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Heart, 
  Info,
  ShieldCheck, 
  Sparkles,
  Eye,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { Perro, DogSize } from '../types';
import { FormularioAdopcion } from './FormularioAdopcion';

interface AdopcionCatalogoProps {
  perros?: Perro[];
  dogs?: Perro[];
  selectedDog?: Perro | null;
  onSelectDog?: (dog: Perro | null) => void;
  onAdoptDog?: (dog: Perro) => void;
  onShowToast: (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => void;
}

export type AgeCategoryFilter = 'Todos' | 'Cachorro' | 'Joven' | 'Adulto' | 'Senior';

/** Helper para clasificar la edad del perrito */
export function getDogAgeCategory(edad: string): 'Cachorro' | 'Joven' | 'Adulto' | 'Senior' {
  if (!edad) return 'Adulto';
  const lower = edad.toLowerCase().trim();
  
  if (lower.includes('mes') || lower.includes('meses') || lower.includes('semana') || lower.includes('cachorro') || lower.includes('puppy')) {
    return 'Cachorro';
  }
  
  const numMatch = lower.match(/(\d+([.,]\d+)?)/);
  if (numMatch) {
    const years = parseFloat(numMatch[1].replace(',', '.'));
    if (years < 1) return 'Cachorro';
    if (years <= 2.5) return 'Joven';
    if (years <= 6.5) return 'Adulto';
    return 'Senior';
  }
  
  if (lower.includes('año y medio') || lower.includes('1 año')) return 'Joven';
  if (lower.includes('senior') || lower.includes('abuelo') || lower.includes('mayor')) return 'Senior';
  return 'Adulto';
}

/** Helper para ordenar numéricamente por meses aproximados */
export function getDogApproxAgeInMonths(edad: string): number {
  if (!edad) return 36;
  const lower = edad.toLowerCase().trim();
  const numMatch = lower.match(/(\d+([.,]\d+)?)/);
  if (!numMatch) return 24;
  const val = parseFloat(numMatch[1].replace(',', '.'));
  if (lower.includes('mes') || lower.includes('meses')) {
    return val;
  }
  if (lower.includes('año y medio')) {
    return 18;
  }
  return val * 12;
}

export const AdopcionCatalogo: React.FC<AdopcionCatalogoProps> = ({
  perros,
  dogs,
  selectedDog,
  onSelectDog,
  onAdoptDog,
  onShowToast,
}) => {
  const dogList = perros || dogs || [];

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('Todos');
  const [ageFilter, setAgeFilter] = useState<AgeCategoryFilter>('Todos');
  const [genderFilter, setGenderFilter] = useState<string>('Todos');
  const [onlySterilized, setOnlySterilized] = useState(false);
  const [onlyVaccinated, setOnlyVaccinated] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'age-asc' | 'age-desc' | 'name-asc'>('default');
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'photo-focus'>('grid');

  // Modal para ver foto ampliada y ficha rápida (Lightbox / Quick View)
  const [previewDogIndex, setPreviewDogIndex] = useState<number | null>(null);
  const [activeDogPhotoIndex, setActiveDogPhotoIndex] = useState<number>(0);

  // Perro activo para formulario de adopción interno
  const [internalSelectedDog, setInternalSelectedDog] = useState<Perro | null>(null);

  const activeModalDog = selectedDog || internalSelectedDog;

  const handleAdoptAction = (dog: Perro) => {
    setPreviewDogIndex(null);
    setActiveDogPhotoIndex(0);
    if (onAdoptDog) {
      onAdoptDog(dog);
    } else if (onSelectDog) {
      onSelectDog(dog);
    } else {
      setInternalSelectedDog(dog);
    }
  };

  const handleCloseAdoptionForm = () => {
    if (onSelectDog) {
      onSelectDog(null);
    }
    setInternalSelectedDog(null);
  };

  // Contadores dinámicos por Tamaño
  const sizeCounts = useMemo(() => {
    const counts = { Todos: dogList.length, Pequeño: 0, Mediano: 0, Grande: 0 };
    dogList.forEach((d) => {
      if (d.tamanio === 'Pequeño') counts.Pequeño++;
      if (d.tamanio === 'Mediano') counts.Mediano++;
      if (d.tamanio === 'Grande') counts.Grande++;
    });
    return counts;
  }, [dogList]);

  // Contadores dinámicos por Categoría de Edad
  const ageCounts = useMemo(() => {
    const counts = { Todos: dogList.length, Cachorro: 0, Joven: 0, Adulto: 0, Senior: 0 };
    dogList.forEach((d) => {
      const cat = getDogAgeCategory(d.edad);
      counts[cat]++;
    });
    return counts;
  }, [dogList]);

  // Filtrado reactivo en tiempo real
  const filteredDogs = useMemo(() => {
    let result = dogList.filter((dog) => {
      // Búsqueda por texto (nombre, descripción, personalidad)
      const matchesSearch = 
        !searchTerm.trim() ||
        dog.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dog.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dog.personalidad.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro de Tamaño
      const matchesSize = sizeFilter === 'Todos' || dog.tamanio === sizeFilter;
      
      // Filtro de Edad
      const matchesAge = ageFilter === 'Todos' || getDogAgeCategory(dog.edad) === ageFilter;
      
      // Filtro de Género
      const matchesGender = genderFilter === 'Todos' || dog.genero === genderFilter;
      
      // Filtros médicos
      const matchesSterilized = !onlySterilized || dog.esterilizado;
      const matchesVaccinated = !onlyVaccinated || dog.vacunas;

      return matchesSearch && matchesSize && matchesAge && matchesGender && matchesSterilized && matchesVaccinated;
    });

    // Ordenamiento
    if (sortBy === 'age-asc') {
      result = [...result].sort((a, b) => getDogApproxAgeInMonths(a.edad) - getDogApproxAgeInMonths(b.edad));
    } else if (sortBy === 'age-desc') {
      result = [...result].sort((a, b) => getDogApproxAgeInMonths(b.edad) - getDogApproxAgeInMonths(a.edad));
    } else if (sortBy === 'name-asc') {
      result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else {
      // Priorizar urgentes primero por defecto
      result = [...result].sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));
    }

    return result;
  }, [dogList, searchTerm, sizeFilter, ageFilter, genderFilter, onlySterilized, onlyVaccinated, sortBy]);

  const previewDog = previewDogIndex !== null && filteredDogs[previewDogIndex] ? filteredDogs[previewDogIndex] : null;

  const previewDogPhotos = useMemo(() => {
    if (!previewDog) return [];
    if (previewDog.fotos && previewDog.fotos.length > 0) {
      return previewDog.fotos.slice(0, 5);
    }
    return [previewDog.foto_url];
  }, [previewDog]);

  const currentDogPhoto = previewDogPhotos[activeDogPhotoIndex] || previewDog?.foto_url || '';

  const handlePrevPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewDogIndex !== null && filteredDogs.length > 0) {
      setPreviewDogIndex((prev) => (prev === 0 ? filteredDogs.length - 1 : (prev ?? 0) - 1));
      setActiveDogPhotoIndex(0);
    }
  };

  const handleNextPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewDogIndex !== null && filteredDogs.length > 0) {
      setPreviewDogIndex((prev) => ((prev ?? 0) + 1) % filteredDogs.length);
      setActiveDogPhotoIndex(0);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewDogPhotos.length > 1) {
      setActiveDogPhotoIndex((prev) => (prev === 0 ? previewDogPhotos.length - 1 : prev - 1));
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewDogPhotos.length > 1) {
      setActiveDogPhotoIndex((prev) => (prev + 1) % previewDogPhotos.length);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSizeFilter('Todos');
    setAgeFilter('Todos');
    setGenderFilter('Todos');
    setOnlySterilized(false);
    setOnlyVaccinated(false);
    setSortBy('default');
  };

  const hasActiveFilters = 
    Boolean(searchTerm) || 
    sizeFilter !== 'Todos' || 
    ageFilter !== 'Todos' || 
    genderFilter !== 'Todos' || 
    onlySterilized || 
    onlyVaccinated ||
    sortBy !== 'default';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-100/30 p-6 sm:p-8 rounded-3xl border border-amber-200/60 relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
            Adopta un compañero para toda la vida
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Filtra rápidamente por <strong>tamaño</strong>, <strong>edad</strong> o características médicas. Haz clic en cualquier fotografía para ver su ficha completa o postularte directamente.
          </p>
        </div>
      </div>

      {/* Main Filter & Navigation Engine */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        
        {/* FILTRO 1: TAMAÑO (Pills con botones rápidos) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Dog className="w-4 h-4 text-amber-600" />
              <span>Filtrar por Tamaño:</span>
            </label>
            <span className="text-xs text-stone-400 font-medium">Guía de peso referencial</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'Todos', label: 'Todos los Tamaños', desc: 'Cualquier talla', count: sizeCounts.Todos },
              { key: 'Pequeño', label: 'Pequeño', desc: '< 10 kg (Depto/Bolsillo)', count: sizeCounts.Pequeño },
              { key: 'Mediano', label: 'Mediano', desc: '10 - 25 kg (Ideal familia)', count: sizeCounts.Mediano },
              { key: 'Grande', label: 'Grande', desc: '> 25 kg (Casa o patio)', count: sizeCounts.Grande },
            ].map((item) => {
              const isSelected = sizeFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSizeFilter(item.key)}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-600 border-amber-600 text-white shadow-sm ring-2 ring-amber-600/20'
                      : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100 hover:border-stone-300 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{item.label}</span>
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-700/80 text-white' : 'bg-stone-200/80 text-stone-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-stone-500'}`}>
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTRO 2: EDAD (Pills con etapas de vida) */}
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Filtrar por Etapa de Edad:</span>
            </label>
            <span className="text-xs text-stone-400 font-medium">Desde cachorros hasta seniors</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'Todos' as AgeCategoryFilter, label: 'Todas las Edades', badge: `${ageCounts.Todos}` },
              { key: 'Cachorro' as AgeCategoryFilter, label: '🐾 Cachorros (< 1 año)', badge: `${ageCounts.Cachorro}` },
              { key: 'Joven' as AgeCategoryFilter, label: '⚡ Jóvenes (1 - 2 años)', badge: `${ageCounts.Joven}` },
              { key: 'Adulto' as AgeCategoryFilter, label: '🌿 Adultos (3 - 6 años)', badge: `${ageCounts.Adulto}` },
              { key: 'Senior' as AgeCategoryFilter, label: '👑 Senior (7+ años)', badge: `${ageCounts.Senior}` },
            ].map((item) => {
              const isSelected = ageFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setAgeFilter(item.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? 'bg-stone-700 text-stone-100' : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS SECUNDARIA: Búsqueda, Género, Ordenamiento y Vista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-stone-100">
          
          {/* Búsqueda por Nombre / Personalidad */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, raza o personalidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-stone-50/50 hover:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro Género */}
          <div className="lg:col-span-3">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-stone-50/50 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            >
              <option value="Todos">Cualquier Género (Macho / Hembra)</option>
              <option value="Macho">Solo Machos</option>
              <option value="Hembra">Solo Hembras</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="lg:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-stone-50/50 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            >
              <option value="default">Orden: Casos Urgentes Primero</option>
              <option value="age-asc">Edad: Menor a Mayor (Cachorros)</option>
              <option value="age-desc">Edad: Mayor a Menor (Seniors)</option>
              <option value="name-asc">Nombre: Alfabético (A - Z)</option>
            </select>
          </div>

          {/* Toggle de Modo de Vista */}
          <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setGalleryViewMode('grid')}
              title="Vista en cuadrícula completa"
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                galleryViewMode === 'grid'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Fichas</span>
            </button>

            <button
              type="button"
              onClick={() => setGalleryViewMode('photo-focus')}
              title="Vista Galería de Fotos"
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                galleryViewMode === 'photo-focus'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Galería</span>
            </button>
          </div>
        </div>

        {/* Checkboxes de Salud & Barra de Filtros Activos */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-stone-700 font-medium">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">Requisitos de salud:</span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyVaccinated}
                onChange={(e) => setOnlyVaccinated(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-stone-300"
              />
              <span>Solo con vacunas al día</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlySterilized}
                onChange={(e) => setOnlySterilized(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-stone-300"
              />
              <span>Solo esterilizados</span>
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="font-bold text-stone-800">
              {filteredDogs.length} {filteredDogs.length === 1 ? 'perrito disponible' : 'perritos disponibles'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-amber-700 hover:text-amber-900 font-bold underline text-xs"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* CHIPS DE FILTROS ACTIVOS */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-stone-200">
            <span className="text-[11px] font-bold text-stone-400">Filtros aplicados:</span>
            {sizeFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                Tamaño: {sizeFilter}
                <button onClick={() => setSizeFilter('Todos')} className="hover:text-amber-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {ageFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-900 border border-orange-200 text-xs font-medium">
                Edad: {ageFilter}
                <button onClick={() => setAgeFilter('Todos')} className="hover:text-orange-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {genderFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-300 text-xs font-medium">
                Género: {genderFilter}
                <button onClick={() => setGenderFilter('Todos')} className="hover:text-stone-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {onlyVaccinated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium">
                Vacunas al día
                <button onClick={() => setOnlyVaccinated(false)} className="hover:text-emerald-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {onlySterilized && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium">
                Esterilizado
                <button onClick={() => setOnlySterilized(false)} className="hover:text-emerald-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-300 text-xs font-medium">
                Texto: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-stone-600"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

      </div>

      {/* Dogs Grid & Gallery View */}
      {filteredDogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Dog className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No encontramos perritos con esos filtros</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Prueba seleccionando "Todos los Tamaños" o "Todas las Edades" para explorar el catálogo completo.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Ver todos los perritos
          </button>
        </div>
      ) : galleryViewMode === 'grid' ? (
        /* VISTA 1: CUADRÍCULA COMPLETA (Fichas detalladas) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDogs.map((dog, index) => (
            <div
              key={dog.id}
              id={`dog-card-${dog.id}`}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group cursor-pointer"
              onClick={() => {
                setPreviewDogIndex(index);
                setActiveDogPhotoIndex(0);
              }}
            >
              {/* Card Photo & Badges */}
              <div className="relative h-64 overflow-hidden bg-stone-100">
                <img
                  src={dog.foto_url}
                  alt={dog.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Overlay con Botón de Vista Rápida / Zoom */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewDogIndex(index);
                    setActiveDogPhotoIndex(0);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-xs transition-colors shadow-sm"
                  title="Ver foto en tamaño completo"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {dog.urgente && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
                      Urgente
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-stone-800 shadow-xs flex items-center gap-1">
                    <Dog className="w-3 h-3 text-amber-600" />
                    <span>{dog.tamanio}</span>
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-900/80 backdrop-blur-xs text-white">
                    {dog.edad}
                  </span>
                  {dog.fotos && dog.fotos.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-900/85 backdrop-blur-xs text-amber-300 flex items-center gap-1 shadow-xs">
                      <Camera className="w-3 h-3" />
                      <span>{dog.fotos.length} fotos</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {dog.nombre}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {dog.genero}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                    {dog.descripcion}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {dog.personalidad.map((trait, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-100"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mandatory Attributes Badge Box */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium">Tamaño:</span>
                    <span className="font-bold text-stone-800">{dog.tamanio}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium">Edad:</span>
                    <span className="font-bold text-stone-800">{dog.edad} ({getDogAgeCategory(dog.edad)})</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium">Vacunas:</span>
                    <span className={`font-bold flex items-center gap-1 ${dog.vacunas ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {dog.vacunas ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sí (al día)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>No</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium">Esterilizado:</span>
                    <span className={`font-bold flex items-center gap-1 ${dog.esterilizado ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {dog.esterilizado ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sí</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>No</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDogIndex(index);
                      setActiveDogPhotoIndex(0);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] transition-all shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Ver Galería y Conocer a {dog.nombre}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA 2: GALERÍA DE FOTOS ENFOCADA (Mosaico rápido para exploración visual) */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDogs.map((dog, index) => (
            <div
              key={dog.id}
              onClick={() => {
                setPreviewDogIndex(index);
                setActiveDogPhotoIndex(0);
              }}
              className="group relative bg-stone-900 rounded-2xl overflow-hidden aspect-4/5 cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={dog.foto_url}
                alt={dog.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/20 to-black/30 pointer-events-none" />

              {/* Badges superiores */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                    {dog.tamanio}
                  </span>
                  {dog.fotos && dog.fotos.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/80 backdrop-blur-xs text-amber-300 flex items-center gap-1 shadow-xs">
                      <Camera className="w-2.5 h-2.5" />
                      <span>{dog.fotos.length}</span>
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/80 backdrop-blur-xs text-stone-200">
                  {dog.edad}
                </span>
              </div>

              {/* Información inferior */}
              <div className="absolute bottom-3 left-3 right-3 text-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base">{dog.nombre}</h4>
                  <span className="text-[11px] font-semibold text-amber-300">{dog.genero}</span>
                </div>
                <p className="text-[11px] text-stone-300 line-clamp-1">{dog.descripcion}</p>
                <div className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-stone-400">Clic para ver galería</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDogIndex(index);
                      setActiveDogPhotoIndex(0);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] transition-colors"
                  >
                    Ver Galería
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX / MODAL DE VISTA RÁPIDA DE FOTO Y FICHA */}
      {previewDog && previewDogIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setPreviewDogIndex(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Foto HD con Controles de Carrusel y Galería de hasta 5 fotos */}
            <div className="relative md:w-3/5 bg-stone-950 flex flex-col items-center justify-center min-h-[340px] md:min-h-[500px]">
              <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden">
                <img
                  src={currentDogPhoto}
                  alt={`${previewDog.nombre} - Foto ${activeDogPhotoIndex + 1}`}
                  className="w-full h-full max-h-[55vh] md:max-h-[72vh] object-cover"
                />

                {/* Flechas de Navegación de Fotos del Perrito */}
                {previewDogPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-xs transition-colors shadow-lg z-10"
                      title="Foto anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-xs transition-colors shadow-lg z-10"
                      title="Foto siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badge de Foto Actual / Total de Fotos del Perrito */}
                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs z-10">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Foto {activeDogPhotoIndex + 1} de {previewDogPhotos.length}</span>
                </div>

                {/* Navegación entre Perritos en el Catálogo */}
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-2 shadow-xs z-10">
                  <span>Perrito {previewDogIndex + 1} de {filteredDogs.length}</span>
                  {filteredDogs.length > 1 && (
                    <div className="flex items-center gap-1.5 border-l border-stone-700 pl-2">
                      <button 
                        type="button" 
                        onClick={handlePrevPreview} 
                        className="text-stone-300 hover:text-amber-400 transition-colors" 
                        title="Perrito anterior en catálogo"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={handleNextPreview} 
                        className="text-stone-300 hover:text-amber-400 transition-colors" 
                        title="Perrito siguiente en catálogo"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tira de Miniaturas del Perrito (Hasta 5 fotos) */}
              {previewDogPhotos.length > 1 && (
                <div className="w-full bg-stone-950/90 border-t border-stone-800/80 p-2.5 flex items-center justify-center gap-2 overflow-x-auto z-10">
                  {previewDogPhotos.map((photo, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDogPhotoIndex(pIdx);
                      }}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        pIdx === activeDogPhotoIndex
                          ? 'border-amber-500 scale-105 ring-2 ring-amber-400/40 shadow-sm'
                          : 'border-stone-700 opacity-60 hover:opacity-100 hover:border-stone-500'
                      }`}
                      title={`Ver foto ${pIdx + 1}`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      {pIdx === 0 && (
                        <span className="absolute top-0.5 left-0.5 bg-amber-500 text-[8px] font-black text-white px-1 rounded-sm">
                          1ª
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalles del Perrito en la Galería */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Ficha de Adopción
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewDogIndex(null)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-stone-900">{previewDog.nombre}</h2>
                  <p className="text-xs text-stone-500 mt-1">{previewDog.genero} • {previewDog.edad} ({getDogAgeCategory(previewDog.edad)})</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Tamaño</span>
                    <span className="font-bold text-stone-800">{previewDog.tamanio}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Edad</span>
                    <span className="font-bold text-stone-800">{previewDog.edad}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Vacunación</span>
                    <span className={`font-bold ${previewDog.vacunas ? 'text-emerald-600' : 'text-stone-500'}`}>
                      {previewDog.vacunas ? 'Al día' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Esterilización</span>
                    <span className={`font-bold ${previewDog.esterilizado ? 'text-emerald-600' : 'text-stone-500'}`}>
                      {previewDog.esterilizado ? 'Esterilizado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">Historia</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{previewDog.descripcion}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">Personalidad</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewDog.personalidad.map((trait, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-100"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón Principal de Acción */}
              <div className="pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleAdoptAction(previewDog)}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Dog className="w-4 h-4" />
                  <span>Postular para Adoptar a {previewDog.nombre}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Modal Flow: Formulario de Adopción vinculado exclusivamente al animal seleccionado */}
      {activeModalDog && (
        <FormularioAdopcion
          perro={activeModalDog}
          onClose={handleCloseAdoptionForm}
          onSuccess={(mensaje) => {
            onShowToast('success', 'Postulación Exitosa', mensaje);
          }}
        />
      )}
    </div>
  );
};
