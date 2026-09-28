import React, { useState } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  AlertCircle, 
  Heart, 
  Package, 
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { InsumoNecesidad, ComprobanteDonacion } from '../types';
import { DonationService } from '../lib/supabase';
import { 
  SHELTER_BANK_ACCOUNTS, 
  SHELTER_SOCIALS, 
  SHELTER_LOCATION, 
  SHELTER_EMAIL, 
  SHELTER_HOURS 
} from '../lib/whatsapp';
import confetti from 'canvas-confetti';

interface DonacionesProps {
  necesidades?: InsumoNecesidad[];
  needs?: InsumoNecesidad[];
  onShowToast: (tipo: 'success' | 'info' | 'error', titulo: string, mensaje: string) => void;
  onNavigateToAdmin?: () => void;
  onReloadNeeds?: () => void;
}

export const Donaciones: React.FC<DonacionesProps> = ({
  necesidades,
  needs,
  onShowToast,
  onNavigateToAdmin,
  onReloadNeeds,
}) => {
  const needsList = necesidades || needs || [];
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Formulario de Comprobante
  const [comprobanteForm, setComprobanteForm] = useState({
    donante_nombre: '',
    donante_email: '',
    donante_telefono: '',
    monto: '',
    banco_origen: 'Banco Pichincha',
    numero_referencia: '',
    fecha_transferencia: new Date().toISOString().split('T')[0],
    archivo_url: '',
    archivo_nombre: '',
    comentarios: '',
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submittedVoucher, setSubmittedVoucher] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cuentas Bancarias Oficiales del Refugio DogHouse
  const bankAccounts = SHELTER_BANK_ACCOUNTS;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    onShowToast('info', 'Copiado al Portapapeles', `${label}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('El archivo no debe exceder los 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFilePreview(base64);
      setComprobanteForm((prev) => ({
        ...prev,
        archivo_url: base64,
        archivo_nombre: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setComprobanteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comprobanteForm.donante_nombre.trim() || !comprobanteForm.monto || !comprobanteForm.numero_referencia.trim()) {
      setErrorMsg('Por favor completa el nombre del donante, monto y número de comprobante/referencia.');
      return;
    }

    if (!comprobanteForm.archivo_url) {
      setErrorMsg('Por favor adjunta la captura o imagen del comprobante de transferencia.');
      return;
    }

    setUploading(true);

    try {
      /**
       * Subida a Supabase:
       * 1. Supabase Storage:
       *    const fileExt = file.name.split('.').pop();
       *    const fileName = `${Date.now()}.${fileExt}`;
       *    const { data: storageData } = await supabase.storage.from('comprobantes').upload(fileName, file);
       *    const { publicUrl } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
       * 2. Supabase Table:
       *    await supabase.from('comprobantes_donacion').insert([{ ...comprobanteForm, archivo_url: publicUrl }]);
       */
      await DonationService.submitVoucher({
        donante_nombre: comprobanteForm.donante_nombre,
        donante_email: comprobanteForm.donante_email,
        donante_telefono: comprobanteForm.donante_telefono,
        monto: Number(comprobanteForm.monto),
        banco_origen: comprobanteForm.banco_origen,
        numero_referencia: comprobanteForm.numero_referencia,
        fecha_transferencia: comprobanteForm.fecha_transferencia,
        archivo_url: comprobanteForm.archivo_url,
        archivo_nombre: comprobanteForm.archivo_nombre || 'comprobante.jpg',
        comentarios: comprobanteForm.comentarios,
      });

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setSubmittedVoucher(true);
      onShowToast(
        'success',
        '¡Comprobante Registrado!',
        'El comprobante se guardó en Supabase Storage y ya es visible en el Panel de Administración.'
      );
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al guardar el comprobante.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparencia y Apoyo Directo</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900">
          Donaciones para DogHouse Refugio
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Cada dólar se destina directamente al sustento, salud y rescate de 45 perritos en Ecuador. Puedes colaborar mediante transferencia bancaria o donando insumos físicos prioritarios.
        </p>
      </div>

      {/* 1. CUENTAS BANCARIAS OFICIALES EN ECUADOR Y PAYPAL */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900">
              Cuentas de Donación Oficiales
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Haz clic en copiar para transferir desde tu banca móvil o dona con tarjeta vía PayPal.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cuentas Verificadas DogHouse</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bankAccounts.map((acc, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 border-2 transition-all shadow-xs hover:shadow-md bg-white ${acc.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-900 text-white">
                  {acc.tag}
                </span>
                <span className="text-xs font-bold text-stone-500">{acc.tipo}</span>
              </div>

              <h3 className="text-lg font-extrabold text-stone-900">{acc.banco}</h3>

              <div className="mt-4 space-y-2.5 text-xs text-stone-600">
                <div className="flex items-center justify-between bg-white/80 p-2 rounded-xl border border-stone-200/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Número de Cuenta</span>
                    <span className="font-mono font-bold text-sm text-stone-900">{acc.numero}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(acc.numero, `Cuenta ${acc.banco}`)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="Copiar número de cuenta"
                  >
                    {copiedField === `Cuenta ${acc.banco}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2 rounded-xl border border-stone-200/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">C.I. Titular</span>
                    <span className="font-mono font-bold text-xs text-stone-900">{acc.identificacion}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(acc.identificacion, `C.I. ${acc.banco}`)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="Copiar Cédula"
                  >
                    {copiedField === `C.I. ${acc.banco}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="pt-2 text-[11px] text-stone-500">
                  <p><strong>Titular:</strong> {acc.titular}</p>
                  <p><strong>Correo:</strong> {acc.email}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Tarjeta de PayPal */}
          <div className="rounded-3xl p-6 border-2 border-sky-400 bg-sky-50/40 transition-all shadow-xs hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-600 text-white">
                  Internacional
                </span>
                <span className="text-xs font-bold text-stone-500">Tarjeta / Saldo</span>
              </div>

              <h3 className="text-lg font-extrabold text-stone-900">PayPal Oficial</h3>

              <div className="mt-4 space-y-2 text-xs text-stone-600">
                <p className="leading-relaxed">
                  Dona desde cualquier parte del mundo de manera segura usando tu tarjeta de crédito o cuenta PayPal.
                </p>
                <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200 text-[11px] font-mono break-all text-sky-800">
                  {SHELTER_SOCIALS.paypal}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={SHELTER_SOCIALS.paypal}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>Donar por PayPal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATÁLOGO DINÁMICO DE NECESIDADES */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
              <Package className="w-4 h-4" />
              <span>Insumos y Materiales</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 mt-1">
              Catálogo de Necesidades del Refugio
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Lista dinámica de requerimientos urgentes que puedes donar físicamente o en especie.
            </p>
          </div>
          <div className="text-xs text-stone-500">
            Punto de acopio y entregas: <strong>{SHELTER_LOCATION} (Horarios: {SHELTER_HOURS})</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {needsList.map((item) => {
            const porcentaje = Math.min(100, Math.round((item.cantidad_actual / item.cantidad_meta) * 100));
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {item.categoria}
                    </span>
                    {item.urgente ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
                        Urgente
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                        Prioridad {item.prioridad}
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-base text-stone-900 mt-3">{item.nombre}</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.descripcion}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Meta: <strong>{item.cantidad_meta} {item.unidad}</strong></span>
                    <span className="font-bold text-stone-800">{item.cantidad_actual} recaudados ({porcentaje}%)</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        porcentaje >= 80 ? 'bg-emerald-500' : porcentaje >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FORMULARIO PARA SUBIR COMPROBANTES DE PAGO */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Registrar Comprobante de Transferencia</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Al subirlo, tu comprobante se guardará en <strong>Supabase Storage</strong> y se reflejará al instante en el Panel Administrativo para su verificación.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {submittedVoucher ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-stone-900">¡Comprobante Recibido con Éxito!</h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Tu donación ha sido registrada en la base de datos de <strong>DogHouse</strong>. Nuestro tesorero validará la acreditación y te enviaremos el recibo oficial.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => {
                    setSubmittedVoucher(false);
                    setComprobanteForm({
                      donante_nombre: '',
                      donante_email: '',
                      donante_telefono: '',
                      monto: '',
                      banco_origen: 'Banco Pichincha',
                      numero_referencia: '',
                      fecha_transferencia: new Date().toISOString().split('T')[0],
                      archivo_url: '',
                      archivo_nombre: '',
                      comentarios: '',
                    });
                    setFilePreview(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                >
                  Registrar otra donación
                </button>
                {onNavigateToAdmin && (
                  <button
                    onClick={onNavigateToAdmin}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Ver en Panel Admin</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitComprobante} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre del Donante / Razón Social <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="donante_nombre"
                    value={comprobanteForm.donante_nombre}
                    onChange={handleFormChange}
                    placeholder="Ej. Sofía Andrade"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Monto Donado ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    name="monto"
                    value={comprobanteForm.monto}
                    onChange={handleFormChange}
                    placeholder="Ej. 25.00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Banco de Origen / Método <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="banco_origen"
                    value={comprobanteForm.banco_origen}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Banco Pichincha">Banco Pichincha</option>
                    <option value="Banco del Pacífico">Banco del Pacífico</option>
                    <option value="Banco Guayaquil">Banco Guayaquil</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Produbanco">Produbanco</option>
                    <option value="Cooperativa JEP">Cooperativa JEP</option>
                    <option value="Deuna! / Pagomedios">Deuna! / Pagomedios</option>
                    <option value="Otro">Otro Banco / Interbancario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nº de Comprobante / Referencia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numero_referencia"
                    value={comprobanteForm.numero_referencia}
                    onChange={handleFormChange}
                    placeholder="Ej. TR-9988123"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha de la Transferencia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_transferencia"
                    value={comprobanteForm.fecha_transferencia}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Correo para Recibo Digital
                  </label>
                  <input
                    type="email"
                    name="donante_email"
                    value={comprobanteForm.donante_email}
                    onChange={handleFormChange}
                    placeholder="tucorreo@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Subida de Archivo a Supabase Storage */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  Adjuntar Captura o Comprobante (Imagen o PDF) <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-stone-50/50">
                  {filePreview ? (
                    <div className="space-y-3">
                      <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-white">
                        <img
                          src={filePreview}
                          alt="Comprobante subido"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-bold text-stone-700">{comprobanteForm.archivo_nombre}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreview(null);
                          setComprobanteForm((prev) => ({ ...prev, archivo_url: '', archivo_nombre: '' }));
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 underline font-semibold"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-800">
                          Arrastra tu archivo aquí o haz clic para seleccionarlo
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Formatos admitidos: JPG, PNG, WEBP (Hasta 5 MB)
                        </p>
                      </div>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <span className="cursor-pointer px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors inline-block">
                          Seleccionar desde dispositivo
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nota o dedicatoria especial (Opcional)
                </label>
                <textarea
                  name="comentarios"
                  rows={2}
                  value={comprobanteForm.comentarios}
                  onChange={handleFormChange}
                  placeholder="Ej. Donación para sacos de comida o tratamiento veterinario..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Archivo encriptado y almacenado de forma segura en Supabase Storage.
                </span>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <span>Subiendo a Supabase...</span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Registrar Donación</span>
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
