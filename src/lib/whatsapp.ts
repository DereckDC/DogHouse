import { AdopcionFormValues, ApadrinamientoFormValues, VoluntariadoFormValues } from '../types';

export const SHELTER_PHONE_ECUADOR = '593997948588'; // Teléfono WhatsApp oficial
export const SHELTER_PHONE_DISPLAY = '0997948588';
export const SHELTER_EMAIL = 'doghousesalinas@gmail.com';
export const SHELTER_LOCATION = 'Salinas'; // Referencia oficial
export const SHELTER_HOURS = '10am - 1pm';

export const SHELTER_SOCIALS = {
  instagram: 'https://www.instagram.com/doghousesalinas.ec?stkn=cmo1MzBhcnFxa2g4',
  facebook: 'https://www.facebook.com/share/1HDs2WsGbF/',
  tiktok: 'https://www.tiktok.com/@refugiodoghousesalinas?_r=1&_t=ZS-99j6KTPCCt3',
  paypal: 'https://www.paypal.com/paypalme/Doghousesalinas',
};

export const SHELTER_BANK_ACCOUNTS = [
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
];

export const SHELTER_DELIVERY_POLICY = 'La entrega de perritos se hace directamente en el refugio (Salinas).';

/**
 * Genera el enlace oficial de WhatsApp con mensaje formateado y codificado
 */
export function buildWhatsAppAdopcionUrl(data: AdopcionFormValues): string {
  const lineas = [
    '🐾 *¡HOLA DOGHOUSE! DESEO POSTULAR PARA ADOPCIÓN*',
    '---------------------------------------------',
    `🐕 *Mascota de interés:* ${data.perro_nombre}`,
    '',
    '📋 *DATOS DEL SOLICITANTE:*',
    `• *Nombre completo:* ${data.nombre} ${data.apellido}`,
    `• *Edad:* ${data.edad} años`,
    `• *Ubicación:* ${data.canton}, ${data.provincia} (Ecuador)`,
    `• *Teléfono de contacto:* ${data.telefono}`,
    data.email ? `• *Correo:* ${data.email}` : '',
    data.vivienda_tipo ? `• *Tipo de vivienda:* ${data.vivienda_tipo}` : '',
    data.tiene_otras_mascotas !== undefined ? `• *¿Tiene otras mascotas?:* ${data.tiene_otras_mascotas ? 'Sí' : 'No'}` : '',
    data.motivo ? `• *Motivo de adopción:* ${data.motivo}` : '',
    '',
    '❤️ _He enviado también mi solicitud a través del sitio web oficial de DogHouse._',
  ].filter(Boolean);

  const texto = encodeURIComponent(lineas.join('\n'));
  return `https://api.whatsapp.com/send?phone=${SHELTER_PHONE_ECUADOR}&text=${texto}`;
}

export function buildWhatsAppApadrinamientoUrl(data: ApadrinamientoFormValues): string {
  const lineas = [
    '🤝 *¡HOLA DOGHOUSE! DESEO SER PADRINO / MADRINA*',
    '---------------------------------------------',
    data.perro_nombre ? `🐕 *Perrito apadrinado:* ${data.perro_nombre}` : '🐕 *Apadrinamiento general del refugio*',
    `✨ *Plan elegido:* ${data.plan}`,
    `💵 *Aporte mensual comprometido:* $${data.monto_mensual} USD`,
    '',
    '📋 *DATOS DEL PADRINO:*',
    `• *Nombre completo:* ${data.nombre} ${data.apellido}`,
    `• *Edad:* ${data.edad} años`,
    `• *Ubicación:* ${data.canton}, ${data.provincia}`,
    `• *Teléfono:* ${data.telefono}`,
    `• *Correo:* ${data.email}`,
    '',
    '🙏 _Agradezco me compartan los datos de transferencia bancaria recurrente o débito._',
  ].filter(Boolean);

  const texto = encodeURIComponent(lineas.join('\n'));
  return `https://api.whatsapp.com/send?phone=${SHELTER_PHONE_ECUADOR}&text=${texto}`;
}

export function buildWhatsAppVoluntariadoUrl(data: VoluntariadoFormValues): string {
  const lineas = [
    '🙋 *¡HOLA ARIEL! DESEO UNIRME AL VOLUNTARIADO DOGHOUSE*',
    '---------------------------------------------------',
    `🎯 *Área de interés:* ${data.rol_interes}`,
    `⏰ *Disponibilidad:* ${data.disponibilidad}`,
    '',
    '📋 *DATOS DEL VOLUNTARIO:*',
    `• *Nombre completo:* ${data.nombre} ${data.apellido}`,
    `• *Edad:* ${data.edad} años`,
    `• *Ubicación:* ${data.canton}, ${data.provincia}`,
    `• *Teléfono de contacto:* ${data.telefono}`,
    `• *Correo electrónico:* ${data.email}`,
    data.experiencia_previa ? `• *Experiencia previa:* ${data.experiencia_previa}` : '',
    '',
    '🐾 _Quedo atento(a) a la próxima inducción y fechas de capacitación en el refugio._',
  ].filter(Boolean);

  const texto = encodeURIComponent(lineas.join('\n'));
  return `https://api.whatsapp.com/send?phone=${SHELTER_PHONE_ECUADOR}&text=${texto}`;
}

export function buildWhatsAppPhoneOnlyUrl(rawPhone: string, message: string = ''): string {
  let clean = rawPhone.replace(/\D/g, '');
  if (clean.startsWith('09')) {
    clean = '593' + clean.slice(1);
  } else if (!clean.startsWith('593') && clean.length === 9) {
    clean = '593' + clean;
  }
  const textParam = message ? `&text=${encodeURIComponent(message)}` : '';
  return `https://api.whatsapp.com/send?phone=${clean}${textParam}`;
}
