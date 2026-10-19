import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Ticket,
  MapPin,
  Tag,
  Route,
  Share2,
} from 'lucide-react';
import { SimulatedReadyPlan, resolvePlanPosts } from '../../data/readyPlansData';
import { Post } from '../../types';
import { InvitationCardPreview } from '../InvitationCardPreview';
import { PlanRouteSection } from '../PlanRouteSection';
import { PostDetailModal } from '../PostDetailModal';
import { BusinessLocationMapModal } from '../BusinessLocationMapModal';
import { TagSlashIcon } from '../icons/TagSlashIcon';
import { OleVeciLogo } from '../OleVeciLogo';

export interface ReadyPlanViewerModalProps {
  plan: SimulatedReadyPlan | null;
  posts: Post[];
  currentCity: string;
  onClose: () => void;
  onSelectPost?: (post: Post) => void;
  onOpenItineraryBuilder?: (mode?: 'automatic' | 'manual' | 'mode_select') => void;
  initialTab?: 'card' | 'map';
}

export const ReadyPlanViewerModal: React.FC<ReadyPlanViewerModalProps> = ({
  plan,
  posts,
  currentCity,
  onClose,
  onSelectPost,
  onOpenItineraryBuilder,
  initialTab = 'card',
}) => {
  const [autoViewMode, setAutoViewMode] = useState<'card' | 'map'>(initialTab);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [locationBusiness, setLocationBusiness] = useState<{
    name: string;
    address: string;
    city: string;
    sector: string;
    coordinates?: any;
    logo?: string;
    category?: string;
    subCategory?: string;
    whatsapp?: string;
    phone?: string;
    verified?: boolean;
  } | null>(null);
  const [hidePrices, setHidePrices] = useState<boolean>(() => {
    if (!plan) return false;
    if (plan.hidePrices !== undefined) return plan.hidePrices;
    try {
      const stored = localStorage.getItem('oleveci_hide_prices');
      if (stored !== null) return stored === 'true';
    } catch {
      // ignore
    }
    return false;
  });
  const modalCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAutoViewMode(initialTab);
  }, [initialTab, plan?.id]);

  useEffect(() => {
    if (plan) {
      if (plan.hidePrices !== undefined) {
        setHidePrices(plan.hidePrices);
      } else {
        try {
          const stored = localStorage.getItem('oleveci_hide_prices');
          if (stored !== null) setHidePrices(stored === 'true');
        } catch {
          // ignore
        }
      }
    }
  }, [plan]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!plan) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [plan]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!plan) return null;

  const modalPosts = resolvePlanPosts(plan, posts);

  const toggleHidePrices = () => {
    const nextVal = !hidePrices;
    setHidePrices(nextVal);
    try {
      localStorage.setItem('oleveci_hide_prices', String(nextVal));
    } catch {
      // ignore
    }
    setAutoViewMode('card');
  };

  const handleSharePlan = async () => {
    if (!plan) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oleveci.com';
    const planUrl = `${origin}/plan/${plan.id}`;
    let message = `🎉 *¡Te invito a este plan en OleVeci!*\n\n`;
    message += `📍 *Plan:* ${plan.planTitle}\n`;
    message += `🗓️ *Cuándo:* ${plan.scheduledTime}\n`;
    message += `🏙️ *Municipio:* ${plan.municipality || currentCity}\n`;

    if (plan.personalNote) {
      message += `💬 *Detalle:* "${plan.personalNote}"\n`;
    }

    if (modalPosts.length > 0) {
      message += `\n🗺️ *Paradas:* ${modalPosts.map((p) => p.businessName).join(' • ')}\n`;
    }
    message += `\n👉 *Mira el itinerario completo aquí:* ${planUrl}\n`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: plan.planTitle,
          text: message,
          url: planUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback si no está disponible navigator.share
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-2 bg-[#040e28]/95 sm:bg-gradient-to-r sm:from-[#03153d]/95 sm:via-[#052264]/95 sm:to-[#0a3899]/95 backdrop-blur-md animate-fade-in overflow-hidden select-none"
        onClick={onClose}
      >
        {/* Decorative ambient glow on desktop matching Reels view */}
        <div className="hidden sm:block absolute -top-16 -left-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-16 -right-16 w-96 h-96 bg-[#007af7]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Expansive Brand Watermark matching Reels */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <img
            src="/Icono_Oleveci_sin_fondo.png?v=clean"
            alt=""
            aria-hidden="true"
            className="w-[740px] xl:w-[1000px] max-w-none h-auto object-contain opacity-[0.09] pointer-events-none"
          />
        </div>

        <div
          className="reel-container-9-16 relative z-10 w-full sm:w-auto h-[100dvh] sm:h-[calc(100dvh-68px)] sm:max-h-[920px] lg:max-h-[940px] sm:aspect-[9/16] aspect-[9/16] max-w-full mx-auto bg-[#040e28] rounded-none sm:rounded-3xl overflow-hidden flex flex-col my-auto border-0 sm:border sm:border-white/20 shadow-2xl select-none"
          onClick={(e) => {
            e.stopPropagation();
            setShowControls((prev) => !prev);
          }}
        >
          {/* Header flotante superior (Logo OleVeci, municipio y botón cerrar) */}
          <div className="absolute top-3 inset-x-3 z-40 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg text-white">
              <OleVeciLogo size="sm" showSlogan={false} showCom={false} />
              <span className="text-[11px] font-bold text-blue-200 bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
                {plan.municipality || currentCity}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="pointer-events-auto w-8 h-8 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl active:scale-90 transition-all duration-300 cursor-pointer"
              aria-label="Cerrar invitación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body: Canvas 9:16 vertical */}
          <div className="flex-1 w-full pt-14 pb-24 px-2 sm:px-3 overflow-y-auto overscroll-contain flex flex-col items-center relative z-10 bg-transparent no-scrollbar">
            {autoViewMode === 'card' ? (
              <div className="w-full flex flex-col items-center my-auto py-1">
                <InvitationCardPreview
                  cardRef={modalCardRef}
                  className="w-full !max-w-none shadow-none"
                  posts={modalPosts}
                  currentCity={plan.municipality || currentCity}
                  planTitle={plan.planTitle}
                  scheduledTime={plan.scheduledTime}
                  personalNote={plan.personalNote}
                  hidePrices={hidePrices}
                  cardTemplate={plan.cardTemplate}
                  theme={plan.theme}
                  bgLayout={plan.bgLayout}
                  totalPrice={plan.estimatedBudget}
                  hasPricedItems={plan.estimatedBudget > 0}
                  onSelectPost={(p) => {
                    setPreviewPost(p);
                  }}
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center py-1">
                <PlanRouteSection
                  posts={modalPosts}
                  planTitle={plan.planTitle}
                  currentCity={plan.municipality || currentCity}
                  scheduledTime={plan.scheduledTime}
                  onSelectPost={(p) => {
                    setPreviewPost(p);
                  }}
                  onOpenLocationMap={(p) => {
                    setLocationBusiness({
                      name: p.businessName,
                      address: p.businessAddress || '',
                      city: p.businessCity || plan.municipality || currentCity || 'Cajicá',
                      sector: p.businessSector || '',
                      coordinates: p.coordinates,
                      logo: p.businessLogo || p.imageUrl,
                      category: p.category,
                      subCategory: p.subCategory,
                      whatsapp: p.businessWhatsapp,
                      phone: p.businessPhone,
                      verified: p.isVerified || p.businessVerified,
                    });
                  }}
                />
              </div>
            )}
          </div>

          {/* Barra de Acciones Flotante Sobrepuesta: Ver Tarjeta, Ver Ruta y Compartir */}
          <div
            className={`absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
              showControls
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full bg-black/65 sm:bg-black/75 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/70">
              {/* 1. Ver Tarjeta de Invitación */}
              <button
                type="button"
                id="btn-ready-modal-view-card"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoViewMode('card');
                }}
                title="Ver tarjeta de invitación"
                aria-label="Ver tarjeta de invitación"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  autoViewMode === 'card'
                    ? 'bg-[#007af7] text-white shadow-md shadow-blue-500/40 ring-2 ring-white/30 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10'
                }`}
              >
                <Ticket className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* 2. Ver Ruta de Itinerario */}
              <button
                type="button"
                id="btn-ready-modal-view-map"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoViewMode('map');
                }}
                title={`Ver ruta y mapa de itinerario (${modalPosts.length} paradas)`}
                aria-label={`Ver ruta y mapa de itinerario (${modalPosts.length} paradas)`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  autoViewMode === 'map'
                    ? 'bg-[#007af7] text-white shadow-md shadow-blue-500/40 ring-2 ring-white/30 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10'
                }`}
              >
                <Route className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* 3. Compartir General */}
              <button
                type="button"
                id="btn-ready-modal-share"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSharePlan();
                }}
                title="Compartir plan"
                aria-label="Compartir plan"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

    {previewPost && (
      <PostDetailModal
        post={previewPost}
        onClose={() => setPreviewPost(null)}
        onSelectPost={(nextPost) => setPreviewPost(nextPost)}
      />
    )}

    {locationBusiness && (
      <BusinessLocationMapModal
        isOpen={true}
        onClose={() => setLocationBusiness(null)}
        business={locationBusiness}
      />
    )}
  </>
);
};
