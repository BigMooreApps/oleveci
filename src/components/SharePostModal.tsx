import React, { useState } from 'react';
import { Post, Business } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './icons/SocialIcons';
import {
  formatPostShareText,
  getWhatsAppAppUrl,
  getWhatsAppWebUrl,
  getFacebookShareUrl,
  downloadPostCardImage,
  shareNativeWithImage,
} from '../utils/shareUtils';
import {
  X,
  Link2,
  Check,
  Share2,
  Download,
  Play,
  Film,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  business?: Business | null;
}

const formatCOP = (val?: number) => {
  if (val === undefined || val === null) return '';
  return `$${val.toLocaleString('es-CO')}`;
};

export const SharePostModal: React.FC<SharePostModalProps> = ({
  isOpen,
  onClose,
  post,
  business,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oleveci.com';
  const shareData = formatPostShareText(post, origin);
  const isVideo = Boolean(post.videoUrl);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const hasDiscount = Boolean(
    post.originalPrice &&
    post.promotionalPrice &&
    post.originalPrice > post.promotionalPrice
  );

  const discountPercent = hasDiscount
    ? Math.round(((post.originalPrice! - post.promotionalPrice!) / post.originalPrice!) * 100)
    : 0;

  const businessLogoUrl = business?.logo || post.businessLogo;

  // 1. WhatsApp (Un solo botón para compartir en chat o estado)
  const handleShareWhatsApp = async () => {
    if (isMobile) {
      try {
        const shared = await shareNativeWithImage(post, { origin, format: 'story' });
        if (shared) return;
      } catch {}
    }
    const waUrl = isMobile
      ? getWhatsAppAppUrl(shareData.shareMessage)
      : getWhatsAppWebUrl(shareData.shareMessage);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Facebook
  const handleShareFacebook = () => {
    window.open(
      getFacebookShareUrl(shareData.url),
      '_blank',
      'noopener,noreferrer,width=600,height=520'
    );
  };

  // 3. Instagram (Descarga la tarjeta exacta de la publicación y copia enlace)
  const handleShareInstagram = async () => {
    if (isMobile) {
      const shared = await shareNativeWithImage(post, { origin, format: 'story' });
      if (shared) return;
    }
    setIsDownloading(true);
    await downloadPostCardImage(post.id, post.title, 'story');
    setIsDownloading(false);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch {}
    showToast('Imagen del anuncio descargada y enlace copiado para Instagram');
  };

  // 4. TikTok (Descarga la tarjeta exacta de la publicación y copia enlace)
  const handleShareTikTok = async () => {
    if (isMobile) {
      const shared = await shareNativeWithImage(post, { origin, format: 'story' });
      if (shared) return;
    }
    setIsDownloading(true);
    await downloadPostCardImage(post.id, post.title, 'story');
    setIsDownloading(false);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch {}
    showToast('Imagen del anuncio descargada y enlace copiado para TikTok');
  };

  // 5. Copiar enlace
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
      } else {
        const input = document.createElement('input');
        input.value = shareData.url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      showToast('¡Enlace copiado al portapapeles!');
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      showToast('No se pudo copiar el enlace');
    }
  };

  // 6. Descargar imagen exacta del anuncio (sin botones)
  const handleDownloadCard = async () => {
    setIsDownloading(true);
    const success = await downloadPostCardImage(post.id, post.title, 'story');
    setIsDownloading(false);
    if (success) {
      showToast('¡Imagen de la publicación descargada con éxito!');
    } else {
      showToast('Error al descargar la imagen');
    }
  };

  const renderBusinessAvatar = () => {
    if (businessLogoUrl) {
      return (
        <img
          src={businessLogoUrl}
          alt={post.businessName}
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover"
        />
      );
    }
    return (
      <div className="flex items-center justify-center w-full h-full text-white font-black text-xs uppercase bg-slate-900">
        {post.businessName.slice(0, 2)}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#040e28] text-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-white/10 flex flex-col max-h-[96vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drawer handle bar */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 pt-2.5 sm:pt-4 pb-2.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#007af7] to-[#38bdf8] flex items-center justify-center shadow-md text-white">
              <Share2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 id="share-modal-title" className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Compartir publicación
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto overscroll-contain">
          {/* ======================================================== */}
          {/* EXACT IN-APP PUBLICATION AD (WITHOUT BOTTOM ACTION BUTTONS) */}
          {/* ======================================================== */}
          <div className="relative w-full aspect-[9/16] max-h-[420px] sm:max-h-[460px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-black shadow-2xl border border-white/20 select-none mx-auto flex flex-col justify-between">
            {/* 1. Full-Bleed Media (Image or Video) */}
            <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center bg-black">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: post.imagePosition
                      ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                      : '50% 50%',
                    transform:
                      post.imageScale && post.imageScale !== 1
                        ? `scale(${post.imageScale})`
                        : undefined,
                    transformOrigin: post.imagePosition
                      ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                      : '50% 50%',
                    filter:
                      post.imageFilter && post.imageFilter !== 'none'
                        ? post.imageFilter
                        : undefined,
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-bold text-xs">
                  <Film className="w-10 h-10 text-cyan-400/40" />
                </div>
              )}

              {/* Cinematic Vignettes exactly matching PostDetailCard */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/75 to-transparent pointer-events-none z-10" />
            </div>

            {/* 2. Top Bar: Only Discount Badge on Left (Exact match to publication) */}
            <div className="relative z-20 pt-3 px-3 flex items-center justify-between">
              {discountPercent ? (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-black text-xs tracking-tight shadow-xl border border-white/30 backdrop-blur-md"
                  style={{
                    background: 'linear-gradient(135deg, #ff3366 0%, #ff5e36 100%)',
                    boxShadow:
                      '0 4px 15px rgba(255, 51, 102, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                  <span className="drop-shadow-xs">-{discountPercent}% OFF</span>
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* Video center play icon indicator if post is video */}
            {isVideo && (
              <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/80 text-white flex items-center justify-center shadow-xl">
                  <Play className="w-5 h-5 ml-0.5 fill-white" />
                </div>
              </div>
            )}

            {/* 3. Bottom Content Overlay (Merchant, Title, Price, Validity & Description - NO buttons) */}
            <div className="relative z-20 pb-4 px-3.5 flex flex-col pointer-events-auto">
              {/* Business Name with Verified Checkmark & Avatar */}
              <div className="inline-flex items-center gap-2 text-white font-extrabold text-sm tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-md overflow-hidden shrink-0 flex items-center justify-center">
                  {renderBusinessAvatar()}
                </div>
                <span>{post.businessName}</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20 shrink-0" />
              </div>

              {/* Title */}
              <h2 className={`text-white font-black leading-tight mt-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${
                post.title.length > 50 ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
              }`}>
                {post.title}
              </h2>

              {/* Pricing Row Pill */}
              <div className="mt-2 inline-flex items-center gap-2 p-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 shadow-xl w-fit">
                {post.promotionalPrice ? (
                  <>
                    <span className="bg-emerald-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs tracking-tight">
                      {formatCOP(post.promotionalPrice)}
                    </span>
                    {post.originalPrice && post.originalPrice > post.promotionalPrice && (
                      <span className="text-white/60 line-through text-xs font-semibold pr-2">
                        {formatCOP(post.originalPrice)}
                      </span>
                    )}
                  </>
                ) : post.originalPrice ? (
                  <span className="text-white font-black text-xs px-3 py-0.5">
                    {formatCOP(post.originalPrice)}
                  </span>
                ) : (
                  <span className="text-emerald-300 font-bold text-xs px-2.5 py-0.5">
                    Consultar precio
                  </span>
                )}
              </div>

              {/* Validity / Expiry Tag */}
              {post.expiryLabel ? (
                <div className="mt-1.5 flex items-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e293b]/85 backdrop-blur-md border border-white/25 text-sky-200 text-xs font-bold shadow-lg">
                    <Clock className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span className="truncate max-w-[260px] leading-tight">
                      {post.expiryLabel}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Description - Exact match to in-app announcement */}
              {post.description ? (
                <div className="mt-1.5 max-h-28 sm:max-h-36 overflow-y-auto overscroll-contain pr-1 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                  <p className="text-white/95 text-xs sm:text-[13px] leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-pre-line select-text">
                    {post.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* ======================================================== */}
          {/* ACTION BUTTONS (The 6 options: WA, FB, IG, TikTok, Link, Download) */}
          {/* ======================================================== */}
          <div className="pt-1">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 text-center">
              {/* 1. WhatsApp */}
              <button
                type="button"
                id="btn-share-whatsapp"
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
                title="Compartir en WhatsApp (Chat o Estado)"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/25 group-hover:scale-105 active:scale-95 transition-transform">
                  <WhatsAppIcon className="w-6 h-6 fill-white" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                  WhatsApp
                </span>
              </button>

              {/* 2. Facebook */}
              <button
                type="button"
                id="btn-share-facebook"
                onClick={handleShareFacebook}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
                title="Compartir en el muro de Facebook"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg shadow-[#1877F2]/25 group-hover:scale-105 active:scale-95 transition-transform">
                  <FacebookIcon className="w-6 h-6 fill-white" size={24} />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                  Facebook
                </span>
              </button>

              {/* 3. Instagram */}
              <button
                type="button"
                id="btn-share-instagram"
                onClick={handleShareInstagram}
                disabled={isDownloading}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
                title="Descargar imagen y copiar link para Instagram"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 active:scale-95 transition-transform">
                  <InstagramIcon className="w-6 h-6 text-white stroke-[2.2]" size={24} />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                  Instagram
                </span>
              </button>

              {/* 4. TikTok */}
              <button
                type="button"
                id="btn-share-tiktok"
                onClick={handleShareTikTok}
                disabled={isDownloading}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
                title="Descargar imagen y copiar link para TikTok"
              >
                <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 text-white flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-105 active:scale-95 transition-transform">
                  <TikTokIcon className="w-5 h-5 fill-white" size={20} />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                  TikTok
                </span>
              </button>

              {/* 5. Copiar Enlace */}
              <button
                type="button"
                id="btn-copy-link"
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
                title="Copiar enlace directo"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-105 active:scale-95 ${
                    copiedLink
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-105'
                      : 'bg-[#007af7] text-white shadow-[#007af7]/25'
                  }`}
                >
                  {copiedLink ? (
                    <Check className="w-6 h-6 stroke-[3]" />
                  ) : (
                    <Link2 className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                  {copiedLink ? '¡Copiado!' : 'Copiar enlace'}
                </span>
              </button>

              {/* 6. Descargar Imagen */}
              <button
                type="button"
                id="btn-download-card"
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
                title="Descargar imagen de la publicación"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 active:scale-95 transition-transform">
                  <Download className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                  {isDownloading ? 'Guardando...' : 'Descargar'}
                </span>
              </button>
            </div>
          </div>

          {/* Feedback Toast */}
          {feedbackToast && (
            <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackToast}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
