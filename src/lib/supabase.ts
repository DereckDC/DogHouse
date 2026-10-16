import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Perro,
  InsumoNecesidad,
  ComprobanteDonacion,
  EventoRefugio,
  PerroPerdidoReporte,
  AdopcionFormValues,
  ApadrinamientoFormValues,
  VoluntariadoFormValues,
  AdminUser,
  HistoriaMes,
  ContactoVoluntariado,
  RefugioConfig,
  CuentaBancaria,
} from '../types';

/**
 * =======================================================================
 * CONFIGURACIÓN DINÁMICA DE SUPABASE (DogHouse Refugio)
 * =======================================================================
 * Lee las credenciales de:
 * 1. Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 * 2. O configuración guardada dinámicamente desde el panel de administración
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_CONFIG_KEY = 'doghouse_supabase_config';

/**
 * Normaliza la URL del proyecto de Supabase para evitar errores como
 * incluir '/rest/v1/' o barras finales que impiden llamadas SDK.
 */
export function cleanSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/(rest|auth|graphql|storage)\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

export function cleanSupabaseAnonKey(rawKey?: string): string {
  if (!rawKey) return '';
  return rawKey.trim();
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const local = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.url && parsed.anonKey) {
        return {
          url: cleanSupabaseUrl(parsed.url),
          anonKey: cleanSupabaseAnonKey(parsed.anonKey),
        };
      }
    }
  } catch (err) {
    console.error('Error reading Supabase config from storage:', err);
  }

  const envUrl = 
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    (typeof process !== 'undefined' ? (process.env as any)?.VITE_SUPABASE_URL : '') ||
    '';
  const envKey = 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? (process.env as any)?.VITE_SUPABASE_ANON_KEY : '') ||
    '';

  return {
    url: cleanSupabaseUrl(envUrl),
    anonKey: cleanSupabaseAnonKey(envKey),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = cleanSupabaseAnonKey(anonKey);
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  initClient(cleanUrl, cleanKey);
  window.dispatchEvent(new Event('doghouse_supabase_config_changed'));
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
  const cfg = getSupabaseConfig();
  initClient(cfg.url, cfg.anonKey);
  window.dispatchEvent(new Event('doghouse_supabase_config_changed'));
}

// Instancia reactiva del cliente Supabase
const currentConfig = getSupabaseConfig();

