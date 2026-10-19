import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Dices,
  MapPin,
  Heart,
  Utensils,
  Coffee,
  Wine,
  Smile,
  PawPrint,
  Car,
  ShoppingBag,
  Sun,
  X,
  Check,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortOrder: 'recent' | 'distance' | 'price_low';
  onSortChange: (sort: 'recent' | 'distance' | 'price_low') => void;
}

// Curated plan experiences matching real human intentions
const PLAN_EXPERIENCES = [
  {
    id: 'all',
    label: '¡Cualquier plan!',
    subtitle: 'Sorpréndeme con todo lo bueno de hoy',
    icon: Sparkles,
    color: 'from-amber-400 to-[#ff7700]',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
  },
  {
    id: 'plan_comer_algo',
    label: 'Comer y Antojarse',
    subtitle: 'Parrilla, hamburguesas, comida deli o al paso',
    icon: Utensils,
    color: 'from-orange-500 to-amber-500',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
  },
  {
    id: 'plan_tomar_algo',
    label: 'Café, Helado o Postre',
    subtitle: 'Cafeterías de especialidad, postres y charlas',
    icon: Coffee,
    color: 'from-amber-600 to-yellow-500',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-300',
  },
  {
    id: 'plan_cita_romantica',
    label: 'Cita Romántica',
    subtitle: 'Cena íntima, copa de vino o mirador especial',
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
  },
  {
    id: 'plan_con_amigos',
    label: 'Parche con Amigos',
    subtitle: 'Alitas, picadas, juegos, risas y amigos',
    icon: Smile,
    color: 'from-sky-500 to-blue-600',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-300',
  },
  {
    id: 'plan_noche_rumba',
    label: 'Noche, Cocteles o Rumba',
    subtitle: 'Bares, música en vivo y ambiente nocturno',
    icon: Wine,
    color: 'from-purple-600 to-indigo-600',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
  },
  {
    id: 'plan_dia_con_ninos',
    label: 'En Familia o con Niños',
    subtitle: 'Actividades recreativas, juegos y diversión',
    icon: Sun,
    color: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
  },
  {
    id: 'plan_consentir_mascotas',
    label: 'Plan con Mascotas',
    subtitle: 'Espacios pet-friendly, parques y cuidados',
    icon: PawPrint,
    color: 'from-teal-500 to-cyan-600',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300',
  },
  {
    id: 'plan_cuidado_personal',
    label: 'Belleza y Autocuidado',
    subtitle: 'Spa, barbería, estética y momentos para ti',
    icon: Sparkles,
    color: 'from-fuchsia-500 to-pink-600',
    textColor: 'text-fuchsia-800',
    borderColor: 'border-fuchsia-300',
  },
  {
    id: 'plan_comprar_algo',
    label: 'Compras y Vitrineo',
    subtitle: 'Moda, calzado, tecnología y tiendas locales',
    icon: ShoppingBag,
    color: 'from-blue-600 to-cyan-500',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
  },
  {
    id: 'plan_cuidar_la_nave',
    label: 'Cuidado de mi Vehículo',
    subtitle: 'Lavado, detailing y mantenimiento',
    icon: Car,
    color: 'from-slate-600 to-slate-800',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
  },
];

// Clean budget options (without distracting sub-labels)
const BUDGET_OPTIONS = [
  {
    value: null,
    shortLabel: 'Sin límite',
    icon: '👑',
  },
  {
    value: 30000,
    shortLabel: 'Hasta $30k',
    icon: '🪙',
  },
  {
    value: 50000,
    shortLabel: 'Hasta $50k',
    icon: '💵',
  },
  {
    value: 100000,
    shortLabel: 'Hasta $100k',
    icon: '💎',
  },
];

