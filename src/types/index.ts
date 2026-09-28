export type DogSize = 'Pequeño' | 'Mediano' | 'Grande';

export interface Perro {
  id: string;
  nombre: string;
  edad: string;
  tamanio: DogSize;
  genero: 'Macho' | 'Hembra';
  vacunas: boolean;
  esterilizado: boolean;
  foto_url: string;
  fotos?: string[]; // Hasta 5 fotos del perrito
  descripcion: string;
  personalidad: string[];
  urgente?: boolean;
  estado: 'Disponible' | 'En Proceso' | 'Adoptado';
  created_at?: string;
}

export interface AdopcionFormValues {
  perro_id: string;
  perro_nombre: string;
  nombre: string;
  apellido: string;
  edad: number | string;
  provincia: string;
  canton: string;
  telefono: string;
  email?: string;
  vivienda_tipo?: 'Casa propia' | 'Departamento' | 'Arriendo con permiso';
  tiene_otras_mascotas?: boolean;
  motivo?: string;
}

export interface ApadrinamientoFormValues {
  perro_id?: string;
  perro_nombre?: string;
  nombre: string;
  apellido: string;
  edad: number | string;
  provincia: string;
  canton: string;
  telefono: string;
  email: string;
  monto_mensual: number;
  plan: 'Alimentación' | 'Salud y Vacunas' | 'Padrino Integral';
}

export interface VoluntariadoFormValues {
  nombre: string;
  apellido: string;
  edad: number | string;
  provincia: string;
  canton: string;
  telefono: string;
  email: string;
  rol_interes: 'Paseos y Socialización' | 'Limpieza y Refugio' | 'Eventos y Difusión' | 'Hogar Temporal' | 'Atención Veterinaria';
  disponibilidad: 'Fines de semana' | 'Entre semana (mañanas)' | 'Entre semana (tardes)' | 'Tiempo flexible';
  experiencia_previa?: string;
}

export interface InsumoNecesidad {
  id: string;
  categoria: 'Comida' | 'Medicinas' | 'Materiales y Limpieza' | 'Abrigo y Camas';
  nombre: string;
  descripcion: string;
  cantidad_meta: number;
  cantidad_actual: number;
  unidad: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  urgente: boolean;
}

export interface ComprobanteDonacion {
  id: string;
  donante_nombre: string;
  donante_email?: string;
  donante_telefono?: string;
  monto: number;
  banco_origen: string;
  numero_referencia: string;
  fecha_transferencia: string;
  archivo_url: string;
  archivo_nombre: string;
  estado: 'Pendiente' | 'Verificado' | 'Rechazado';
  created_at: string;
  comentarios?: string;
}

export interface EventoRefugio {
  id: string;
  titulo: string;
  tipo: 'Evento Actual' | 'Próximamente';
  fecha: string;
  hora: string;
  lugar: string;
  descripcion_corta: string;
  descripcion_completa: string;
  foto_url: string;
  requisitos?: string[];
  destacado?: boolean;
}

export interface PerroPerdidoReporte {
  id: string;
  nombre_perro: string;
  fecha_perdido: string; // YYYY-MM-DD
  foto_url: string;
  ubicacion_ultima_vez: string;
  maps_url: string;
  informacion_relevante: string;
  contacto_nombre: string;
  contacto_telefono: string;
  recompensa?: string;
  estado: 'Buscando' | 'Reunido con familia';
  created_at: string;
}

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'info' | 'error';
  titulo: string;
  mensaje: string;
}

export interface AdminUser {
  id: string;
  email: string;
  nombre: string;
  rol: 'Superadmin' | 'Administrador' | 'Veterinario' | 'Coordinador';
  cargo?: string;
  telefono?: string;
  activo: boolean;
  ultimo_acceso?: string;
  created_at?: string;
  updated_at?: string;
}