export let supabase: SupabaseClient = createClient(
  currentConfig.url || 'https://placeholder.supabase.co',
  currentConfig.anonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

function initClient(url: string, key: string) {
  const finalUrl = cleanSupabaseUrl(url) || 'https://placeholder.supabase.co';
  const finalKey = cleanSupabaseAnonKey(key) || 'placeholder';
  supabase = createClient(finalUrl, finalKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const isSupabaseConfigured = (): boolean => {
  const cfg = getSupabaseConfig();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('http') &&
    !cfg.url.includes('placeholder') &&
    !cfg.url.includes('tu-proyecto')
  );
};

/**
 * Prueba la conectividad real con Supabase consultando la tabla 'perros'
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  count?: number;
  adminsCount?: number;
}> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'No se han configurado la URL y Anon Key válidas de Supabase.',
      };
    }

    const [perrosRes, adminsRes] = await Promise.all([
      supabase.from('perros').select('*', { count: 'exact', head: true }),
      supabase.from('admins').select('*', { count: 'exact', head: true }),
    ]);

    if (perrosRes.error && adminsRes.error) {
      return {
        success: false,
        message: `Error de conexión: ${perrosRes.error.message || adminsRes.error.message}`,
      };
    }

    const perrosCount = perrosRes.count ?? 0;
    const adminsCount = adminsRes.count ?? 0;

    return {
      success: true,
      message: `Conexión activa a Supabase. Tablas detectadas exitosamente (${perrosCount} perros y ${adminsCount} administradores en la base de datos).`,
      count: perrosCount,
      adminsCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error de red o CORS al contactar el servidor de Supabase.',
    };
  }
}

/**
 * =======================================================================
 * CONFIGURACIÓN INSTITUCIONAL DEL REFUGIO (Tabla public.configuracion_refugio)
 * =======================================================================
 */
export const DEFAULT_REFUGIO_CONFIG: RefugioConfig = {
  id: 'doghouse_main',
  nombre: 'Refugio DogHouse',
  telefono: '593997948588',
  telefono_display: '0997948588',
  email: 'doghousesalinas@gmail.com',
  ubicacion: 'Salinas, Santa Elena, Ecuador',
  horarios: 'Lunes a Domingo: 10:00 AM - 01:00 PM',
  politica_entrega: 'La entrega de perritos se hace directamente en el refugio (Salinas).',
  redes: {
    instagram: 'https://www.instagram.com/doghousesalinas.ec?stkn=cmo1MzBhcnFxa2g4',
    facebook: 'https://www.facebook.com/share/1HDs2WsGbF/',
    tiktok: 'https://www.tiktok.com/@refugiodoghousesalinas?_r=1&_t=ZS-99j6KTPCCt3',
    paypal: 'https://www.paypal.com/paypalme/Doghousesalinas',
  },
  cuentas_bancarias: [
    {
      banco: 'Banco Pichincha',
      tipo: 'Cuenta de Ahorros',
      numero: '2209081738',
      titular: 'Yeimmy Jesús Piguave Perero',
      identificacion: '0928389253',
      email: 'doghousesalinas@gmail.com',
      color: 'border-yellow-400 bg-yellow-50/40',
      tag: 'Ahorro Pichincha',
    },
    {
      banco: 'Banco del Pacífico',
      tipo: 'Cuenta de Ahorros',
      numero: '1056329695',
      titular: 'Yeimmy Jesús Piguave Perero',
      identificacion: '0928389253',
      email: 'doghousesalinas@gmail.com',
      color: 'border-blue-400 bg-blue-50/40',
      tag: 'Ahorro Pacífico',
    },
    {
      banco: 'Banco Guayaquil',
      tipo: 'Cuenta de Ahorros',
      numero: '0034356836',
      titular: 'Ariel Enrique Roman Lainez',
      identificacion: '0922691365',
      email: 'doghousesalinas@gmail.com',
      color: 'border-pink-400 bg-pink-50/40',
      tag: 'Ahorro Guayaquil',
    },
  ],
  historia_mes: {
    titulo: 'Historia del Mes',
    subtitulo: 'Rescatados con amor',
    frase: '"No cambias el mundo adoptando un perro, pero para ese perro su mundo cambiará por siempre."',
    foto_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
    perros_cuidados_texto: 'Perros bajo nuestro cuidado',
    perros_cuidados_subtexto: 'Alimentados, cuidados y amados a diario',
  },
  contacto_voluntariado: {
    nombre: 'Ariel',
    cargo: 'Coordinador General de Voluntariado y Bienestar Canino',
    ubicacion: 'Refugio DogHouse (Salinas / Santa Elena)',
    telefono: '0997948588',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    horarios_dias: 'Sábados y Domingos',
    horarios_horas: '09:00 AM a 01:30 PM',
    horarios_detalle: 'Jornadas entre semana previa cita',
  },
};

export const INITIAL_CONTACTO_VOLUNTARIADO = DEFAULT_REFUGIO_CONFIG.contacto_voluntariado;
export const INITIAL_HISTORIA_MES = DEFAULT_REFUGIO_CONFIG.historia_mes;

const STORAGE_REFUGIO_CONFIG_KEY = 'doghouse_refugio_config_cached';

export const ShelterConfigService = {
  getSync(): RefugioConfig {
    try {
      const cached = localStorage.getItem(STORAGE_REFUGIO_CONFIG_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return DEFAULT_REFUGIO_CONFIG;
  },

  async get(): Promise<RefugioConfig> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('configuracion_refugio')
          .select('*')
          .eq('id', 'doghouse_main')
          .maybeSingle();

        if (error) {
          console.warn('Advertencia consultando configuracion_refugio:', error.message);
        } else if (data) {
          const cfg: RefugioConfig = {
            id: data.id,
            nombre: data.nombre || DEFAULT_REFUGIO_CONFIG.nombre,
            telefono: data.telefono || DEFAULT_REFUGIO_CONFIG.telefono,
            telefono_display: data.telefono_display || DEFAULT_REFUGIO_CONFIG.telefono_display,
            email: data.email || DEFAULT_REFUGIO_CONFIG.email,
            ubicacion: data.ubicacion || DEFAULT_REFUGIO_CONFIG.ubicacion,
            horarios: data.horarios || DEFAULT_REFUGIO_CONFIG.horarios,
            politica_entrega: data.politica_entrega || DEFAULT_REFUGIO_CONFIG.politica_entrega,
            redes: {
              instagram: data.instagram || DEFAULT_REFUGIO_CONFIG.redes.instagram,
              facebook: data.facebook || DEFAULT_REFUGIO_CONFIG.redes.facebook,
              tiktok: data.tiktok || DEFAULT_REFUGIO_CONFIG.redes.tiktok,
              paypal: data.paypal || DEFAULT_REFUGIO_CONFIG.redes.paypal,
            },
            cuentas_bancarias: Array.isArray(data.cuentas_bancarias) && data.cuentas_bancarias.length > 0
              ? data.cuentas_bancarias
              : DEFAULT_REFUGIO_CONFIG.cuentas_bancarias,
            historia_mes: {
              titulo: data.historia_titulo || DEFAULT_REFUGIO_CONFIG.historia_mes.titulo,
              subtitulo: data.historia_subtitulo || DEFAULT_REFUGIO_CONFIG.historia_mes.subtitulo,
              frase: data.historia_frase || DEFAULT_REFUGIO_CONFIG.historia_mes.frase,
              foto_url: data.historia_foto_url || DEFAULT_REFUGIO_CONFIG.historia_mes.foto_url,
              perros_cuidados_texto: data.historia_perros_cuidados_texto || DEFAULT_REFUGIO_CONFIG.historia_mes.perros_cuidados_texto,
              perros_cuidados_subtexto: data.historia_perros_cuidados_subtexto || DEFAULT_REFUGIO_CONFIG.historia_mes.perros_cuidados_subtexto,
            },
            contacto_voluntariado: {
              nombre: data.contacto_voluntario_nombre || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.nombre,
              cargo: data.contacto_voluntario_cargo || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.cargo,
              ubicacion: data.contacto_voluntario_ubicacion || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.ubicacion,
              telefono: data.contacto_voluntario_telefono || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.telefono,
              foto_url: data.contacto_voluntario_foto_url || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.foto_url,
              horarios_dias: data.contacto_voluntario_horarios_dias || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.horarios_dias,
              horarios_horas: data.contacto_voluntario_horarios_horas || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.horarios_horas,
              horarios_detalle: data.contacto_voluntario_horarios_detalle || DEFAULT_REFUGIO_CONFIG.contacto_voluntariado.horarios_detalle,
            },
            updated_at: data.updated_at,
          };

          try {
            localStorage.setItem(STORAGE_REFUGIO_CONFIG_KEY, JSON.stringify(cfg));
          } catch (e) {}
          return cfg;
        }
      } catch (err) {
        console.error('Error cargando configuración del refugio desde Supabase:', err);
      }
    }

    return this.getSync();
  },

  async update(partial: Partial<RefugioConfig>): Promise<RefugioConfig> {
    const current = await this.get();
    const updated: RefugioConfig = {
      ...current,
      ...partial,
      redes: { ...current.redes, ...(partial.redes || {}) },
      historia_mes: { ...current.historia_mes, ...(partial.historia_mes || {}) },
      contacto_voluntariado: { ...current.contacto_voluntariado, ...(partial.contacto_voluntariado || {}) },
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const dbPayload = {
        id: 'doghouse_main',
        nombre: updated.nombre,
        telefono: updated.telefono,
        telefono_display: updated.telefono_display,
        email: updated.email,
        ubicacion: updated.ubicacion,
        horarios: updated.horarios,
        politica_entrega: updated.politica_entrega,
        instagram: updated.redes.instagram,
        facebook: updated.redes.facebook,
        tiktok: updated.redes.tiktok,
        paypal: updated.redes.paypal,
        cuentas_bancarias: updated.cuentas_bancarias,
        historia_titulo: updated.historia_mes.titulo,
        historia_subtitulo: updated.historia_mes.subtitulo || '',
        historia_frase: updated.historia_mes.frase,
        historia_foto_url: updated.historia_mes.foto_url,
        historia_perros_cuidados_texto: updated.historia_mes.perros_cuidados_texto || '',
        historia_perros_cuidados_subtexto: updated.historia_mes.perros_cuidados_subtexto || '',
        contacto_voluntario_nombre: updated.contacto_voluntariado.nombre,
        contacto_voluntario_cargo: updated.contacto_voluntariado.cargo,
        contacto_voluntario_ubicacion: updated.contacto_voluntariado.ubicacion,
        contacto_voluntario_telefono: updated.contacto_voluntariado.telefono,
        contacto_voluntario_foto_url: updated.contacto_voluntariado.foto_url,
        contacto_voluntario_horarios_dias: updated.contacto_voluntariado.horarios_dias || '',
        contacto_voluntario_horarios_horas: updated.contacto_voluntariado.horarios_horas || '',
        contacto_voluntario_horarios_detalle: updated.contacto_voluntariado.horarios_detalle || '',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('configuracion_refugio')
        .upsert(dbPayload, { onConflict: 'id' });

      if (error) {
        console.error('Error guardando configuracion_refugio en Supabase:', error);
        throw new Error(error.message);
      }
    }

    try {
      localStorage.setItem(STORAGE_REFUGIO_CONFIG_KEY, JSON.stringify(updated));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('doghouse_refugio_config_updated', { detail: updated }));
    window.dispatchEvent(new CustomEvent('doghouse_historia_mes_updated', { detail: updated.historia_mes }));
    window.dispatchEvent(new CustomEvent('doghouse_contacto_voluntariado_updated', { detail: updated.contacto_voluntariado }));
    return updated;
  },
};

export const HistoriaMesService = {
  get(): HistoriaMes {
    return ShelterConfigService.getSync().historia_mes;
  },

  async update(data: Partial<HistoriaMes>): Promise<HistoriaMes> {
    if (isSupabaseConfigured()) {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('actualizar_historia_mes', {
          p_titulo: data.titulo,
          p_subtitulo: data.subtitulo || '',
          p_frase: data.frase,
          p_foto_url: data.foto_url,
          p_perros_texto: data.perros_cuidados_texto || '',
          p_perros_subtexto: data.perros_cuidados_subtexto || '',
        });

        if (!rpcError && rpcData) {
          const currentCfg = ShelterConfigService.getSync();
          const updatedCfg = {
            ...currentCfg,
            historia_mes: {
              ...currentCfg.historia_mes,
              ...data,
            },
          };
          try {
            localStorage.setItem(STORAGE_REFUGIO_CONFIG_KEY, JSON.stringify(updatedCfg));
          } catch (e) {}
          window.dispatchEvent(new CustomEvent('doghouse_historia_mes_updated', { detail: updatedCfg.historia_mes }));
          return updatedCfg.historia_mes;
        }
      } catch (e) {
        // Fallback a ShelterConfigService.update estándar
      }
    }

    const currentCfg = await ShelterConfigService.get();
    const updatedCfg = await ShelterConfigService.update({
      historia_mes: { ...currentCfg.historia_mes, ...data },
    });
    return updatedCfg.historia_mes;
  },
};

export const ContactoVoluntariadoService = {
  get(): ContactoVoluntariado {
    return ShelterConfigService.getSync().contacto_voluntariado;
  },

  async update(data: Partial<ContactoVoluntariado>): Promise<ContactoVoluntariado> {
    const currentCfg = await ShelterConfigService.get();
    const updatedCfg = await ShelterConfigService.update({
      contacto_voluntariado: { ...currentCfg.contacto_voluntariado, ...data },
    });
    return updatedCfg.contacto_voluntariado;
  },
};

/**
 * =======================================================================
 * SERVICIO 1: PERROS (Catálogo de Adopciones con Supabase)
 * =======================================================================
 */
export const DogService = {
  async getAll(): Promise<Perro[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('perros')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase DogService.getAll warning:', error.message);
          return [];
        } else if (data) {
          return data.map((d: any) => ({
            ...d,
            fotos: Array.isArray(d.fotos) && d.fotos.length > 0 ? d.fotos : [d.foto_url].filter(Boolean),
          }));
        }
      } catch (err) {
        console.error('Error fetching dogs from Supabase:', err);
        return [];
      }
    }
    return [];
  },

  async getById(id: string): Promise<Perro | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('perros')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.warn('Supabase DogService.getById error:', error.message);
        } else if (data) {
          return {
            ...data,
            fotos: Array.isArray(data.fotos) && data.fotos.length > 0 ? data.fotos : [data.foto_url].filter(Boolean),
          };
        }
      } catch (err) {
        console.error('Error fetching dog by id from Supabase:', err);
      }
    }
    const dogs = await DogService.getAll();
    return dogs.find((d) => d.id === id) || null;
  },

  async create(nuevoPerro: Omit<Perro, 'id' | 'created_at'>): Promise<Perro> {
    let fotos = nuevoPerro.fotos && nuevoPerro.fotos.length > 0
      ? nuevoPerro.fotos
      : (nuevoPerro.foto_url ? [nuevoPerro.foto_url] : []);
    fotos = fotos.slice(0, 5);

    const payload = {
      nombre: nuevoPerro.nombre,
      edad: nuevoPerro.edad,
      tamanio: nuevoPerro.tamanio,
      genero: nuevoPerro.genero,
      vacunas: Boolean(nuevoPerro.vacunas),
      esterilizado: Boolean(nuevoPerro.esterilizado),
      foto_url: fotos[0] || nuevoPerro.foto_url || '',
      fotos,
      descripcion: nuevoPerro.descripcion || '',
      personalidad: nuevoPerro.personalidad || ['Cariñoso'],
      urgente: Boolean(nuevoPerro.urgente),
      estado: nuevoPerro.estado || 'Disponible',
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('perros')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating dog:', error);
        throw new Error(error.message);
      }
      return data;
    }

    const fallbackDog: Perro = {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : 'dog-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    return fallbackDog;
  },

  async update(id: string, cambios: Partial<Perro>): Promise<Perro | null> {
    const payload: any = { ...cambios };
    if (payload.fotos) {
      payload.fotos = payload.fotos.slice(0, 5);
      if (!payload.foto_url && payload.fotos[0]) {
        payload.foto_url = payload.fotos[0];
      }
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('perros')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase error updating dog:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return { id, ...cambios } as Perro;
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('perros')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting dog:', error);
        throw new Error(error.message);
      }
      return true;
    }
    return true;
  },
};