export const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({
  isOpen,
  onClose,
  sortOrder,
  onSortChange,
}) => {
  const {
    municipalities,
    sectors,
    currentCity,
    setCurrentCity,
    setCurrentSector,
    selectedPlanType,
    setSelectedPlanType,
    maxPlanBudget,
    setMaxPlanBudget,
    posts,
    isPostActive,
  } = useApp();

  // Internal draft states so user can adjust before committing
  const [draftPlanType, setDraftPlanType] = useState<string>(selectedPlanType || 'all');
  const [draftCity, setDraftCity] = useState<string>(currentCity || 'all');
  const [draftBudget, setDraftBudget] = useState<number | null>(maxPlanBudget);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>(() =>
    maxPlanBudget !== null ? maxPlanBudget.toString() : ''
  );
  const [draftSort, setDraftSort] = useState<'recent' | 'distance' | 'price_low'>(sortOrder);
  const [randomAnimation, setRandomAnimation] = useState(false);

  // Ref to scroll municipalities horizontally with arrows
  const municipalitiesScrollRef = useRef<HTMLDivElement>(null);

  const scrollMunicipalities = (direction: 'left' | 'right') => {
    if (municipalitiesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      municipalitiesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Sync with AppContext when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftPlanType(selectedPlanType || 'all');
      setDraftCity(currentCity || 'all');
      setDraftBudget(maxPlanBudget);
      setCustomBudgetInput(maxPlanBudget !== null ? maxPlanBudget.toString() : '');
      setDraftSort(sortOrder);
    }
  }, [isOpen, selectedPlanType, currentCity, maxPlanBudget, sortOrder]);

  // Unique list of municipalities
  const cities: string[] = useMemo(() => {
    const list =
      municipalities && municipalities.length > 0
        ? municipalities.map((m) => m.name)
        : Array.from(new Set(sectors.map((s) => s.cityName)));
    return [...list].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [municipalities, sectors]);

  // Calculate live matching count with current draft choices
  const matchingReelsCount = useMemo(() => {
    const active = posts.filter(isPostActive);

    const matches = active.filter((post) => {
      // 1. City filter
      if (draftCity && draftCity !== 'all') {
        const postCity = (post.businessCity || '').toLowerCase();
        if (postCity !== draftCity.toLowerCase()) return false;
      }

      // 2. Plan type filter
      if (draftPlanType && draftPlanType !== 'all') {
        const postPlanType = (post.planType || '').toLowerCase();
        const postCategory = (post.categoryId || '').toLowerCase();
        const postTags = (post.tags || []).map((t) => t.toLowerCase());

        const matchesPlan =
          postPlanType === draftPlanType.toLowerCase() ||
          postCategory === draftPlanType.toLowerCase() ||
          postTags.includes(draftPlanType.toLowerCase()) ||
          (draftPlanType === 'plan_comer_algo' && (postCategory.includes('gastro') || postCategory.includes('comida') || postCategory.includes('restaurante'))) ||
          (draftPlanType === 'plan_tomar_algo' && (postCategory.includes('cafe') || postCategory.includes('postre') || postCategory.includes('helado'))) ||
          (draftPlanType === 'plan_noche_rumba' && (postCategory.includes('bar') || postCategory.includes('rumba') || postCategory.includes('licor'))) ||
          (draftPlanType === 'plan_cita_romantica' && (postCategory.includes('romance') || postTags.includes('pareja') || postTags.includes('cita'))) ||
          (draftPlanType === 'plan_dia_con_ninos' && (postCategory.includes('nino') || postCategory.includes('familia'))) ||
          (draftPlanType === 'plan_cuidado_personal' && (postCategory.includes('belleza') || postCategory.includes('barberia') || postCategory.includes('spa')));

        if (!matchesPlan) return false;
      }

      // 3. Budget filter
      if (draftBudget !== null) {
        const postPrice = post.price || post.discountPrice;
        if (postPrice && postPrice > draftBudget) {
          return false;
        }
      }

      return true;
    });

    return matches.length;
  }, [posts, isPostActive, draftCity, draftPlanType, draftBudget]);

  // Magic "🎲 Elige por mí" randomizer with dice
  const handleRandomizePlan = () => {
    setRandomAnimation(true);
    setTimeout(() => {
      // Pick random experience (excluding 'all')
      const planOptions = PLAN_EXPERIENCES.filter((p) => p.id !== 'all');
      const randomPlan = planOptions[Math.floor(Math.random() * planOptions.length)];

      // Pick random budget
      const budgetOptions = [null, 30000, 50000, 100000];
      const randomBudget = budgetOptions[Math.floor(Math.random() * budgetOptions.length)];

      setDraftPlanType(randomPlan.id);
      setDraftBudget(randomBudget);
      setCustomBudgetInput(randomBudget !== null ? randomBudget.toString() : '');
      setRandomAnimation(false);
    }, 250);
  };

  // Reset all filters to default
  const handleReset = () => {
    setDraftPlanType('all');
    setDraftCity('all');
    setDraftBudget(null);
    setCustomBudgetInput('');
    setDraftSort('recent');
  };

  // Apply and trigger the surprise in the Reels feed!
  const handleApplySurprise = () => {
    setSelectedPlanType(draftPlanType);
    setCurrentCity(draftCity);
    setCurrentSector('all');
    setMaxPlanBudget(draftBudget);
    onSortChange(draftSort);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="surprise-me-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="surprise-me-modal-dialog"
        className="bg-white w-full sm:max-w-xl rounded-t-[32px] sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 border border-white/20"
      >
        {/* Header: Friendly & Conversational with Dice Icon */}
        <div className="relative px-5 pt-4 pb-3.5 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 via-white to-amber-50/70 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#ff7700] text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                <Dices className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#041f5e] leading-snug flex items-center gap-1.5">
                  <span>¿Qué quieres hacer hoy?</span>
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Dinos tu antojo y te sorprendemos con los mejores planes
                </p>
              </div>
            </div>

            {/* Quick Randomizer Button with Dice & Close */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRandomizePlan}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs ${
                  randomAnimation ? 'animate-spin' : ''
                }`}
                title="Elegir una combinación al azar"
              >
                <Dices className="w-4 h-4 text-[#ff7700]" />
                <span className="hidden xs:inline">Al azar</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto overscroll-contain">
          {/* PASO 1: ¿Qué tipo de plan buscas? */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#041f5e] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#007af7] text-white text-[11px] font-black flex items-center justify-center">
                  1
                </span>
                <span>¿Qué tipo de plan tienes en mente?</span>
              </label>
              {draftPlanType !== 'all' && (
                <button
                  type="button"
                  onClick={() => setDraftPlanType('all')}
                  className="text-[11px] text-[#007af7] font-semibold hover:underline cursor-pointer"
                >
                  Ver cualquiera
                </button>
              )}
            </div>

            {/* Interactive Grid of Plan Experiences */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {PLAN_EXPERIENCES.map((plan) => {
                const IconComponent = plan.icon;
                const isSelected = draftPlanType === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setDraftPlanType(plan.id)}
                    className={`p-3 rounded-2xl text-left transition-all duration-200 border cursor-pointer flex items-start gap-2.5 relative select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-amber-500/10 border-[#007af7] shadow-sm ring-2 ring-[#007af7]/30'
                        : 'bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200/80'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isSelected
                          ? `bg-gradient-to-tr ${plan.color} text-white shadow-xs scale-105`
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold leading-tight truncate ${
                            isSelected ? 'text-[#041f5e]' : 'text-slate-800'
                          }`}
                        >
                          {plan.label}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-normal leading-tight mt-0.5 line-clamp-1">
                        {plan.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 2: ¿En dónde quieres tu plan? (Con flechas para versión Web) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#041f5e] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#ff7700] text-white text-[11px] font-black flex items-center justify-center">
                  2
                </span>
                <span>¿En dónde te gustaría vivirlo?</span>
              </label>
              {draftCity !== 'all' && (
                <span className="text-[11px] text-[#007af7] font-semibold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  📍 {draftCity}
                </span>
              )}
            </div>

            {/* Municipalities Carousel with Web Desktop Navigation Arrows */}
            <div className="relative flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollMunicipalities('left')}
                className="hidden sm:flex w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-600 shadow-sm border border-slate-200 items-center justify-center shrink-0 cursor-pointer transition active:scale-90"
                title="Desplazar a la izquierda"
                aria-label="Desplazar municipios a la izquierda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={municipalitiesScrollRef}
                className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth flex-1"
              >
                <button
                  type="button"
                  onClick={() => setDraftCity('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 border ${
                    draftCity === 'all'
                      ? 'bg-[#041f5e] text-white border-[#041f5e] shadow-2xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>🌐 Todos los municipios</span>
                </button>

                {cities.map((city) => {
                  const isSelected = draftCity.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setDraftCity(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-500 to-[#007af7] text-white border-transparent shadow-2xs font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#007af7]'}`} />
                      <span>{city}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollMunicipalities('right')}
                className="hidden sm:flex w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-600 shadow-sm border border-slate-200 items-center justify-center shrink-0 cursor-pointer transition active:scale-90"
                title="Desplazar a la derecha"
                aria-label="Desplazar municipios a la derecha"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PASO 3: ¿Cuál sería tu presupuesto? */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#041f5e] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#00d8a5] text-[#041f5e] text-[11px] font-black flex items-center justify-center">
                  3
                </span>
                <span>¿Cuál es tu presupuesto aproximado?</span>
              </label>
              {draftBudget !== null && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Hasta ${draftBudget.toLocaleString('es-CO')}
                </span>
              )}
            </div>

            {/* Budget Cards - Clean without bottom subtitle tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BUDGET_OPTIONS.map((b) => {
                const isSelected = draftBudget === b.value;
                return (
                  <button
                    key={b.shortLabel}
                    type="button"
                    onClick={() => {
                      setDraftBudget(b.value);
                      setCustomBudgetInput(b.value !== null ? b.value.toString() : '');
                    }}
                    className={`py-2 px-2 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center select-none active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-400 shadow-sm ring-2 ring-emerald-400/30'
                        : 'bg-slate-50 hover:bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{b.icon}</span>
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isSelected ? 'text-emerald-900' : 'text-slate-800'
                      }`}
                    >
                      {b.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Campo para digitar presupuesto personalizado */}
            <div className="flex items-center gap-2 pt-1.5">
              <span className="text-xs text-slate-500 font-medium shrink-0">O digita tu valor:</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">$</span>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="Ej. 60000"
                  value={customBudgetInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCustomBudgetInput(raw);
                    const val = parseInt(raw, 10);
                    if (!isNaN(val) && val > 0) {
                      setDraftBudget(val);
                    } else if (raw === '') {
                      setDraftBudget(null);
                    }
                  }}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#041f5e] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007af7]/30 transition"
                />
              </div>
              {draftBudget !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftBudget(null);
                    setCustomBudgetInput('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer shrink-0"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Orden de resultados */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Preferencia:</span>
            </span>

            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {[
                { id: 'recent', label: 'Lo nuevo' },
                { id: 'distance', label: 'Cercanos' },
                { id: 'price_low', label: 'Mejor precio' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraftSort(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    draftSort === opt.id
                      ? 'bg-white text-[#041f5e] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Dynamic Result Counter and Big Vibrant Surprise CTA with Dices */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="text-xs">
              <span className="font-bold text-[#041f5e] block">
                {matchingReelsCount > 0
                  ? `🎲 ${matchingReelsCount} ${matchingReelsCount === 1 ? 'publicación lista' : 'publicaciones listas'}`
                  : '🔍 Sin coincidencias directas'}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {draftCity !== 'all' ? `En ${draftCity}` : 'En toda la región'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-slate-200/60 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleApplySurprise}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-white font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer active:scale-98 hover:brightness-110 flex items-center justify-center gap-2 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 50%, #d9480f 100%)',
              boxShadow: '0 4px 16px -2px rgba(255, 119, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
            }}
          >
            <Dices className="w-5 h-5 text-amber-100" />
            <span>¡Sorpréndeme con este plan!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
