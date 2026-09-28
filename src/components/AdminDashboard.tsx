import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Dog,
  Gift,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Database,
  Copy,
  Users,
  Heart,
  AlertCircle,
  Camera,
  Star,
  Search,
  Download,
  AlertTriangle,
  Phone,
  CheckCircle2,
  SlidersHorizontal,
  Key,
  Globe,
  UserPlus,
  LogIn,
  MessageCircle,
  Clock,
  MapPin,
  CheckSquare,
  UserCheck,
} from 'lucide-react';
import {
  Perro,
  InsumoNecesidad,
  ComprobanteDonacion,
  EventoRefugio,
  PerroPerdidoReporte,
  DogSize,
  AdminUser,
} from '../types';
import {
  supabase,
  DogService,
  NeedsService,
  DonationService,
  EventsService,
  LostDogsService,
  SubmissionsService,
  AdminUserService,
  SUPABASE_SQL_SCHEMA,
  CREATE_ADMIN_SQL_SCRIPT,
  ADMIN_TABLE_SQL_SCRIPT,
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import { buildWhatsAppPhoneOnlyUrl } from '../lib/whatsapp';

interface AdminDashboardProps {
  onShowToast: (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => void;
  onDogListUpdated?: () => void;
  onNavigateToHome?: () => void;
  onAdminLoginSuccess?: () => void;
  onAdminLogout?: () => void;
}

type AdminTab =
  | 'perros'
  | 'perdidos'
  | 'necesidades'
  | 'eventos'
  | 'adopciones'
  | 'padrinos'
  | 'voluntarios'
  | 'comprobantes'
  | 'admins'
  | 'sql_config';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onShowToast,
  onDogListUpdated,
  onNavigateToHome,
  onAdminLoginSuccess,
  onAdminLogout,
}) => {
  // Autenticación REAL de Supabase Auth
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navegación de Pestañas
  const [activeTab, setActiveTab] = useState<AdminTab>('perros');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Datos
  const [dogs, setDogs] = useState<Perro[]>([]);
  const [lostDogs, setLostDogs] = useState<PerroPerdidoReporte[]>([]);
  const [needs, setNeeds] = useState<InsumoNecesidad[]>([]);
  const [vouchers, setVouchers] = useState<ComprobanteDonacion[]>([]);
  const [events, setEvents] = useState<EventoRefugio[]>([]);
  const [adopciones, setAdopciones] = useState<any[]>([]);
  const [padrinos, setPadrinos] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [newAdminForm, setNewAdminForm] = useState<{
    email: string;
    password: string;
    nombre: string;
    rol: 'Superadmin' | 'Administrador' | 'Veterinario' | 'Coordinador';
    cargo: string;
    telefono: string;
  } | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Modales
  const [editingDog, setEditingDog] = useState<Partial<Perro> | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [editingNeed, setEditingNeed] = useState<Partial<InsumoNecesidad> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventoRefugio> | null>(null);
  const [editingLostDog, setEditingLostDog] = useState<Partial<PerroPerdidoReporte> | null>(null);
  const [inspectingVoucher, setInspectingVoucher] = useState<ComprobanteDonacion | null>(null);

  // Configuración Supabase
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ checked: boolean; success: boolean; message: string } | null>(null);

  // 1. Escucha y verificación de Sesión
  useEffect(() => {
    let mounted = true;

    async function checkCurrentSession() {
      try {
        setAuthChecking(true);
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          if (data?.session?.user) {
            setSessionUser({
              id: data.session.user.id,
              email: data.session.user.email,
              nombre: data.session.user.user_metadata?.nombre || 'Administrador',
              rol: data.session.user.user_metadata?.rol || 'Superadmin',
              activo: true,
            });
          } else {
            const localSaved = localStorage.getItem('doghouse_admin_session');
            if (localSaved) {
              try {
                const parsed = JSON.parse(localSaved);
                if (parsed && parsed.email) {
                  setSessionUser(parsed);
                }
              } catch (e) {
                if (localSaved === 'true') {
                  setSessionUser({ email: 'admin@refugiodoghouse.ec', nombre: 'Admin General', rol: 'Superadmin', activo: true });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error verificando sesión Supabase:', err);
      } finally {
        if (mounted) setAuthChecking(false);
      }
    }

    checkCurrentSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            nombre: session.user.user_metadata?.nombre || 'Administrador',
            rol: session.user.user_metadata?.rol || 'Superadmin',
            activo: true,
          };
          setSessionUser(userObj);
          localStorage.setItem('doghouse_admin_session', JSON.stringify(userObj));
        } else {
          setSessionUser(null);
          localStorage.removeItem('doghouse_admin_session');
        }
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 2. Carga general de datos de Supabase (Incluyendo tabla public.admins)
  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [d, l, n, v, e, ad, pad, vol, adm] = await Promise.all([
        DogService.getAll(),
        LostDogsService.getAll(),
        NeedsService.getAll(),
        DonationService.getAll(),
        EventsService.getAll(),
        SubmissionsService.getAdopciones(),
        SubmissionsService.getApadrinamientos(),
        SubmissionsService.getVoluntariados(),
        AdminUserService.getAll(),
      ]);

      setDogs(d);
      setLostDogs(l);
      setNeeds(n);
      setVouchers(v);
      setEvents(e);
      setAdopciones(ad);
      setPadrinos(pad);
      setVoluntarios(vol);
      setAdminsList(adm);
    } catch (err: any) {
      console.error('Error cargando datos del panel administrativo:', err);
      onShowToast('error', 'Error de sincronización', err.message || 'No se pudieron consultar los datos de Supabase.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      loadDashboardData();
      if (typeof window !== 'undefined' && window.location.pathname !== '/panel-admin') {
        try {
          window.history.pushState(null, '', '/panel-admin');
        } catch (e) {}
      }
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess();
      }
    }
  }, [sessionUser]);

  // Manejo de Login con la tabla public.admins de Supabase
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!email.trim() || !password.trim()) {
      setAuthError('Por favor ingresa correo y contraseña.');
      setAuthLoading(false);
      return;
    }

    try {
      const authResult = await AdminUserService.login(email, password);

      if (!authResult.success || !authResult.user) {
        throw new Error(authResult.error || 'Credenciales no encontradas en la tabla de administradores de Supabase.');
      }

      setSessionUser(authResult.user);
      localStorage.setItem('doghouse_admin_session', JSON.stringify(authResult.user));

      // Limpiar campos del formulario al autenticar
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setAuthError('');

      // Cambiar URL al panel de administración: /panel-admin
      if (typeof window !== 'undefined' && window.location.pathname !== '/panel-admin') {
        try {
          window.history.pushState(null, '', '/panel-admin');
        } catch (e) {}
      }
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess();
      }

      onShowToast(
        'success',
        'Sesión Iniciada',
        `Bienvenido/a, ${authResult.user.nombre || authResult.user.email} (${authResult.user.rol || 'Admin'}).`
      );
    } catch (err: any) {
      console.error('Error en Supabase Admin Login:', err);
      const msg = err.message || 'Credenciales inválidas en la base de datos de Supabase.';
      setAuthError(msg);
      onShowToast('error', 'Error de Autenticación', msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm?.email || !newAdminForm?.password || !newAdminForm?.nombre) return;

    try {
      await AdminUserService.create({
        email: newAdminForm.email,
        password: newAdminForm.password,
        nombre: newAdminForm.nombre,
        rol: newAdminForm.rol,
        cargo: newAdminForm.cargo || 'Administrador de Refugio',
        telefono: newAdminForm.telefono || undefined,
      });
      onShowToast('success', 'Administrador Guardado', `Se registró a ${newAdminForm.nombre} en la tabla public.admins.`);
      setNewAdminForm(null);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al registrar administrador', err.message);
    }
  };

  const handleToggleAdminStatus = async (id: string, currentStatus: boolean) => {
    try {
      await AdminUserService.updateStatus(id, !currentStatus);
      onShowToast('info', 'Estado Actualizado', `El administrador fue ${!currentStatus ? 'activado' : 'desactivado'}.`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al actualizar', err.message);
    }
  };

  const handleDeleteAdmin = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar definitivamente a ${nombre} de la tabla de administradores?`)) return;
    try {
      await AdminUserService.delete(id);
      onShowToast('info', 'Administrador Eliminado', `${nombre} fue removido de Supabase.`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error cerrando sesión en Supabase:', err);
    }
    setSessionUser(null);
    localStorage.removeItem('doghouse_admin_session');

    // Limpiar completamente los campos del formulario
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setAuthError('');

    // Cambiar URL al formulario de login
    if (typeof window !== 'undefined' && window.location.pathname !== '/loginadmin') {
      try {
        window.history.pushState(null, '', '/loginadmin');
      } catch (e) {}
    }
    if (onAdminLogout) {
      onAdminLogout();
    }

    onShowToast('info', 'Sesión Finalizada', 'Has cerrado tu sesión administrativa.');
  };

  // Guardar configuración de Supabase
  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      onShowToast('error', 'Campos requeridos', 'Debes ingresar tanto la URL como la Anon Key de Supabase.');
      return;
    }
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    onShowToast('success', 'Configuración Guardada', 'Las credenciales de Supabase fueron actualizadas.');
    handleTestConnection();
    loadDashboardData();
  };

  // Test de conexión con Supabase
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await testSupabaseConnection();
      setConnectionStatus({
        checked: true,
        success: res.success,
        message: res.message,
      });
      if (res.success) {
        onShowToast('success', 'Conexión Exitosa', res.message);
      } else {
        onShowToast('error', 'Fallo de Conexión', res.message);
      }
    } catch (err: any) {
      setConnectionStatus({
        checked: true,
        success: false,
        message: err.message || 'Error de conexión',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Descarga del archivo SQL
  const handleDownloadSQL = () => {
    try {
      const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'supabase_schema.sql';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('success', 'Archivo Descargado', 'supabase_schema.sql guardado en tus descargas.');
    } catch (err) {
      onShowToast('error', 'Error de descarga', 'No se pudo generar el archivo.');
    }
  };

  const handleDownloadAdminSQL = () => {
    try {
      const blob = new Blob([CREATE_ADMIN_SQL_SCRIPT], { type: 'text/sql;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'create_admin.sql';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('success', 'Archivo Descargado', 'create_admin.sql guardado en tus descargas.');
    } catch (err) {
      onShowToast('error', 'Error de descarga', 'No se pudo generar el archivo.');
    }
  };

  const handleDownloadAdminTableSQL = () => {
    try {
      const blob = new Blob([ADMIN_TABLE_SQL_SCRIPT], { type: 'text/sql;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'admin_table.sql';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('success', 'Archivo Descargado', 'admin_table.sql guardado en tus descargas.');
    } catch (err) {
      onShowToast('error', 'Error de descarga', 'No se pudo generar el archivo.');
    }
  };

  // Gestión de Fotos (Perro: hasta 5 fotos)
  const handleDogPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentFotos = editingDog?.fotos && editingDog.fotos.length > 0
      ? [...editingDog.fotos]
      : (editingDog?.foto_url ? [editingDog.foto_url] : []);

    const remainingSlots = 5 - currentFotos.length;
    if (remainingSlots <= 0) {
      onShowToast('info', 'Límite de Fotos', 'Ya has alcanzado el límite máximo de 5 fotos por animal.');
      return;
    }

    const filesToLoad: File[] = (Array.from(files) as File[]).slice(0, remainingSlots);
    let loadedCount = 0;
    const newLoadedUrls: string[] = [];

    filesToLoad.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          newLoadedUrls.push(result);
        }
        loadedCount++;
        if (loadedCount === filesToLoad.length) {
          const combined = [...currentFotos, ...newLoadedUrls].slice(0, 5);
          setEditingDog((prev) => prev ? {
            ...prev,
            fotos: combined,
            foto_url: combined[0] || prev.foto_url,
          } : null);
          onShowToast('success', 'Fotos Agregadas', `Se cargaron ${newLoadedUrls.length} foto(s) correctamente.`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const currentFotos = editingDog?.fotos && editingDog.fotos.length > 0
      ? [...editingDog.fotos]
      : (editingDog?.foto_url ? [editingDog.foto_url] : []);

    if (currentFotos.length >= 5) {
      onShowToast('info', 'Límite Alcanzado', 'El perro ya tiene 5 fotos asignadas.');
      return;
    }

    const combined = [...currentFotos, newPhotoUrl.trim()].slice(0, 5);
    setEditingDog((prev) => prev ? {
      ...prev,
      fotos: combined,
      foto_url: combined[0],
    } : null);
    setNewPhotoUrl('');
    onShowToast('success', 'Foto Añadida', 'Se añadió el enlace de imagen.');
  };

  const handleRemoveDogPhoto = (indexToRemove: number) => {
    setEditingDog((prev) => {
      if (!prev) return prev;
      const currentFotos = prev.fotos && prev.fotos.length > 0
        ? [...prev.fotos]
        : (prev.foto_url ? [prev.foto_url] : []);
      const filtered = currentFotos.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        fotos: filtered,
        foto_url: filtered[0] || '',
      };
    });
  };

  const handleSetPrimaryDogPhoto = (indexToPrimary: number) => {
    setEditingDog((prev) => {
      if (!prev) return prev;
      const currentFotos = prev.fotos && prev.fotos.length > 0
        ? [...prev.fotos]
        : (prev.foto_url ? [prev.foto_url] : []);
      if (indexToPrimary <= 0 || indexToPrimary >= currentFotos.length) return prev;
      const [chosen] = currentFotos.splice(indexToPrimary, 1);
      const reordered = [chosen, ...currentFotos];
      return {
        ...prev,
        fotos: reordered,
        foto_url: reordered[0],
      };
    });
    onShowToast('info', 'Foto Principal', 'Esta foto ahora es la portada del perrito.');
  };

  // CRUD PERROS
  const handleSaveDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDog?.nombre || !editingDog?.edad || !editingDog?.tamanio) return;

    try {
      const dogFotos = (editingDog.fotos && editingDog.fotos.length > 0)
        ? editingDog.fotos.slice(0, 5)
        : [editingDog.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'];
      const primaryFoto = dogFotos[0];

      if (editingDog.id) {
        await DogService.update(editingDog.id, {
          ...editingDog,
          fotos: dogFotos,
          foto_url: primaryFoto,
        });
        onShowToast('success', 'Perro Actualizado', `${editingDog.nombre} fue actualizado en Supabase.`);
      } else {
        await DogService.create({
          nombre: editingDog.nombre!,
          edad: editingDog.edad!,
          tamanio: editingDog.tamanio as DogSize,
          genero: editingDog.genero || 'Macho',
          vacunas: Boolean(editingDog.vacunas),
          esterilizado: Boolean(editingDog.esterilizado),
          foto_url: primaryFoto,
          fotos: dogFotos,
          descripcion: editingDog.descripcion || 'Sin descripción.',
          personalidad: typeof editingDog.personalidad === 'string'
            ? (editingDog.personalidad as string).split(',').map((s) => s.trim())
            : (editingDog.personalidad || ['Cariñoso']),
          urgente: Boolean(editingDog.urgente),
          estado: editingDog.estado || 'Disponible',
        });
        onShowToast('success', 'Perro Registrado', `Se agregó al catálogo de adopciones.`);
      }

      setEditingDog(null);
      setNewPhotoUrl('');
      loadDashboardData();
      if (onDogListUpdated) onDogListUpdated();
    } catch (err: any) {
      onShowToast('error', 'Error al guardar perro', err.message || 'No se pudo guardar en Supabase.');
    }
  };

  const handleDeleteDog = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar definitivamente a ${nombre} del catálogo?`)) return;
    try {
      await DogService.delete(id);
      onShowToast('info', 'Perro Eliminado', `${nombre} fue eliminado de Supabase.`);
      loadDashboardData();
      if (onDogListUpdated) onDogListUpdated();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // CRUD NECESIDADES
  const handleSaveNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNeed?.nombre || !editingNeed?.categoria || !editingNeed?.cantidad_meta) return;

    try {
      if (editingNeed.id) {
        await NeedsService.update(editingNeed.id, editingNeed);
        onShowToast('success', 'Insumo Actualizado', 'Se guardaron los cambios en Supabase.');
      } else {
        await NeedsService.create({
          categoria: editingNeed.categoria as any,
          nombre: editingNeed.nombre,
          descripcion: editingNeed.descripcion || '',
          cantidad_meta: Number(editingNeed.cantidad_meta),
          cantidad_actual: Number(editingNeed.cantidad_actual || 0),
          unidad: editingNeed.unidad || 'Unidades',
          prioridad: (editingNeed.prioridad as any) || 'Media',
          urgente: Boolean(editingNeed.urgente),
        });
        onShowToast('success', 'Insumo Creado', 'Se agregó a las necesidades del refugio.');
      }
      setEditingNeed(null);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al guardar insumo', err.message);
    }
  };

  const handleDeleteNeed = async (id: string) => {
    if (!confirm('¿Eliminar este insumo de la lista de necesidades?')) return;
    try {
      await NeedsService.delete(id);
      onShowToast('info', 'Insumo Eliminado', 'El ítem fue removido de Supabase.');
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // CRUD EVENTOS
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.titulo || !editingEvent?.fecha) return;

    try {
      if (editingEvent.id) {
        await EventsService.update(editingEvent.id, editingEvent);
        onShowToast('success', 'Evento Actualizado', 'Se actualizaron los datos del evento.');
      } else {
        await EventsService.create({
          titulo: editingEvent.titulo,
          tipo: editingEvent.tipo as any || 'Evento Actual',
          fecha: editingEvent.fecha,
          hora: editingEvent.hora || '10:00 AM',
          lugar: editingEvent.lugar || 'Salinas',
          descripcion_corta: editingEvent.descripcion_corta || '',
          descripcion_completa: editingEvent.descripcion_completa || '',
          foto_url: editingEvent.foto_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
          requisitos: editingEvent.requisitos || [],
          destacado: Boolean(editingEvent.destacado),
        });
        onShowToast('success', 'Evento Creado', 'Nuevo evento publicado con éxito.');
      }
      setEditingEvent(null);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al guardar evento', err.message);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Eliminar este evento de la cartelera?')) return;
    try {
      await EventsService.delete(id);
      onShowToast('info', 'Evento Eliminado', 'El evento fue removido de Supabase.');
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // CRUD PERROS PERDIDOS
  const handleToggleLostDogStatus = async (id: string, current: string) => {
    const nextStatus = current === 'Buscando' ? 'Reunido con familia' : 'Buscando';
    try {
      await LostDogsService.updateStatus(id, nextStatus as any);
      onShowToast('success', 'Estado Actualizado', `Reporte marcado como: ${nextStatus}`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al actualizar', err.message);
    }
  };

  const handleDeleteLostDog = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el reporte de búsqueda de ${nombre}?`)) return;
    try {
      await LostDogsService.delete(id);
      onShowToast('info', 'Reporte Eliminado', `Se removió el reporte de ${nombre}.`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // COMPROBANTES
  const handleUpdateVoucherStatus = async (id: string, estado: 'Pendiente' | 'Verificado' | 'Rechazado') => {
    try {
      await DonationService.updateStatus(id, estado);
      onShowToast('info', 'Estado Actualizado', `Comprobante marcado como: ${estado}`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al actualizar comprobante', err.message);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('¿Eliminar este comprobante de donación?')) return;
    try {
      await DonationService.delete(id);
      onShowToast('info', 'Comprobante Eliminado', 'El registro fue removido.');
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // SOLICITUDES ADOPCIÓN
  const handleUpdateAdopcionStatus = async (id: string, estado: any) => {
    try {
      await SubmissionsService.updateAdopcionStatus(id, estado);
      onShowToast('info', 'Postulación Actualizada', `Estado cambiado a: ${estado}`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al actualizar', err.message);
    }
  };

  const handleDeleteAdopcion = async (id: string) => {
    if (!confirm('¿Eliminar esta postulación de adopción?')) return;
    try {
      await SubmissionsService.deleteAdopcion(id);
      onShowToast('info', 'Postulación Eliminada', 'Se borró el registro.');
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // PADRINOS
  const handleUpdatePadrinoStatus = async (id: string, estado: any) => {
    try {
      await SubmissionsService.updateApadrinamientoStatus(id, estado);
      onShowToast('info', 'Padrino Actualizado', `Estado cambiado a: ${estado}`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al actualizar', err.message);
    }
  };

  const handleDeletePadrino = async (id: string) => {
    if (!confirm('¿Eliminar este registro de padrino?')) return;
    try {
      await SubmissionsService.deleteApadrinamiento(id);
      onShowToast('info', 'Registro Eliminado', 'Padrino eliminado.');
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // VOLUNTARIOS
  const handleUpdateVoluntarioStatus = async (id: string, estado: any) => {
    try {
      await SubmissionsService.updateVoluntariadoStatus(id, estado);
      onShowToast('info', 'Voluntario Actualizado', `Estado cambiado a: ${estado}`);
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al actualizar', err.message);
    }
  };

  const handleDeleteVoluntario = async (id: string) => {
    if (!confirm('¿Eliminar este registro de voluntario?')) return;
    try {
      await SubmissionsService.deleteVoluntariado(id);
      onShowToast('info', 'Registro Eliminado', 'Voluntario eliminado.');
      loadDashboardData();
    } catch (err: any) {
      onShowToast('error', 'Error al eliminar', err.message);
    }
  };

  // Contadores para badges
  const pendingVouchersCount = vouchers.filter((v) => v.estado === 'Pendiente').length;
  const pendingAdopcionesCount = adopciones.filter((a) => a.estado === 'Pendiente').length;
  const searchingLostDogsCount = lostDogs.filter((l) => l.estado === 'Buscando').length;
  const urgentNeedsCount = needs.filter((n) => n.urgente).length;

  // Pantalla de Login / Autenticación Real de Supabase (Acceso Restringido)
  if (!sessionUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 text-white p-8 text-center space-y-2">
            <div className="w-13 h-13 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-600/30">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Acceso Administrativo</h2>
            <p className="text-xs text-stone-300">
              Acceso restringido para el personal autorizado de Refugio DogHouse
            </p>

            {/* Supabase Status Chip */}
            <div className="pt-2 flex items-center justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                isSupabaseConfigured()
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isSupabaseConfigured() ? 'Supabase Conectado' : 'Configuración Pendiente'}</span>
              </span>
            </div>
          </div>

          {/* Formulario de Login Único (Sin registro público) */}
          <div className="p-8 space-y-5">
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ejemplo.com"
                  required
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales en Supabase...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="text-[11px] text-stone-400">
                🔒 Gestión de administradores en Supabase
              </span>
              {onNavigateToHome && (
                <button
                  type="button"
                  onClick={onNavigateToHome}
                  className="font-bold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  ← Ir al Inicio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Autenticada con Navegación Mejorada
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. TOP HEADER DEL PANEL */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-stone-800">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Conectado</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {sessionUser.email || 'admin@refugiodoghouse.ec'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Panel Administrativo DogHouse
            </h1>
          </div>
        </div>

        {/* Acciones Rápidas del Top Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            disabled={loadingData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors disabled:opacity-50"
            title="Sincronizar datos con Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={handleDownloadSQL}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-colors"
            title="Descargar archivo supabase_schema.sql"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .SQL</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGACIÓN PRINCIPAL DEL ADMIN (CATEGORIZADA Y RESPONSIVA) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-xs space-y-2">
        {/* Grupos de Categorías */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {/* GRUPO 1: REFUGIO */}
          <button
            onClick={() => { setActiveTab('perros'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'perros'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Dog className="w-4 h-4" />
            <span>Perros</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'perros' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {dogs.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('perdidos'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'perdidos'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Perros Perdidos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              searchingLostDogsCount > 0 ? 'bg-rose-500 text-white font-black' : (activeTab === 'perdidos' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700')
            }`}>
              {lostDogs.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('necesidades'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'necesidades'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Necesidades</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'necesidades' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {needs.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('eventos'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'eventos'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Eventos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'eventos' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {events.length}
            </span>
          </button>

          {/* Separador */}
          <div className="hidden md:block w-px bg-stone-200 my-1 mx-1" />

          {/* GRUPO 2: COMUNIDAD */}
          <button
            onClick={() => { setActiveTab('adopciones'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'adopciones'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Adopciones</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'adopciones' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {adopciones.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('padrinos'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'padrinos'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Padrinos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'padrinos' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {padrinos.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('voluntarios'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'voluntarios'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Voluntarios</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'voluntarios' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {voluntarios.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('comprobantes'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'comprobantes'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Donaciones</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              pendingVouchersCount > 0 ? 'bg-amber-500 text-stone-950 font-black animate-pulse' : (activeTab === 'comprobantes' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700')
            }`}>
              {vouchers.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('admins'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'admins'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admins BD</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'admins' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {adminsList.length}
            </span>
          </button>

          {/* Separador */}
          <div className="hidden md:block w-px bg-stone-200 my-1 mx-1" />

          {/* GRUPO 3: CONFIGURACIÓN SQL */}
          <button
            onClick={() => { setActiveTab('sql_config'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ml-auto ${
              activeTab === 'sql_config'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>Supabase & SQL</span>
          </button>
        </div>
      </div>

      {/* 3. CONTENIDO DE LA PESTAÑA ACTIVA */}

      {/* PESTAÑA: PERROS EN ADOPCIÓN */}
      {activeTab === 'perros' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full text-xs outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => {
                setNewPhotoUrl('');
                setEditingDog({
                  nombre: '',
                  edad: '1 año',
                  tamanio: 'Mediano',
                  genero: 'Macho',
                  vacunas: true,
                  esterilizado: true,
                  foto_url: '',
                  fotos: [],
                  descripcion: '',
                  personalidad: ['Cariñoso', 'Tranquilo'],
                  urgente: false,
                  estado: 'Disponible',
                });
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Perro</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs
              .filter((d) => d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || d.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((dog) => (
                <div key={dog.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="relative h-48 bg-stone-100">
                      <img src={dog.foto_url} alt={dog.nombre} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/95 text-stone-800 shadow-xs">
                        {dog.tamanio}
                      </span>
                      {dog.urgente && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                          Urgente
                        </span>
                      )}
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <Camera className="w-3 h-3 text-amber-400" />
                        <span>{(dog.fotos && dog.fotos.length > 0) ? dog.fotos.length : 1} / 5 fotos</span>
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-stone-900">{dog.nombre}</h4>
                        <span className="text-xs font-semibold text-stone-500">{dog.edad}</span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2">{dog.descripcion}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {dog.personalidad?.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-medium text-stone-600">
                            {p}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-stone-500 pt-1 flex items-center justify-between border-t border-stone-100">
                        <span>Estado: <strong className="text-emerald-700">{dog.estado}</strong></span>
                        <span>Vacunas: <strong>{dog.vacunas ? 'Sí' : 'No'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-stone-100 mt-2">
                    <button
                      onClick={() => {
                        setNewPhotoUrl('');
                        setEditingDog({
                          ...dog,
                          fotos: (dog.fotos && dog.fotos.length > 0) ? dog.fotos : [dog.foto_url],
                        });
                      }}
                      className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDog(dog.id, dog.nombre)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* PESTAÑA: PERROS PERDIDOS */}
      {activeTab === 'perdidos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-stone-900">Reportes de Perros Perdidos</h3>
              <p className="text-xs text-stone-500">Reportes ciudadanos sincronizados en la tabla <code>perros_perdidos</code></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostDogs.map((reporte) => (
              <div key={reporte.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-stone-100">
                    <img src={reporte.foto_url} alt={reporte.nombre_perro} className="w-full h-full object-cover" />
                    <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      reporte.estado === 'Buscando' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {reporte.estado}
                    </span>
                    {reporte.recompensa && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950">
                        {reporte.recompensa}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-lg font-bold text-stone-900">{reporte.nombre_perro}</h4>
                    <p className="text-xs text-stone-600 line-clamp-2">{reporte.informacion_relevante}</p>
                    <div className="text-xs text-stone-500 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{reporte.ubicacion_ultima_vez}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{reporte.contacto_nombre}: {reporte.contacto_telefono}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                  <button
                    onClick={() => handleToggleLostDogStatus(reporte.id, reporte.estado)}
                    className="p-1.5 px-2.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900"
                  >
                    Cambiar Estado
                  </button>
                  <div className="flex items-center gap-2">
                    {reporte.maps_url && (
                      <a
                        href={reporte.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                        title="Ver en Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteLostDog(reporte.id, reporte.nombre_perro)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA: NECESIDADES */}
      {activeTab === 'necesidades' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-stone-900">Catálogo de Insumos y Necesidades</h3>
              <p className="text-xs text-stone-500">Administra los insumos requeridos en el refugio</p>
            </div>
            <button
              onClick={() =>
                setEditingNeed({
                  categoria: 'Comida',
                  nombre: '',
                  descripcion: '',
                  cantidad_meta: 10,
                  cantidad_actual: 0,
                  unidad: 'Sacos de 15kg',
                  prioridad: 'Alta',
                  urgente: true,
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Insumo</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Insumo</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Meta / Actual</th>
                    <th className="p-4">Prioridad</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {needs.map((n) => (
                    <tr key={n.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-stone-900">
                        <div>{n.nombre}</div>
                        <div className="text-[11px] font-normal text-stone-500">{n.descripcion}</div>
                      </td>
                      <td className="p-4">{n.categoria}</td>
                      <td className="p-4 font-semibold">
                        {n.cantidad_actual} / {n.cantidad_meta} {n.unidad}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          n.urgente ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {n.prioridad} {n.urgente && '• Urgente'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingNeed(n)}
                          className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteNeed(n.id)}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: EVENTOS */}
      {activeTab === 'eventos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-stone-900">Jornadas y Eventos del Refugio</h3>
              <p className="text-xs text-stone-500">Publica ferias de adopción y campañas de esterilización</p>
            </div>
            <button
              onClick={() =>
                setEditingEvent({
                  titulo: '',
                  tipo: 'Próximamente',
                  fecha: 'Sábado 15 de Noviembre, 2026',
                  hora: '10:00 AM - 02:00 PM',
                  lugar: 'Salinas, Santa Elena',
                  descripcion_corta: '',
                  descripcion_completa: '',
                  foto_url: '',
                  destacado: false,
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Evento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="relative h-40 bg-stone-100">
                    <img src={ev.foto_url} alt={ev.titulo} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-stone-900/90 text-white">
                      {ev.tipo}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-xs font-bold text-amber-700">{ev.fecha}</span>
                    <h4 className="font-bold text-stone-900">{ev.titulo}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{ev.descripcion_corta}</p>
                    <div className="text-[11px] text-stone-400 flex items-center gap-1 pt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{ev.lugar}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-end gap-2 border-t border-stone-100 mt-2">
                  <button
                    onClick={() => setEditingEvent(ev)}
                    className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA: ADOPCIONES */}
      {activeTab === 'adopciones' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900">Solicitudes de Adopción</h3>
              <p className="text-xs text-stone-500">Postulantes registrados en la tabla <code>solicitudes_adopcion</code></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {adopciones.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                No hay solicitudes de adopción registradas aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Mascota</th>
                      <th className="p-4">Postulante</th>
                      <th className="p-4">Ubicación</th>
                      <th className="p-4">Contacto</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {adopciones.map((ad) => (
                      <tr key={ad.id} className="hover:bg-stone-50/50">
                        <td className="p-4 font-bold text-amber-700">{ad.perro_nombre}</td>
                        <td className="p-4">
                          <div className="font-bold text-stone-900">{ad.nombre} {ad.apellido}</div>
                          <div className="text-[11px] text-stone-500">{ad.edad} años • {ad.vivienda_tipo || 'N/A'}</div>
                        </td>
                        <td className="p-4">{ad.canton}, {ad.provincia}</td>
                        <td className="p-4">
                          <div>{ad.telefono}</div>
                          <div className="text-[11px] text-stone-500">{ad.email || 'Sin correo'}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={ad.estado || 'Pendiente'}
                            onChange={(e) => handleUpdateAdopcionStatus(ad.id, e.target.value)}
                            className="p-1 px-2 rounded-lg border text-xs bg-white font-bold"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Revisión">En Revisión</option>
                            <option value="Aprobada">Aprobada</option>
                            <option value="Rechazada">Rechazada</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {ad.telefono && (
                            <a
                              href={buildWhatsAppPhoneOnlyUrl(ad.telefono, `Hola ${ad.nombre}, te saludamos de Refugio DogHouse respecto a tu postulación de adopción.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteAdopcion(ad.id)}
                            className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: PADRINOS */}
      {activeTab === 'padrinos' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900">Padrinos Financieros</h3>
              <p className="text-xs text-stone-500">Madrinas y padrinos registrados en <code>solicitudes_apadrinamiento</code></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {padrinos.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                Aún no hay padrinos registrados en Supabase.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Padrino</th>
                      <th className="p-4">Aporte Mensual</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Mascota Apadrinada</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {padrinos.map((pad) => (
                      <tr key={pad.id} className="hover:bg-stone-50/50">
                        <td className="p-4">
                          <div className="font-bold text-stone-900">{pad.nombre} {pad.apellido}</div>
                          <div className="text-[11px] text-stone-500">{pad.email} • {pad.telefono}</div>
                        </td>
                        <td className="p-4 font-black font-mono text-emerald-700 text-sm">
                          ${pad.monto_mensual} USD/mes
                        </td>
                        <td className="p-4">{pad.plan}</td>
                        <td className="p-4 font-bold text-amber-700">{pad.perro_nombre || 'Refugio General'}</td>
                        <td className="p-4">
                          <select
                            value={pad.estado || 'Activo'}
                            onChange={(e) => handleUpdatePadrinoStatus(pad.id, e.target.value)}
                            className="p-1 px-2 rounded-lg border text-xs bg-white font-bold"
                          >
                            <option value="Activo">Activo</option>
                            <option value="Pausado">Pausado</option>
                            <option value="Finalizado">Finalizado</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {pad.telefono && (
                            <a
                              href={buildWhatsAppPhoneOnlyUrl(pad.telefono, `Hola ${pad.nombre}, te agradecemos de Refugio DogHouse por tu apoyo como padrino.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeletePadrino(pad.id)}
                            className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: VOLUNTARIOS */}
      {activeTab === 'voluntarios' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900">Voluntarios Registrados</h3>
              <p className="text-xs text-stone-500">Inscripciones ciudadanas en <code>solicitudes_voluntariado</code></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {voluntarios.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                Aún no hay voluntarios registrados en Supabase.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Voluntario</th>
                      <th className="p-4">Rol de Interés</th>
                      <th className="p-4">Disponibilidad</th>
                      <th className="p-4">Ubicación</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {voluntarios.map((vol) => (
                      <tr key={vol.id} className="hover:bg-stone-50/50">
                        <td className="p-4">
                          <div className="font-bold text-stone-900">{vol.nombre} {vol.apellido}</div>
                          <div className="text-[11px] text-stone-500">{vol.email} • {vol.telefono}</div>
                        </td>
                        <td className="p-4 font-medium">{vol.rol_interes}</td>
                        <td className="p-4 text-stone-600">{vol.disponibilidad}</td>
                        <td className="p-4">{vol.canton}, {vol.provincia}</td>
                        <td className="p-4">
                          <select
                            value={vol.estado || 'Pendiente'}
                            onChange={(e) => handleUpdateVoluntarioStatus(vol.id, e.target.value)}
                            className="p-1 px-2 rounded-lg border text-xs bg-white font-bold"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Aceptado">Aceptado</option>
                            <option value="Contactado">Contactado</option>
                            <option value="Inactivo">Inactivo</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {vol.telefono && (
                            <a
                              href={buildWhatsAppPhoneOnlyUrl(vol.telefono, `Hola ${vol.nombre}, te contactamos de Refugio DogHouse respecto a tu voluntariado.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteVoluntario(vol.id)}
                            className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: COMPROBANTES DE DONACIÓN */}
      {activeTab === 'comprobantes' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900">Comprobantes de Pago y Transferencias</h3>
              <p className="text-xs text-stone-500">
                Almacenados en <code>comprobantes_donacion</code> y Supabase Storage. Haz clic en "Ver Imagen" para inspeccionar la transferencia.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Donante</th>
                    <th className="p-4">Monto</th>
                    <th className="p-4">Banco / Referencia</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Comprobante</th>
                    <th className="p-4 text-right">Validar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-stone-50/50">
                      <td className="p-4">
                        <div className="font-bold text-stone-900">{v.donante_nombre}</div>
                        <div className="text-[11px] text-stone-500">{v.donante_email || v.donante_telefono || 'Sin contacto'}</div>
                      </td>
                      <td className="p-4 font-mono font-black text-emerald-700 text-sm">
                        ${Number(v.monto).toFixed(2)} USD
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{v.banco_origen}</div>
                        <div className="font-mono text-[11px] text-stone-500">{v.numero_referencia}</div>
                      </td>
                      <td className="p-4 text-stone-600">{v.fecha_transferencia}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          v.estado === 'Verificado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.estado === 'Rechazado'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setInspectingVoucher(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Archivo</span>
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleUpdateVoucherStatus(v.id, 'Verificado')}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          title="Aprobar / Verificar donación"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateVoucherStatus(v.id, 'Rechazado')}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                          title="Rechazar comprobante"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVoucher(v.id)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: ADMINISTRADORES DEL REFUGIO (TABLA public.admins EN SUPABASE) */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Header & Acciones Rápidas */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tabla de Base de Datos: public.admins</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Gestión de Administradores del Refugio
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                  Esta tabla almacena en PostgreSQL las credenciales institucionales de acceso: correo, contraseña encriptada con algoritmo Bcrypt (<code className="bg-stone-100 px-1 py-0.5 rounded text-amber-700 font-mono">crypt(p_password, gen_salt(&apos;bf&apos;))</code>), rol administrativo, cargo institucional, teléfono y fecha de último acceso.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setNewAdminForm({
                    email: '',
                    password: '',
                    nombre: '',
                    rol: 'Superadmin',
                    cargo: 'Administrador de Refugio',
                    telefono: '',
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nuevo Administrador</span>
                </button>

                <button
                  onClick={handleDownloadAdminTableSQL}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold transition-colors"
                  title="Descargar admin_table.sql para Supabase"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar admin_table.sql</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ADMIN_TABLE_SQL_SCRIPT);
                    onShowToast('success', 'SQL Copiado', 'Script de la tabla public.admins copiado al portapapeles.');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                  title="Copiar DDL de public.admins"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar SQL</span>
                </button>
              </div>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <span className="text-stone-500 block text-[11px]">Total Administradores</span>
                <span className="text-xl font-black text-stone-900 font-mono mt-0.5 block">
                  {adminsList.length}
                </span>
                <span className="text-[10px] text-stone-400 mt-1 block">Registrados en la BD</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
                <span className="text-emerald-700 block text-[11px] font-semibold">Cuentas Activas</span>
                <span className="text-xl font-black text-emerald-800 font-mono mt-0.5 block">
                  {adminsList.filter((a) => a.activo).length}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1 block">Con permiso de login</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs">
                <span className="text-amber-800 block text-[11px] font-semibold">Superadmins</span>
                <span className="text-xl font-black text-amber-900 font-mono mt-0.5 block">
                  {adminsList.filter((a) => a.rol === 'Superadmin').length}
                </span>
                <span className="text-[10px] text-amber-700 mt-1 block">Acceso total al sistema</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 text-white text-xs">
                <span className="text-stone-300 block text-[11px] font-semibold">Seguridad Password</span>
                <span className="text-sm font-bold text-amber-400 font-mono mt-1 block flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bcrypt / pgcrypto</span>
                </span>
                <span className="text-[10px] text-stone-400 mt-1 block">Protección en base de datos</span>
              </div>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, correo, rol o cargo..."
                className="w-full text-xs outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 rounded hover:bg-stone-100">
                  <X className="w-3.5 h-3.5 text-stone-400" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">
                {adminsList.filter((a) => {
                  const q = searchQuery.toLowerCase();
                  return (
                    !q ||
                    a.nombre.toLowerCase().includes(q) ||
                    a.email.toLowerCase().includes(q) ||
                    a.rol.toLowerCase().includes(q) ||
                    (a.cargo && a.cargo.toLowerCase().includes(q))
                  );
                }).length} administradores
              </span>
            </div>
          </div>

          {/* Tabla de Administradores Registrados */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="p-4">Administrador</th>
                    <th className="p-4">Correo Electrónico (Login)</th>
                    <th className="p-4">Rol Asignado</th>
                    <th className="p-4">Teléfono / WhatsApp</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Último Acceso</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {adminsList
                    .filter((a) => {
                      const q = searchQuery.toLowerCase();
                      return (
                        !q ||
                        a.nombre.toLowerCase().includes(q) ||
                        a.email.toLowerCase().includes(q) ||
                        a.rol.toLowerCase().includes(q) ||
                        (a.cargo && a.cargo.toLowerCase().includes(q))
                      );
                    })
                    .map((admin) => (
                      <tr key={admin.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Administrador (Nombre y Cargo) */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs ${
                              admin.rol === 'Superadmin'
                                ? 'bg-purple-600'
                                : admin.rol === 'Veterinario'
                                ? 'bg-emerald-600'
                                : admin.rol === 'Coordinador'
                                ? 'bg-blue-600'
                                : 'bg-amber-600'
                            }`}>
                              {admin.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 text-sm">{admin.nombre}</div>
                              <div className="text-[11px] text-stone-500 font-medium">
                                {admin.cargo || 'Administrador de Refugio'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Correo Electrónico */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono text-stone-800 text-xs">
                            <span>{admin.email}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(admin.email);
                                onShowToast('info', 'Correo copiado', admin.email);
                              }}
                              className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700"
                              title="Copiar correo"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Rol */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            admin.rol === 'Superadmin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : admin.rol === 'Veterinario'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : admin.rol === 'Coordinador'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            <span>{admin.rol}</span>
                          </span>
                        </td>

                        {/* Teléfono */}
                        <td className="p-4">
                          {admin.telefono ? (
                            <a
                              href={buildWhatsAppPhoneOnlyUrl(admin.telefono, `Hola ${admin.nombre}, te contacto desde la administración de Refugio DogHouse.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-emerald-700 font-medium transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{admin.telefono}</span>
                            </a>
                          ) : (
                            <span className="text-stone-400 italic">No registrado</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleAdminStatus(admin.id, admin.activo)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              admin.activo
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title="Haz clic para activar o suspender el acceso"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${admin.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{admin.activo ? 'Activo' : 'Suspendido'}</span>
                          </button>
                        </td>

                        {/* Último Acceso */}
                        <td className="p-4 text-stone-600 font-mono text-[11px]">
                          {admin.ultimo_acceso ? (
                            <div className="space-y-0.5">
                              <div>{new Date(admin.ultimo_acceso).toLocaleDateString()}</div>
                              <div className="text-[10px] text-stone-400">
                                {new Date(admin.ultimo_acceso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">Sin accesos aún</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const sqlSnippet = `SELECT public.guardar_admin(\n  '${admin.email}',\n  'NUEVA_CLAVE_AQUI',\n  '${admin.nombre}',\n  '${admin.rol}',\n  '${admin.telefono || ''}',\n  '${admin.cargo || 'Administrador de Refugio'}'\n);`;
                                navigator.clipboard.writeText(sqlSnippet);
                                onShowToast('info', 'SQL Copiado', `Sentencia para cambiar la contraseña de ${admin.nombre} copiada.`);
                              }}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                              title="Copiar SQL para actualizar contraseña"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteAdmin(admin.id, admin.nombre)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                              title="Eliminar administrador de Supabase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {adminsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-stone-400 text-xs">
                        <ShieldCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="font-bold text-stone-700">No hay administradores registrados aún en la tabla public.admins</p>
                        <p className="text-stone-500 text-[11px] mt-1">
                          Ejecuta el script SQL en Supabase para registrar el primer administrador o pulsa en &quot;Nuevo Administrador&quot;.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjeta Informativa sobre la Estructura de la Base de Datos */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Estructura de la Tabla public.admins en Supabase</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Columnas, tipos de datos y restricciones configuradas en PostgreSQL para garantizar la máxima seguridad:
                </p>
              </div>

              <button
                onClick={handleDownloadAdminTableSQL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar DDL .sql</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 font-bold block">id</strong>
                <span className="text-stone-500 text-[11px]">UUID PRIMARY KEY DEFAULT gen_random_uuid()</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-amber-800 font-bold block">email</strong>
                <span className="text-stone-500 text-[11px]">TEXT UNIQUE NOT NULL (Correo login)</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-amber-800 font-bold block">password_hash</strong>
                <span className="text-stone-500 text-[11px]">TEXT NOT NULL (Bcrypt / blowfish)</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 font-bold block">nombre</strong>
                <span className="text-stone-500 text-[11px]">TEXT NOT NULL (Nombre completo)</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 font-bold block">rol</strong>
                <span className="text-stone-500 text-[11px]">CHECK (rol IN (&apos;Superadmin&apos;, ...))</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 font-bold block">cargo</strong>
                <span className="text-stone-500 text-[11px]">TEXT (Puesto en el refugio)</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 font-bold block">telefono</strong>
                <span className="text-stone-500 text-[11px]">TEXT (WhatsApp / Contacto)</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 font-bold block">activo</strong>
                <span className="text-stone-500 text-[11px]">BOOLEAN NOT NULL DEFAULT true</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 font-bold block">ultimo_acceso</strong>
                <span className="text-stone-500 text-[11px]">TIMESTAMPTZ (Actualizado en cada login)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: SUPABASE & SQL CONFIG (FUENTE ÚNICA DE DATOS) */}
      {activeTab === 'sql_config' && (
        <div className="space-y-6">
          {/* Card de Conexión */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-600" />
                  <span>Configuración de Conexión a Supabase</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Supabase con PostgreSQL como fuente única de base de datos para DogHouse.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>Probar Conexión</span>
                </button>
              </div>
            </div>

            {/* Resultado de prueba de conexión */}
            {connectionStatus && (
              <div className={`p-4 rounded-2xl border text-xs font-medium flex items-start gap-3 ${
                connectionStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {connectionStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{connectionStatus.success ? 'Conexión Exitosa' : 'Aviso de Conexión'}</div>
                  <div className="mt-0.5 leading-relaxed">{connectionStatus.message}</div>
                </div>
              </div>
            )}

            {/* Formulario de Parámetros */}
            <form onSubmit={handleSaveSupabaseConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  VITE_SUPABASE_URL (Project URL)
                </label>
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://tu-proyecto.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  VITE_SUPABASE_ANON_KEY (Public Key)
                </label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500">
                  También puedes definir estas variables en tu archivo <code>.env</code> o secrets.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Guardar y Reconectar
                </button>
              </div>
            </form>
          </div>

          {/* Card del Editor SQL & Copia */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  Archivo SQL Completo para el Editor de Supabase
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Copia y pega este script en el <strong>SQL Editor</strong> de Supabase para crear todas las tablas, buckets y políticas RLS.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                    onShowToast('success', 'SQL Copiado', 'Esquema completo copiado al portapapeles.');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar SQL</span>
                </button>
                <button
                  onClick={handleDownloadSQL}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar .sql</span>
                </button>
              </div>
            </div>

            {/* Pasos en Supabase */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-2">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div className="font-bold text-amber-700 mb-1">1. Abrir Supabase</div>
                <p className="text-stone-500 text-[11px]">Ingresa a supabase.com y abre tu proyecto.</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div className="font-bold text-amber-700 mb-1">2. Ir a SQL Editor</div>
                <p className="text-stone-500 text-[11px]">En el menú lateral izquierdo, haz clic en SQL Editor.</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div className="font-bold text-amber-700 mb-1">3. Pegar el Script</div>
                <p className="text-stone-500 text-[11px]">Crea una New Query y pega el contenido copiado.</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div className="font-bold text-amber-700 mb-1">4. Presionar RUN</div>
                <p className="text-stone-500 text-[11px]">Ejecuta el script. Todas las tablas quedarán creadas.</p>
              </div>
            </div>

            <pre className="bg-stone-950 text-stone-200 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[500px] border border-stone-800 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* Card del Script de Creación de Admin */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-600" />
                  <span>Script SQL: Registrar Usuario Administrador</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ejecuta este script en Supabase SQL Editor para crear tu usuario administrador en <code>auth.users</code> con correo pre-confirmado.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(CREATE_ADMIN_SQL_SCRIPT);
                    onShowToast('success', 'Script de Admin Copiado', 'Copiado al portapapeles. Pégalo en SQL Editor de Supabase.');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Script Admin</span>
                </button>
                <button
                  onClick={handleDownloadAdminSQL}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar create_admin.sql</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
              <span className="font-bold block">💡 Nota sobre el script:</span>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                Este script utiliza la extensión <code>pgcrypto</code> para encriptar la contraseña con Bcrypt y marca <code>email_confirmed_at = now()</code>. Esto permite que el login funcione al instante en Supabase Auth sin necesidad de configurar servidores SMTP de envío de correos.
              </p>
            </div>

            <pre className="bg-stone-950 text-amber-300 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[380px] border border-stone-800 leading-relaxed">
              {CREATE_ADMIN_SQL_SCRIPT}
            </pre>
          </div>

          {/* Card del Script de la Tabla public.admins */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Script SQL: Tabla de Administradores (public.admins)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Crea la tabla <code>public.admins</code> con correo, contraseña encriptada (bcrypt), rol, cargo, teléfono y funciones de login seguro.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ADMIN_TABLE_SQL_SCRIPT);
                    onShowToast('success', 'Script Tabla Copiado', 'DDL de public.admins copiado al portapapeles.');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar SQL Tabla Admins</span>
                </button>
                <button
                  onClick={handleDownloadAdminTableSQL}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar admin_table.sql</span>
                </button>
              </div>
            </div>

            <pre className="bg-stone-950 text-emerald-300 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[380px] border border-stone-800 leading-relaxed">
              {ADMIN_TABLE_SQL_SCRIPT}
            </pre>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / CREAR PERRO (Hasta 5 fotos) */}
      {editingDog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-lg text-stone-900">
                {editingDog.id ? 'Editar Perro' : 'Nuevo Perro para Adopción'}
              </h3>
              <button onClick={() => setEditingDog(null)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveDog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editingDog.nombre || ''}
                    onChange={(e) => setEditingDog({ ...editingDog, nombre: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-300 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Edad</label>
                  <input
                    type="text"
                    value={editingDog.edad || ''}
                    onChange={(e) => setEditingDog({ ...editingDog, edad: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tamaño</label>
                  <select
                    value={editingDog.tamanio || 'Mediano'}
                    onChange={(e) => setEditingDog({ ...editingDog, tamanio: e.target.value as DogSize })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white outline-none"
                  >
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Género</label>
                  <select
                    value={editingDog.genero || 'Macho'}
                    onChange={(e) => setEditingDog({ ...editingDog, genero: e.target.value as 'Macho' | 'Hembra' })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white outline-none"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              {/* GESTOR DE HASTA 5 FOTOS POR ANIMAL */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-black text-stone-900 text-xs block flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>Galería de Fotos (Hasta 5 fotos por animal)</span>
                    </label>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      La primera foto es la portada principal del perrito.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-stone-500 bg-white px-2 py-1 rounded-lg border border-stone-200">
                    {editingDog.fotos ? editingDog.fotos.length : (editingDog.foto_url ? 1 : 0)} / 5
                  </span>
                </div>

                {/* Grid de Previews */}
                <div className="grid grid-cols-5 gap-2">
                  {editingDog.fotos?.map((fUrl, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100">
                      <img src={fUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-amber-600 text-white rounded p-0.5" title="Foto de Portada">
                          <Star className="w-3 h-3 fill-white" />
                        </span>
                      )}
                      <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryDogPhoto(idx)}
                            className="p-1 rounded bg-amber-500 hover:bg-amber-600 text-white"
                            title="Hacer Portada"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDogPhoto(idx)}
                          className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-white"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subir archivo o URL */}
                {(!editingDog.fotos || editingDog.fotos.length < 5) && (
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="Pegar URL de foto..."
                        className="flex-1 p-2 rounded-xl border border-stone-300 text-xs bg-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoByUrl}
                        className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs"
                      >
                        Añadir
                      </button>
                    </div>

                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-stone-300 hover:bg-white text-stone-600 cursor-pointer transition-colors text-xs font-semibold">
                      <Camera className="w-4 h-4 text-stone-500" />
                      <span>Subir fotos desde dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleDogPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Descripción de la Historia y Rescate</label>
                <textarea
                  value={editingDog.descripcion || ''}
                  onChange={(e) => setEditingDog({ ...editingDog, descripcion: e.target.value })}
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Estado</label>
                  <select
                    value={editingDog.estado || 'Disponible'}
                    onChange={(e) => setEditingDog({ ...editingDog, estado: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white outline-none"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Adoptado">Adoptado</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDog.urgente)}
                      onChange={(e) => setEditingDog({ ...editingDog, urgente: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-700">Caso Urgente</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingDog.vacunas)}
                    onChange={(e) => setEditingDog({ ...editingDog, vacunas: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>Vacunas al día</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingDog.esterilizado)}
                    onChange={(e) => setEditingDog({ ...editingDog, esterilizado: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>Esterilizado/a</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingDog(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Guardar Perro en Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / CREAR NECESIDAD */}
      {editingNeed && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-lg text-stone-900">
                {editingNeed.id ? 'Editar Insumo' : 'Nuevo Insumo o Necesidad'}
              </h3>
              <button onClick={() => setEditingNeed(null)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveNeed} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nombre del Insumo</label>
                <input
                  type="text"
                  value={editingNeed.nombre || ''}
                  onChange={(e) => setEditingNeed({ ...editingNeed, nombre: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Categoría</label>
                  <select
                    value={editingNeed.categoria || 'Comida'}
                    onChange={(e) => setEditingNeed({ ...editingNeed, categoria: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-white outline-none"
                  >
                    <option value="Comida">Comida</option>
                    <option value="Medicinas">Medicinas</option>
                    <option value="Materiales y Limpieza">Materiales y Limpieza</option>
                    <option value="Abrigo y Camas">Abrigo y Camas</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Unidad</label>
                  <input
                    type="text"
                    value={editingNeed.unidad || 'Sacos de 15kg'}
                    onChange={(e) => setEditingNeed({ ...editingNeed, unidad: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Meta Necesaria</label>
                  <input
                    type="number"
                    value={editingNeed.cantidad_meta || 10}
                    onChange={(e) => setEditingNeed({ ...editingNeed, cantidad_meta: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 rounded-xl border outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cantidad Actual</label>
                  <input
                    type="number"
                    value={editingNeed.cantidad_actual || 0}
                    onChange={(e) => setEditingNeed({ ...editingNeed, cantidad_actual: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingNeed.urgente)}
                    onChange={(e) => setEditingNeed({ ...editingNeed, urgente: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <span className="text-rose-700">Marcar como urgente</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingNeed(null)}
                  className="px-4 py-2.5 rounded-xl border font-bold text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Guardar en Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / CREAR EVENTO */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-lg text-stone-900">
                {editingEvent.id ? 'Editar Evento' : 'Nuevo Evento o Jornada'}
              </h3>
              <button onClick={() => setEditingEvent(null)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Título del Evento</label>
                <input
                  type="text"
                  value={editingEvent.titulo || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, titulo: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tipo</label>
                  <select
                    value={editingEvent.tipo || 'Evento Actual'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, tipo: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-white outline-none"
                  >
                    <option value="Evento Actual">Evento Actual</option>
                    <option value="Próximamente">Próximamente</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Fecha</label>
                  <input
                    type="text"
                    value={editingEvent.fecha || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, fecha: e.target.value })}
                    placeholder="Sábado 24 de Octubre, 2026"
                    required
                    className="w-full p-2.5 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Lugar</label>
                <input
                  type="text"
                  value={editingEvent.lugar || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, lugar: e.target.value })}
                  placeholder="Salinas, Malecón"
                  required
                  className="w-full p-2.5 rounded-xl border outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Foto del Afiche (URL)</label>
                <input
                  type="url"
                  value={editingEvent.foto_url || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, foto_url: e.target.value })}
                  placeholder="https://..."
                  required
                  className="w-full p-2.5 rounded-xl border outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Descripción Breve</label>
                <textarea
                  value={editingEvent.descripcion_corta || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, descripcion_corta: e.target.value })}
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl border font-bold text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Guardar Evento en Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSPECTOR DE COMPROBANTE DE DONACIÓN */}
      {inspectingVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-stone-900">Comprobante de Transferencia</h3>
                <p className="text-xs text-stone-500">
                  Ref: <span className="font-mono font-bold">{inspectingVoucher.numero_referencia}</span>
                </p>
              </div>
              <button onClick={() => setInspectingVoucher(null)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl overflow-hidden border border-stone-200 max-h-72 bg-stone-100 flex items-center justify-center">
                {inspectingVoucher.archivo_url ? (
                  <img
                    src={inspectingVoucher.archivo_url}
                    alt="Comprobante"
                    className="w-full h-full object-contain max-h-72"
                  />
                ) : (
                  <div className="p-8 text-stone-400">Sin archivo adjunto</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-stone-500 block">Donante:</span>
                  <strong className="text-stone-900">{inspectingVoucher.donante_nombre}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Monto:</span>
                  <strong className="text-emerald-700 text-sm font-mono">${Number(inspectingVoucher.monto).toFixed(2)} USD</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Banco de Origen:</span>
                  <strong className="text-stone-900">{inspectingVoucher.banco_origen}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Fecha:</span>
                  <strong className="text-stone-900">{inspectingVoucher.fecha_transferencia}</strong>
                </div>
              </div>

              {inspectingVoucher.comentarios && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-stone-700">
                  <span className="font-bold block text-amber-900 mb-0.5">Comentarios del donante:</span>
                  <p>{inspectingVoucher.comentarios}</p>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleUpdateVoucherStatus(inspectingVoucher.id, 'Verificado');
                      setInspectingVoucher(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Aprobar Verificado
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateVoucherStatus(inspectingVoucher.id, 'Rechazado');
                      setInspectingVoucher(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Rechazar
                  </button>
                </div>
                {inspectingVoucher.donante_telefono && (
                  <a
                    href={buildWhatsAppPhoneOnlyUrl(inspectingVoucher.donante_telefono, `Hola ${inspectingVoucher.donante_nombre}, confirmamos la recepción de tu donación a Refugio DogHouse. ¡Muchas gracias!`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL REGISTRAR ADMINISTRADOR Y GENERADOR DE CONSULTA SQL */}
      {newAdminForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-stone-900">Registrar Administrador</h3>
                  <p className="text-xs text-stone-500">
                    Almacena las credenciales en la tabla <code>public.admins</code> de Supabase
                  </p>
                </div>
              </div>
              <button onClick={() => setNewAdminForm(null)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newAdminForm.nombre}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, nombre: e.target.value })}
                    placeholder="Ej. Dr. Andrés Zambrano"
                    className="w-full p-2.5 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cargo / Función</label>
                  <input
                    type="text"
                    value={newAdminForm.cargo}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, cargo: e.target.value })}
                    placeholder="Ej. Coordinador Veterinario"
                    className="w-full p-2.5 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Correo Electrónico (Login)</label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="admin.usuario@refugiodoghouse.ec"
                  className="w-full p-2.5 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contraseña de Acceso</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full p-2.5 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Rol</label>
                  <select
                    value={newAdminForm.rol}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, rol: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 outline-none bg-white font-medium"
                  >
                    <option value="Superadmin">Superadmin (Acceso Total)</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Veterinario">Veterinario</option>
                    <option value="Coordinador">Coordinador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Teléfono / WhatsApp (Opcional)</label>
                <input
                  type="tel"
                  value={newAdminForm.telefono}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, telefono: e.target.value })}
                  placeholder="0997948588"
                  className="w-full p-2.5 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Sentencia SQL Generada en tiempo real */}
              <div className="p-3 rounded-2xl bg-stone-900 text-stone-200 space-y-1.5 border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-wider">
                    Sentencia SQL para Supabase SQL Editor:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sql = `SELECT public.guardar_admin(\n  '${newAdminForm.email || 'correo@ejemplo.com'}',\n  '${newAdminForm.password || 'password123'}',\n  '${newAdminForm.nombre || 'Nombre Admin'}',\n  '${newAdminForm.rol}',\n  '${newAdminForm.telefono || ''}',\n  '${newAdminForm.cargo || 'Administrador de Refugio'}'\n);`;
                      navigator.clipboard.writeText(sql);
                      onShowToast('success', 'SQL Copiado', 'Sentencia SQL copiada para ejecutar en Supabase.');
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-white bg-stone-800 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar SQL</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-stone-300 overflow-x-auto whitespace-pre-wrap leading-tight">
                  {`SELECT public.guardar_admin(
  '${newAdminForm.email || 'correo@ejemplo.com'}',
  '${newAdminForm.password ? '••••••••' : 'password_aqui'}',
  '${newAdminForm.nombre || 'Nombre Admin'}',
  '${newAdminForm.rol}',
  '${newAdminForm.telefono || '0997948588'}',
  '${newAdminForm.cargo || 'Administrador de Refugio'}'
);`}
                </pre>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setNewAdminForm(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const sql = `SELECT public.guardar_admin(\n  '${newAdminForm.email || 'correo@ejemplo.com'}',\n  '${newAdminForm.password || 'password123'}',\n  '${newAdminForm.nombre || 'Nombre Admin'}',\n  '${newAdminForm.rol}',\n  '${newAdminForm.telefono || ''}',\n  '${newAdminForm.cargo || 'Administrador de Refugio'}'\n);`;
                      navigator.clipboard.writeText(sql);
                      onShowToast('success', 'SQL Copiado', 'Pégalo en el SQL Editor de Supabase y pulsa Run.');
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar en Supabase</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