/**
 * =======================================================================
 * SERVICIO 2: NECESIDADES E INSUMOS (Supabase)
 * =======================================================================
 */
export const NeedsService = {
  async getAll(): Promise<InsumoNecesidad[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('necesidades')
          .select('*')
          .order('urgente', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase NeedsService.getAll warning:', error.message);
          return [];
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.error('Error fetching needs from Supabase:', err);
        return [];
      }
    }
    return [];
  },

  async create(necesidad: Omit<InsumoNecesidad, 'id'>): Promise<InsumoNecesidad> {
    const payload = {
      categoria: necesidad.categoria,
      nombre: necesidad.nombre,
      descripcion: necesidad.descripcion,
      cantidad_meta: Number(necesidad.cantidad_meta),
      cantidad_actual: Number(necesidad.cantidad_actual || 0),
      unidad: necesidad.unidad,
      prioridad: necesidad.prioridad || 'Media',
      urgente: Boolean(necesidad.urgente),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('necesidades')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating need:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : 'nec-' + Date.now(),
    };
  },

  async update(id: string, cambios: Partial<InsumoNecesidad>): Promise<InsumoNecesidad | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('necesidades')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase error updating need:', error);
        throw new Error(error.message);
      }
      return data;
    }
    return { id, ...cambios } as InsumoNecesidad;
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('necesidades')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting need:', error);
        throw new Error(error.message);
      }
      return true;
    }
    return true;
  },
};

/**
 * =======================================================================
 * SERVICIO 3: COMPROBANTES DE DONACIÓN (Supabase Tables + Storage)
 * =======================================================================
 */
export const DonationService = {
  async getAll(): Promise<ComprobanteDonacion[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('comprobantes_donacion')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase DonationService.getAll warning:', error.message);
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.error('Error fetching vouchers from Supabase:', err);
      }
    }
    return [];
  },

  async submitVoucher(comprobante: Omit<ComprobanteDonacion, 'id' | 'created_at' | 'estado'>): Promise<ComprobanteDonacion> {
    const payload = {
      donante_nombre: comprobante.donante_nombre,
      donante_email: comprobante.donante_email || null,
      donante_telefono: comprobante.donante_telefono || null,
      monto: Number(comprobante.monto),
      banco_origen: comprobante.banco_origen,
      numero_referencia: comprobante.numero_referencia,
      fecha_transferencia: comprobante.fecha_transferencia,
      archivo_url: comprobante.archivo_url,
      archivo_nombre: comprobante.archivo_nombre,
      estado: 'Pendiente',
      comentarios: comprobante.comentarios || null,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('comprobantes_donacion')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error submitting voucher:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : 'comp-' + Date.now(),
      created_at: new Date().toISOString(),
      estado: 'Pendiente',
    };
  },

  async updateStatus(id: string, nuevoEstado: 'Pendiente' | 'Verificado' | 'Rechazado'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('comprobantes_donacion')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating voucher status:', error);
        throw new Error(error.message);
      }
    }
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('comprobantes_donacion')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting voucher:', error);
        throw new Error(error.message);
      }
      return true;
    }
    return true;
  },
};

/**
 * =======================================================================
 * SERVICIO 4: EVENTOS DEL REFUGIO (Supabase)
 * =======================================================================
 */
export const EventsService = {
  async getAll(): Promise<EventoRefugio[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase EventsService.getAll warning:', error.message);
          return [];
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.error('Error fetching events from Supabase:', err);
        return [];
      }
    }
    return [];
  },

  async create(evento: Omit<EventoRefugio, 'id'>): Promise<EventoRefugio> {
    const payload = {
      titulo: evento.titulo,
      tipo: evento.tipo,
      fecha: evento.fecha,
      hora: evento.hora,
      lugar: evento.lugar,
      descripcion_corta: evento.descripcion_corta,
      descripcion_completa: evento.descripcion_completa,
      foto_url: evento.foto_url,
      requisitos: evento.requisitos || [],
      destacado: Boolean(evento.destacado),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('eventos')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating event:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : 'ev-' + Date.now(),
    };
  },

  async update(id: string, cambios: Partial<EventoRefugio>): Promise<EventoRefugio | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('eventos')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase error updating event:', error);
        throw new Error(error.message);
      }
      return data;
    }
    return { id, ...cambios } as EventoRefugio;
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting event:', error);
        throw new Error(error.message);
      }
      return true;
    }
    return true;
  },
};

/**
 * =======================================================================
 * SERVICIO 5: PERROS PERDIDOS (Supabase)
 * =======================================================================
 */
export const LostDogsService = {
  async getAll(): Promise<PerroPerdidoReporte[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('perros_perdidos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase LostDogsService.getAll warning:', error.message);
          return [];
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.error('Error fetching lost dogs from Supabase:', err);
        return [];
      }
    }
    return [];
  },

  async create(reporte: Omit<PerroPerdidoReporte, 'id' | 'created_at'>): Promise<PerroPerdidoReporte> {
    const payload = {
      nombre_perro: reporte.nombre_perro,
      fecha_perdido: reporte.fecha_perdido,
      foto_url: reporte.foto_url,
      ubicacion_ultima_vez: reporte.ubicacion_ultima_vez,
      maps_url: reporte.maps_url,
      informacion_relevante: reporte.informacion_relevante,
      contacto_nombre: reporte.contacto_nombre,
      contacto_telefono: reporte.contacto_telefono,
      recompensa: reporte.recompensa || null,
      estado: reporte.estado || 'Buscando',
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('perros_perdidos')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating lost dog report:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : 'lost-' + Date.now(),
      created_at: new Date().toISOString(),
    };
  },

  async update(id: string, cambios: Partial<PerroPerdidoReporte>): Promise<PerroPerdidoReporte> {
    const payload: any = { ...cambios };
    delete payload.id;
    delete payload.created_at;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('perros_perdidos')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase error updating lost dog:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return { id, ...cambios } as PerroPerdidoReporte;
  },

  async updateStatus(id: string, nuevoEstado: 'Buscando' | 'Reunido con familia'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('perros_perdidos')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating lost dog status:', error);
        throw new Error(error.message);
      }
    }
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('perros_perdidos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting lost dog report:', error);
        throw new Error(error.message);
      }
      return true;
    }
    return true;
  },
};

/**
 * =======================================================================
 * SERVICIO 6: SOLICITUDES DE LA COMUNIDAD (Adopción, Padrinos, Voluntarios)
 * =======================================================================
 */
export const SubmissionsService = {
  // 1. ADOPCIONES
  async saveAdopcion(data: AdopcionFormValues): Promise<void> {
    const payload = {
      perro_id: data.perro_id?.startsWith('dog-') ? null : (data.perro_id || null),
      perro_nombre: data.perro_nombre,
      nombre: data.nombre,
      apellido: data.apellido,
      edad: Number(data.edad),
      provincia: data.provincia,
      canton: data.canton,
      telefono: data.telefono,
      email: data.email || null,
      vivienda_tipo: data.vivienda_tipo || null,
      tiene_otras_mascotas: Boolean(data.tiene_otras_mascotas),
      motivo: data.motivo || null,
      estado: 'Pendiente',
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_adopcion')
        .insert([payload]);

      if (error) {
        console.error('Supabase error saving adopcion:', error);
        throw new Error(error.message);
      }
      return;
    }
  },

  async getAdopciones(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('solicitudes_adopcion')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase getAdopciones warning:', error.message);
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.error('Error fetching adopciones from Supabase:', err);
      }
    }
    return [];
  },

  async updateAdopcionStatus(id: string, nuevoEstado: 'Pendiente' | 'En Revisión' | 'Aprobada' | 'Rechazada'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_adopcion')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating adopcion status:', error);
        throw new Error(error.message);
      }
    }
  },

  async deleteAdopcion(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_adopcion')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting adopcion:', error);
        throw new Error(error.message);
      }
    }
    return true;
  },

  // 2. APADRINAMIENTO
  async saveApadrinamiento(data: ApadrinamientoFormValues): Promise<void> {
    const payload = {
      perro_id: data.perro_id?.startsWith('dog-') ? null : (data.perro_id || null),
      perro_nombre: data.perro_nombre || 'Refugio General',
      nombre: data.nombre,
      apellido: data.apellido,
      edad: Number(data.edad),
      provincia: data.provincia,
      canton: data.canton,
      telefono: data.telefono,
      email: data.email,
      monto_mensual: Number(data.monto_mensual),
      plan: data.plan,
      estado: 'Activo',
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_apadrinamiento')
        .insert([payload]);

      if (error) {
        console.error('Supabase error saving apadrinamiento:', error);
        throw new Error(error.message);
      }
      return;
    }
  },

  async getApadrinamientos(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('solicitudes_apadrinamiento')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase getApadrinamientos warning:', error.message);
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.error('Error fetching apadrinamientos from Supabase:', err);
      }
    }
    return [];
  },

  async updateApadrinamientoStatus(id: string, nuevoEstado: 'Activo' | 'Pausado' | 'Finalizado'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_apadrinamiento')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating apadrinamiento status:', error);
        throw new Error(error.message);
      }
    }
  },

  async deleteApadrinamiento(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_apadrinamiento')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting apadrinamiento:', error);
        throw new Error(error.message);
      }
    }
    return true;
  },

  // 3. VOLUNTARIADO
  async saveVoluntariado(data: VoluntariadoFormValues): Promise<void> {
    const payload = {
      nombre: data.nombre,
      apellido: data.apellido,
      edad: Number(data.edad),
      provincia: data.provincia,
      canton: data.canton,
      telefono: data.telefono,
      email: data.email,
      rol_interes: data.rol_interes,
      disponibilidad: data.disponibilidad,
      experiencia_previa: data.experiencia_previa || null,
      estado: 'Pendiente',
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_voluntariado')
        .insert([payload]);

      if (error) {
        console.error('Supabase error saving voluntariado:', error);
        throw new Error(error.message);
      }
      return;
    }
  },

  async getVoluntariados(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('solicitudes_voluntariado')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase getVoluntariados warning:', error.message);
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.error('Error fetching voluntariados from Supabase:', err);
      }
    }
    return [];
  },

  async updateVoluntariadoStatus(id: string, nuevoEstado: 'Pendiente' | 'Aceptado' | 'Contactado' | 'Inactivo'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_voluntariado')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating voluntariado status:', error);
        throw new Error(error.message);
      }
    }
  },

  async deleteVoluntariado(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('solicitudes_voluntariado')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting voluntariado:', error);
        throw new Error(error.message);
      }
    }
    return true;
  },
};

/**
 * =======================================================================
 * SERVICIO 7: ADMINISTRADORES DEL REFUGIO (Tabla public.admins en Supabase)
 * =======================================================================
 */
export const AdminUserService = {
  async login(emailInput: string, passwordInput: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase no está configurado aún. Configura las variables de entorno o la conexión en el panel.',
      };
    }

    try {
      // 1. Intentar verificación mediante la función RPC segura verificar_admin
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('verificar_admin', {
          p_email: cleanEmail,
          p_password: cleanPass,
        });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return {
          success: true,
          user: rpcData[0] as AdminUser,
        };
      }

      // 2. Intentar consulta directa a la tabla public.admins
      const { data: adminRows, error: selectError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .eq('activo', true)
        .maybeSingle();

      if (!selectError && adminRows) {
        const matches =
          adminRows.password_hash === cleanPass ||
          adminRows.password === cleanPass;

        if (matches) {
          await supabase.from('admins').update({ ultimo_acceso: new Date().toISOString() }).eq('id', adminRows.id);
          return {
            success: true,
            user: {
              id: adminRows.id,
              email: adminRows.email,
              nombre: adminRows.nombre,
              rol: adminRows.rol,
              cargo: adminRows.cargo || 'Administrador de Refugio',
              telefono: adminRows.telefono,
              activo: adminRows.activo,
              ultimo_acceso: new Date().toISOString(),
              created_at: adminRows.created_at,
              updated_at: adminRows.updated_at,
            },
          };
        }
      }

      // 3. Fallback: Probar con Supabase Auth auth.users
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!authError && authData?.user) {
        const metadata = authData.user.user_metadata || {};
        return {
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email || cleanEmail,
            nombre: metadata.nombre || 'Administrador General',
            rol: metadata.rol || 'Superadmin',
            cargo: metadata.cargo || 'Administrador de Refugio',
            telefono: metadata.telefono || '0997948588',
            activo: true,
            ultimo_acceso: new Date().toISOString(),
          },
        };
      }

      return {
        success: false,
        error: 'Credenciales inválidas. Verifica tu correo y contraseña registrados en la base de datos de Supabase.',
      };
    } catch (err: any) {
      console.error('Error en autenticación de admin:', err);
      return {
        success: false,
        error: err.message || 'Error de conexión al verificar credenciales con Supabase.',
      };
    }
  },

  async getAll(): Promise<AdminUser[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('id, email, nombre, rol, cargo, telefono, activo, ultimo_acceso, created_at, updated_at')
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data as AdminUser[];
        }
      } catch (err) {
        console.error('Error obteniendo administradores:', err);
      }
    }
    return [];
  },

  async create(admin: { email: string; password: string; nombre: string; rol: string; telefono?: string; cargo?: string }): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase no está configurado');

    const { error: rpcError } = await supabase.rpc('guardar_admin', {
      p_email: admin.email.trim().toLowerCase(),
      p_password: admin.password.trim(),
      p_nombre: admin.nombre.trim(),
      p_rol: admin.rol || 'Superadmin',
      p_telefono: admin.telefono?.trim() || null,
      p_cargo: admin.cargo?.trim() || 'Administrador de Refugio',
    });

    if (rpcError) {
      // Fallback a inserción directa en public.admins
      const { error: insertError } = await supabase.from('admins').insert([{
        email: admin.email.trim().toLowerCase(),
        password_hash: admin.password.trim(),
        password: admin.password.trim(),
        nombre: admin.nombre.trim(),
        rol: admin.rol || 'Superadmin',
        cargo: admin.cargo?.trim() || 'Administrador de Refugio',
        telefono: admin.telefono?.trim() || null,
        activo: true,
      }]);

      if (insertError) throw new Error(insertError.message);
    }
  },

  async updateStatus(id: string, activo: boolean): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('admins').update({ activo }).eq('id', id);
      if (error) throw new Error(error.message);
    }
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }
  },
};

/**
 * =======================================================================
 * DDL SQL SCHEMA COMPLETO PARA SUPABASE (Exportado para el visor y descarga)
 * =======================================================================
 */
export const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- DOGHOUSE REFUGIO - ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ============================================================================
-- Copia y pega todo este script en el Editor SQL de tu proyecto en Supabase
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA: PERROS EN ADOPCIÓN
CREATE TABLE IF NOT EXISTS public.perros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  edad TEXT NOT NULL,
  tamanio TEXT NOT NULL CHECK (tamanio IN ('Pequeño', 'Mediano', 'Grande')),
  genero TEXT NOT NULL CHECK (genero IN ('Macho', 'Hembra')),
  vacunas BOOLEAN DEFAULT false,
  esterilizado BOOLEAN DEFAULT false,
  foto_url TEXT NOT NULL,
  fotos TEXT[] DEFAULT '{}',
  descripcion TEXT NOT NULL,
  personalidad TEXT[] DEFAULT '{}',
  urgente BOOLEAN DEFAULT false,
  estado TEXT DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'En Proceso', 'Adoptado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA: CATÁLOGO DE NECESIDADES E INSUMOS
CREATE TABLE IF NOT EXISTS public.necesidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL CHECK (categoria IN ('Comida', 'Medicinas', 'Materiales y Limpieza', 'Abrigo y Camas')),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad_meta NUMERIC NOT NULL,
  cantidad_actual NUMERIC DEFAULT 0,
  unidad TEXT NOT NULL,
  prioridad TEXT DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  urgente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA: COMPROBANTES DE DONACIÓN
CREATE TABLE IF NOT EXISTS public.comprobantes_donacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donante_nombre TEXT NOT NULL,
  donante_email TEXT,
  donante_telefono TEXT,
  monto NUMERIC NOT NULL,
  banco_origen TEXT NOT NULL,
  numero_referencia TEXT NOT NULL,
  fecha_transferencia DATE NOT NULL,
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Verificado', 'Rechazado')),
  comentarios TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA: EVENTOS Y JORNADAS DEL REFUGIO
CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Evento Actual', 'Próximamente')),
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  lugar TEXT NOT NULL,
  descripcion_corta TEXT NOT NULL,
  descripcion_completa TEXT NOT NULL,
  foto_url TEXT NOT NULL,
  requisitos TEXT[] DEFAULT '{}',
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABLA: PERROS PERDIDOS Y REPORTES CIUDADANOS
CREATE TABLE IF NOT EXISTS public.perros_perdidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_perro TEXT NOT NULL,
  fecha_perdido DATE NOT NULL,
  foto_url TEXT NOT NULL,
  ubicacion_ultima_vez TEXT NOT NULL,
  maps_url TEXT NOT NULL,
  informacion_relevante TEXT NOT NULL,
  contacto_nombre TEXT NOT NULL,
  contacto_telefono TEXT NOT NULL,
  recompensa TEXT,
  estado TEXT DEFAULT 'Buscando' CHECK (estado IN ('Buscando', 'Reunido con familia')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABLA: SOLICITUDES DE ADOPCIÓN
CREATE TABLE IF NOT EXISTS public.solicitudes_adopcion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perro_id UUID REFERENCES public.perros(id) ON DELETE SET NULL,
  perro_nombre TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  edad INTEGER NOT NULL,
  provincia TEXT NOT NULL,
  canton TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  vivienda_tipo TEXT,
  tiene_otras_mascotas BOOLEAN DEFAULT false,
  motivo TEXT,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Revisión', 'Aprobada', 'Rechazada')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABLA: SOLICITUDES DE APADRINAMIENTO
CREATE TABLE IF NOT EXISTS public.solicitudes_apadrinamiento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perro_id UUID REFERENCES public.perros(id) ON DELETE SET NULL,
  perro_nombre TEXT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  edad INTEGER NOT NULL,
  provincia TEXT NOT NULL,
  canton TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  monto_mensual NUMERIC NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('Alimentación', 'Salud y Vacunas', 'Padrino Integral')),
  estado TEXT DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Pausado', 'Finalizado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABLA: SOLICITUDES DE VOLUNTARIADO
CREATE TABLE IF NOT EXISTS public.solicitudes_voluntariado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  edad INTEGER NOT NULL,
  provincia TEXT NOT NULL,
  canton TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  rol_interes TEXT NOT NULL CHECK (rol_interes IN ('Paseos y Socialización', 'Limpieza y Refugio', 'Eventos y Difusión', 'Hogar Temporal', 'Atención Veterinaria')),
  disponibilidad TEXT NOT NULL CHECK (disponibilidad IN ('Fines de semana', 'Entre semana (mañanas)', 'Entre semana (tardes)', 'Tiempo flexible')),
  experiencia_previa TEXT,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aceptado', 'Contactado', 'Inactivo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. TABLA: ADMINISTRADORES DEL REFUGIO (Acceso al Panel Administrativo)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,                       -- Correo institucional de acceso
  password_hash TEXT NOT NULL,                      -- Contraseña con hash bcrypt
  password TEXT,                                    -- Copia o hash para compatibilidad
  nombre TEXT NOT NULL,                             -- Nombre completo
  rol TEXT NOT NULL DEFAULT 'Superadmin'            -- Rol del administrador
    CHECK (rol IN ('Superadmin', 'Administrador', 'Veterinario', 'Coordinador')),
  cargo TEXT DEFAULT 'Administrador de Refugio',    -- Cargo institucional
  telefono TEXT,                                    -- Teléfono / WhatsApp
  activo BOOLEAN NOT NULL DEFAULT true,             -- Estado de acceso activo/inactivo
  ultimo_acceso TIMESTAMPTZ,                       -- Fecha del último inicio de sesión
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Función segura para verificar credenciales de administradores
CREATE OR REPLACE FUNCTION public.verificar_admin(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  nombre TEXT,
  rol TEXT,
  cargo TEXT,
  telefono TEXT,
  activo BOOLEAN,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.admins 
  SET ultimo_acceso = now()
  WHERE lower(trim(admins.email)) = lower(trim(p_email))
    AND admins.activo = true
    AND (
      admins.password_hash = crypt(p_password, admins.password_hash)
      OR admins.password_hash = p_password
      OR (admins.password IS NOT NULL AND admins.password = p_password)
      OR (admins.password IS NOT NULL AND admins.password = crypt(p_password, admins.password))
    );

  RETURN QUERY
  SELECT 
    a.id, 
    a.email, 
    a.nombre, 
    a.rol,
    a.cargo, 
    a.telefono, 
    a.activo,
    a.ultimo_acceso,
    a.created_at
  FROM public.admins a
  WHERE lower(trim(a.email)) = lower(trim(p_email))
    AND a.activo = true
    AND (
      a.password_hash = crypt(p_password, a.password_hash)
      OR a.password_hash = p_password
      OR (a.password IS NOT NULL AND a.password = p_password)
      OR (a.password IS NOT NULL AND a.password = crypt(p_password, a.password))
    );
END;
$$;

-- Función segura para registrar administradores con hash bcrypt
CREATE OR REPLACE FUNCTION public.guardar_admin(
  p_email TEXT,
  p_password TEXT,
  p_nombre TEXT,
  p_rol TEXT DEFAULT 'Superadmin',
  p_telefono TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT 'Administrador de Refugio'
)
RETURNS UUID SECURITY DEFINER LANGUAGE plpgsql AS $$
DECLARE
  v_admin_id UUID;
  v_hash TEXT;
BEGIN
  v_hash := crypt(p_password, gen_salt('bf'));

  INSERT INTO public.admins (email, password_hash, password, nombre, rol, cargo, telefono, activo, updated_at)
  VALUES (
    lower(trim(p_email)),
    v_hash,
    v_hash,
    p_nombre,
    p_rol,
    p_cargo,
    p_telefono,
    true,
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET
    password_hash = v_hash,
    password = v_hash,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    cargo = COALESCE(EXCLUDED.cargo, admins.cargo),
    telefono = COALESCE(EXCLUDED.telefono, admins.telefono),
    activo = true,
    updated_at = now()
  RETURNING id INTO v_admin_id;

  RETURN v_admin_id;
END;
$$;

-- 10. CONFIGURACIÓN DE BUCKETS (SUPABASE STORAGE)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('perros', 'perros', true),
  ('comprobantes', 'comprobantes', true),
  ('eventos', 'eventos', true),
  ('perdidos', 'perdidos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas Storage
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('perros', 'comprobantes', 'eventos', 'perdidos'));

DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
CREATE POLICY "Public Storage Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('perros', 'comprobantes', 'eventos', 'perdidos'));

DROP POLICY IF EXISTS "Public Storage All" ON storage.objects;
CREATE POLICY "Public Storage All" ON storage.objects
  FOR ALL USING (bucket_id IN ('perros', 'comprobantes', 'eventos', 'perdidos'));

-- 10. SEGURIDAD Y POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.perros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.necesidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes_donacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perros_perdidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_adopcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_apadrinamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_voluntariado ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura comunitaria y gestión
DROP POLICY IF EXISTS "Perros_Select_Public" ON public.perros;
CREATE POLICY "Perros_Select_Public" ON public.perros FOR SELECT USING (true);
DROP POLICY IF EXISTS "Perros_Admin_All" ON public.perros;
CREATE POLICY "Perros_Admin_All" ON public.perros FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Necesidades_Select_Public" ON public.necesidades;
CREATE POLICY "Necesidades_Select_Public" ON public.necesidades FOR SELECT USING (true);
DROP POLICY IF EXISTS "Necesidades_Admin_All" ON public.necesidades;
CREATE POLICY "Necesidades_Admin_All" ON public.necesidades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Comprobantes_Insert_Public" ON public.comprobantes_donacion;
CREATE POLICY "Comprobantes_Insert_Public" ON public.comprobantes_donacion FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Comprobantes_Select_All" ON public.comprobantes_donacion;
CREATE POLICY "Comprobantes_Select_All" ON public.comprobantes_donacion FOR SELECT USING (true);
DROP POLICY IF EXISTS "Comprobantes_Admin_All" ON public.comprobantes_donacion;
CREATE POLICY "Comprobantes_Admin_All" ON public.comprobantes_donacion FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Eventos_Select_Public" ON public.eventos;
CREATE POLICY "Eventos_Select_Public" ON public.eventos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Eventos_Admin_All" ON public.eventos;
CREATE POLICY "Eventos_Admin_All" ON public.eventos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Perdidos_Select_Public" ON public.perros_perdidos;
CREATE POLICY "Perdidos_Select_Public" ON public.perros_perdidos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Perdidos_Insert_Public" ON public.perros_perdidos;
CREATE POLICY "Perdidos_Insert_Public" ON public.perros_perdidos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Perdidos_Admin_All" ON public.perros_perdidos;
CREATE POLICY "Perdidos_Admin_All" ON public.perros_perdidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Adopcion_Insert_Public" ON public.solicitudes_adopcion;
CREATE POLICY "Adopcion_Insert_Public" ON public.solicitudes_adopcion FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Adopcion_Admin_All" ON public.solicitudes_adopcion;
CREATE POLICY "Adopcion_Admin_All" ON public.solicitudes_adopcion FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Apadrinamiento_Insert_Public" ON public.solicitudes_apadrinamiento;
CREATE POLICY "Apadrinamiento_Insert_Public" ON public.solicitudes_apadrinamiento FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Apadrinamiento_Admin_All" ON public.solicitudes_apadrinamiento;
CREATE POLICY "Apadrinamiento_Admin_All" ON public.solicitudes_apadrinamiento FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Voluntariado_Insert_Public" ON public.solicitudes_voluntariado;
CREATE POLICY "Voluntariado_Insert_Public" ON public.solicitudes_voluntariado FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Voluntariado_Admin_All" ON public.solicitudes_voluntariado;
CREATE POLICY "Voluntariado_Admin_All" ON public.solicitudes_voluntariado FOR ALL USING (true) WITH CHECK (true);

-- Políticas para public.admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins_Select_All" ON public.admins;
CREATE POLICY "Admins_Select_All" ON public.admins FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins_Admin_All" ON public.admins;
CREATE POLICY "Admins_Admin_All" ON public.admins FOR ALL USING (true) WITH CHECK (true);

GRANT EXECUTE ON FUNCTION public.verificar_admin(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 11. INSERCIÓN DE DATOS INICIALES REALES
-- 11.0 Administrador Principal (Cuenta de Acceso)
SELECT public.guardar_admin(
  'admin@refugiodoghouse.ec',
  'DogHouseAdmin2026!',
  'Administrador General DogHouse',
  'Superadmin',
  '0997948588',
  'Director de Operaciones y Refugio'
);

INSERT INTO public.perros (id, nombre, edad, tamanio, genero, vacunas, esterilizado, foto_url, fotos, descripcion, personalidad, urgente, estado)
VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'Rocky',
  '2 años',
  'Mediano',
  'Macho',
  true,
  true,
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'
  ],
  'Rescatado en Santa Elena / Salinas. Es muy cariñoso, enérgico y se lleva excelente con niños y otros perros.',
  ARRAY['Juguetón', 'Sociable', 'Protector'],
  true,
  'Disponible'
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Luna',
  '1 año y medio',
  'Pequeño',
  'Hembra',
  true,
  true,
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80'
  ],
  'Una perrita rescatada con pata lastimada, hoy 100% recuperada. Ama dormir en regazos y los paseos tranquilos.',
  ARRAY['Tranquila', 'Cariñosa', 'Apta para departamento'],
  false,
  'Disponible'
),
(
  'a3333333-3333-3333-3333-333333333333',
  'Thor',
  '3 años',
  'Grande',
  'Macho',
  true,
  true,
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80'
  ],
  'Mestizo de Golden Retriever. Noble, leal y con un corazón enorme. Ideal para familias activas o casas con patio amplio.',
  ARRAY['Noble', 'Leal', 'Atlético'],
  false,
  'Disponible'
),
(
  'a4444444-4444-4444-4444-444444444444',
  'Mía',
  '8 meses',
  'Pequeño',
  'Hembra',
  true,
  false,
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'
  ],
  'Cachorrita rescatada en Salinas. Es curiosa, alegre y aprende comandos básicos con facilidad.',
  ARRAY['Curiosa', 'Tierna', 'Aprende rápido'],
  true,
  'Disponible'
),
(
  'a5555555-5555-5555-5555-555555555555',
  'Max',
  '4 años',
  'Mediano',
  'Macho',
  true,
  true,
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80'
  ],
  'Compañero calmado, educado para hacer sus necesidades afuera. Se adapta a rutinas de personas que trabajan.',
  ARRAY['Educado', 'Tranquilo', 'Independiente'],
  false,
  'Disponible'
),
(
  'a6666666-6666-6666-6666-666666666666',
  'Canela',
  '1 año',
  'Mediano',
  'Hembra',
  true,
  true,
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'
  ],
  'Llena de alegría y vitalidad. Adora los juguetes de pelota y las caricias en la barriga.',
  ARRAY['Alegre', 'Divertida', 'Muy cariñosa'],
  false,
  'Disponible'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.necesidades (id, categoria, nombre, descripcion, cantidad_meta, cantidad_actual, unidad, prioridad, urgente)
VALUES
(
  'b1111111-1111-1111-1111-111111111111',
  'Comida',
  'Balanceado para perros adultos (Chunky o Pro Plan)',
  'Alimento de mantenimiento para 45 perros residentes en el refugio.',
  30,
  12,
  'Sacos de 15kg',
  'Alta',
  true
),
(
  'b2222222-2222-2222-2222-222222222222',
  'Comida',
  'Balanceado Puppy / Cachorros',
  'Nutrición especial para cachorros y camadas rescatadas recientemente.',
  10,
  3,
  'Sacos de 8kg',
  'Alta',
  true
),
(
  'b3333333-3333-3333-3333-333333333333',
  'Medicinas',
  'Pastillas Antipulgas y Garrapatas (NexGard / Bravecto / Simparica)',
  'Tratamiento preventivo para todos los perros del refugio frente a parásitos.',
  50,
  28,
  'Tabletas',
  'Alta',
  true
),
(
  'b4444444-4444-4444-4444-444444444444',
  'Materiales y Limpieza',
  'Desinfectante de amonio cuaternario y cloro',
  'Limpieza e higiene diaria de caniles, patios y áreas de recreación.',
  20,
  14,
  'Galones',
  'Media',
  false
),
(
  'b5555555-5555-5555-5555-555555555555',
  'Abrigo y Camas',
  'Cobijas térmicas y toallas limpias',
  'Abrigo para la temporada fresca y para cachorros en proceso de recuperación.',
  40,
  31,
  'Unidades',
  'Baja',
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.eventos (id, titulo, tipo, fecha, hora, lugar, descripcion_corta, descripcion_completa, foto_url, requisitos, destacado)
VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  'Gran Feria de Adopción "Huellas con Amor"',
  'Evento Actual',
  'Sábado 20 de Septiembre, 2026',
  '10:00 AM - 04:00 PM',
  'Parque Central de Salinas / Malecón, Santa Elena',
  'Ven a conocer a más de 20 perritos listos para encontrar su hogar definitivo.',
  'Jornada completa de adopción responsable. Habrá carpa veterinaria con desparasitación gratuita para mascotas visitantes, venta de accesorios benéficos y charla de adiestramiento canino positivo.',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
  ARRAY['Copia de cédula y planilla de servicios', 'Toda la familia debe estar de acuerdo', 'Collar y correa para la mascota'],
  true
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Jornada Masiva de Esterilización a Bajo Costo',
  'Próximamente',
  'Domingo 5 de Octubre, 2026',
  '08:30 AM - 02:00 PM',
  'Sede Refugio DogHouse (Salinas, Santa Elena)',
  'Campaña preventiva comunitaria para perros y gatos.',
  'Cirugías a costo social para esterilización de perros y gatos comunitarios o de familias del sector. Cupos limitados con reserva previa para asegurar el bienestar post-operatorio.',
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=80',
  ARRAY['Ayuno de 8 horas previas', 'Cobija limpia para recuperación', 'Mascota sana mayor a 4 meses'],
  false
),
(
  'c3333333-3333-3333-3333-333333333333',
  'Perrotón y Caminata Solidaria 3K',
  'Próximamente',
  'Sábado 24 de Octubre, 2026',
  '09:00 AM - 01:00 PM',
  'Paseo Marino de Salinas',
  'Caminata recreativa con tu perrito para recaudar fondos para alimento e insumos.',
  'Una mañana deportiva y solidaria. Kit del corredor con pañoleta oficial de DogHouse, hidratación, premios al perrito más simpático y feria de emprendimientos amigos de los animales.',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80',
  ARRAY['Inscripción voluntaria pro-refugio', 'Mascotas con correa obligatoria'],
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.perros_perdidos (id, nombre_perro, fecha_perdido, foto_url, ubicacion_ultima_vez, maps_url, informacion_relevante, contacto_nombre, contacto_telefono, recompensa, estado)
VALUES
(
  'd1111111-1111-1111-1111-111111111111',
  'Toby',
  '2026-09-08',
  'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80',
  'Sector Chipipe, cerca del hotel Miramar, Salinas',
  'https://maps.google.com/?q=Chipipe+Salinas+Ecuador',
  'Poodle mediano color miel. Llevaba collar rojo sin placa. Es tímido ante ruidos fuertes pero muy dócil.',
  'Andrea Viteri',
  '0997948588',
  '$150 USD',
  'Buscando'
),
(
  'd2222222-2222-2222-2222-222222222222',
  'Bruno',
  '2026-09-11',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
  'Entrada a La Chocolatera / Base Naval, Salinas',
  'https://maps.google.com/?q=La+Chocolatera+Salinas',
  'Mestizo de Labrador negro con pecho blanco. Mancha característica en oreja izquierda. Muy juguetón y amigable.',
  'Esteban Carrera',
  '0997948588',
  'Gratificación voluntaria',
  'Buscando'
),
(
  'd3333333-3333-3333-3333-333333333333',
  'Kira',
  '2026-09-02',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
  'Sector San Lorenzo, Salinas',
  'https://maps.google.com/?q=San+Lorenzo+Salinas',
  'Perra husky siberiana de ojos azules. ¡REUNIDA CON ÉXITO CON SU FAMILIA GRACIAS A LA COMUNIDAD!',
  'Familia Salazar',
  '0997948588',
  NULL,
  'Reunido con familia'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.comprobantes_donacion (id, donante_nombre, donante_email, donante_telefono, monto, banco_origen, numero_referencia, fecha_transferencia, archivo_url, archivo_nombre, estado, comentarios)
VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'María Elena Morales',
  'maria.morales@gmail.com',
  '0998765432',
  35.0,
  'Banco Pichincha',
  'TR-98451276',
  '2026-09-10',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  'transferencia_pichincha_35usd.jpg',
  'Verificado',
  'Donación para saco de comida y vacunas de Rocky.'
),
(
  'e2222222-2222-2222-2222-222222222222',
  'Carlos Andrés Jaramillo',
  'carlos.jara@yahoo.com',
  '0981234567',
  50.0,
  'Banco Guayaquil',
  'BG-442190',
  '2026-09-12',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  'comprobante_bg_50.png',
  'Pendiente',
  'Aporte para medicinas de perritos recién rescatados.'
)
ON CONFLICT (id) DO NOTHING;
`;

export const ADMIN_TABLE_SQL_SCRIPT = `-- ============================================================================
-- DOGHOUSE REFUGIO - TABLA DE ADMINISTRADORES (SUPABASE / POSTGRESQL)
-- ============================================================================
-- Crea la tabla 'public.admins' para almacenar los datos de los administradores
-- con correo, contraseña (hash bcrypt), nombre, rol, cargo, teléfono y estado.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Creación de la tabla 'admins'
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,                       -- Correo electrónico institucional
  password_hash TEXT NOT NULL,                      -- Contraseña con hash bcrypt
  password TEXT,                                    -- Copia o hash para compatibilidad
  nombre TEXT NOT NULL,                             -- Nombre completo
  rol TEXT NOT NULL DEFAULT 'Superadmin'            -- Rol del administrador
    CHECK (rol IN ('Superadmin', 'Administrador', 'Veterinario', 'Coordinador')),
  cargo TEXT DEFAULT 'Administrador de Refugio',    -- Cargo institucional
  telefono TEXT,                                    -- Teléfono / WhatsApp
  activo BOOLEAN NOT NULL DEFAULT true,             -- Estado de acceso activo/inactivo
  ultimo_acceso TIMESTAMPTZ,                       -- Fecha del último inicio de sesión
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentarios explicativos
COMMENT ON TABLE public.admins IS 'Tabla de administradores autorizados para el Refugio DogHouse';
COMMENT ON COLUMN public.admins.email IS 'Correo electrónico único de acceso';
COMMENT ON COLUMN public.admins.password_hash IS 'Hash de contraseña encriptada con bcrypt';
COMMENT ON COLUMN public.admins.nombre IS 'Nombre y apellidos del administrador';
COMMENT ON COLUMN public.admins.rol IS 'Rol y permisos: Superadmin, Administrador, Veterinario, Coordinador';
COMMENT ON COLUMN public.admins.cargo IS 'Cargo o área funcional en el refugio';

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_admins_activo ON public.admins(activo);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.actualizar_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_admins_updated_at ON public.admins;
CREATE TRIGGER tr_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_admins_updated_at();

-- Políticas RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins_Select_All" ON public.admins;
CREATE POLICY "Admins_Select_All" ON public.admins FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins_Admin_All" ON public.admins;
CREATE POLICY "Admins_Admin_All" ON public.admins FOR ALL USING (true) WITH CHECK (true);

-- Función segura para verificar credenciales
CREATE OR REPLACE FUNCTION public.verificar_admin(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  nombre TEXT,
  rol TEXT,
  cargo TEXT,
  telefono TEXT,
  activo BOOLEAN,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.admins 
  SET ultimo_acceso = now()
  WHERE lower(trim(admins.email)) = lower(trim(p_email))
    AND admins.activo = true
    AND (
      admins.password_hash = crypt(p_password, admins.password_hash)
      OR admins.password_hash = p_password
      OR (admins.password IS NOT NULL AND admins.password = p_password)
      OR (admins.password IS NOT NULL AND admins.password = crypt(p_password, admins.password))
    );

  RETURN QUERY
  SELECT 
    a.id, 
    a.email, 
    a.nombre, 
    a.rol,
    a.cargo, 
    a.telefono, 
    a.activo,
    a.ultimo_acceso,
    a.created_at
  FROM public.admins a
  WHERE lower(trim(a.email)) = lower(trim(p_email))
    AND a.activo = true
    AND (
      a.password_hash = crypt(p_password, a.password_hash)
      OR a.password_hash = p_password
      OR (a.password IS NOT NULL AND a.password = p_password)
      OR (a.password IS NOT NULL AND a.password = crypt(p_password, a.password))
    );
END;
$$;

-- Función segura para registrar o actualizar administradores con hash bcrypt
CREATE OR REPLACE FUNCTION public.guardar_admin(
  p_email TEXT,
  p_password TEXT,
  p_nombre TEXT,
  p_rol TEXT DEFAULT 'Superadmin',
  p_telefono TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT 'Administrador de Refugio'
)
RETURNS UUID SECURITY DEFINER LANGUAGE plpgsql AS $$
DECLARE
  v_admin_id UUID;
  v_hash TEXT;
BEGIN
  v_hash := crypt(p_password, gen_salt('bf'));

  INSERT INTO public.admins (email, password_hash, password, nombre, rol, cargo, telefono, activo, updated_at)
  VALUES (
    lower(trim(p_email)),
    v_hash,
    v_hash,
    p_nombre,
    p_rol,
    p_cargo,
    p_telefono,
    true,
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET
    password_hash = v_hash,
    password = v_hash,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    cargo = COALESCE(EXCLUDED.cargo, admins.cargo),
    telefono = COALESCE(EXCLUDED.telefono, admins.telefono),
    activo = true,
    updated_at = now()
  RETURNING id INTO v_admin_id;

  RETURN v_admin_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verificar_admin(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
`;

export const CREATE_ADMIN_SQL_SCRIPT = `-- ============================================================================
-- SCRIPT SQL: REGISTRO DE ADMINISTRADOR EN SUPABASE (TABLA public.admins Y auth.users)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Asegurar creación de la tabla public.admins si no existe
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password TEXT,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'Superadmin' CHECK (rol IN ('Superadmin', 'Administrador', 'Veterinario', 'Coordinador')),
  cargo TEXT DEFAULT 'Administrador de Refugio',
  telefono TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Políticas de acceso
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins_Select_All" ON public.admins;
CREATE POLICY "Admins_Select_All" ON public.admins FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins_Admin_All" ON public.admins;
CREATE POLICY "Admins_Admin_All" ON public.admins FOR ALL USING (true) WITH CHECK (true);

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  
  -- >>> INGRESA AQUÍ LAS CREDENCIALES DE TU ADMINISTRADOR ANTES DE EJECUTAR <<<
  admin_email TEXT := 'tu_correo_aqui@ejemplo.com';
  admin_password TEXT := 'TuContrasenaSegura2026!';
  admin_nombre TEXT := 'Administrador DogHouse';
  admin_rol TEXT := 'Superadmin';
  admin_cargo TEXT := 'Director de Operaciones y Refugio';
  admin_telefono TEXT := '0999999999';
  v_hash TEXT;
BEGIN
  IF admin_email = 'tu_correo_aqui@ejemplo.com' OR admin_password = 'TuContrasenaSegura2026!' THEN
    RAISE EXCEPTION 'Por favor cambia admin_email y admin_password por tus credenciales reales antes de ejecutar este script.';
  END IF;

  v_hash := crypt(admin_password, gen_salt('bf'));

  -- 1. Guardar en la tabla public.admins
  INSERT INTO public.admins (email, password_hash, password, nombre, rol, cargo, telefono, activo, updated_at)
  VALUES (
    lower(trim(admin_email)),
    v_hash,
    v_hash,
    admin_nombre,
    admin_rol,
    admin_cargo,
    admin_telefono,
    true,
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET
    password_hash = v_hash,
    password = v_hash,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    cargo = COALESCE(EXCLUDED.cargo, admins.cargo),
    telefono = COALESCE(EXCLUDED.telefono, admins.telefono),
    activo = true,
    updated_at = now();

  -- 2. Sincronizar en auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      v_hash,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      format('{"nombre":"%s","rol":"%s","cargo":"%s"}', admin_nombre, admin_rol, admin_cargo)::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id::text, admin_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE '¡Administrador registrado en public.admins y auth.users con éxito! Correo: %', admin_email;
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = v_hash,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = format('{"nombre":"%s","rol":"%s","cargo":"%s"}', admin_nombre, admin_rol, admin_cargo)::jsonb,
      updated_at = now()
    WHERE email = admin_email;

    RAISE NOTICE '¡Usuario % actualizado en public.admins y auth.users!', admin_email;
  END IF;
END $$;
`;
