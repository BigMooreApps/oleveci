import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_MUNICIPALITIES,
  INITIAL_SECTORS,
  INITIAL_CATEGORIES,
  INITIAL_PLAN_CATEGORIES,
  INITIAL_POST_TYPES,
  INITIAL_BUSINESSES,
  INITIAL_POSTS,
} from '../src/data/seedData';
import { READY_PLANS_SEED } from '../src/data/readyPlansData';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gpdqjihnnjetoxxfsfxh.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZHFqaWhubmpldG94eGZzZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDQxNzksImV4cCI6MjEwODAyMDE3OX0.pAMZfYE0FtTGhWF76xogOQUU_SlKbE3JQM5QV7mEViA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log('--- Iniciando siembra de datos en Supabase ---');

  // 1. Municipalities
  console.log(`Sembrando ${INITIAL_MUNICIPALITIES.length} municipios...`);
  const munis = INITIAL_MUNICIPALITIES.map((m) => ({
    id: m.id,
    name: m.name,
    department: m.department,
    lat: m.coordinates.lat,
    lng: m.coordinates.lng,
    code: m.code || null,
    is_pilot: !!m.isPilot,
    is_active: m.isActive ?? true,
  }));
  const { error: errMuni } = await supabase.from('municipalities').upsert(munis);
  if (errMuni) console.error('Error sembrando municipios:', errMuni);

  // 2. Sectors (in batches of 30)
  console.log(`Sembrando ${INITIAL_SECTORS.length} sectores en lotes...`);
  const sects = INITIAL_SECTORS.map((s) => ({
    id: s.id,
    name: s.name,
    city_name: s.cityName,
    lat: s.coordinates.lat,
    lng: s.coordinates.lng,
    type: s.type || 'urban',
    radius_meters: s.radiusMeters || null,
  }));
  for (let i = 0; i < sects.length; i += 30) {
    const chunk = sects.slice(i, i + 30);
    const { error: errSect } = await supabase.from('sectors').upsert(chunk);
    if (errSect) console.error(`Error sembrando lote de sectores ${i}-${i + 30}:`, errSect);
  }

  // 3. Categories
  console.log(`Sembrando ${INITIAL_CATEGORIES.length} categorias...`);
  const cats = INITIAL_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon_name: c.iconName,
    description: c.description || null,
    color: c.color || null,
  }));
  const { error: errCats } = await supabase.from('categories').upsert(cats);
  if (errCats) console.error('Error sembrando categorias:', errCats);

  // 4. Plan Categories
  console.log(`Sembrando ${INITIAL_PLAN_CATEGORIES.length} categorias de planes...`);
  const planCats = INITIAL_PLAN_CATEGORIES.map((pc) => ({
    id: pc.id,
    name: pc.name,
    slug: pc.slug,
    subtitle: pc.subtitle || null,
    icon_name: pc.iconName || null,
    color: pc.color || null,
    badge_bg: pc.badgeBg || null,
    badge_text: pc.badgeText || null,
    allowed_category_ids: pc.allowedCategoryIds || [],
    max_main_dishes: pc.maxMainDishes || 1,
    prevent_duplicate_categories: pc.preventDuplicateCategories ?? true,
    is_active: pc.isActive ?? true,
    display_order: pc.order || 0,
  }));
  const { error: errPlanCats } = await supabase.from('plan_categories').upsert(planCats);
  if (errPlanCats) console.error('Error sembrando categorias de planes:', errPlanCats);

  // 5. Post Types
  console.log(`Sembrando ${INITIAL_POST_TYPES.length} tipos de publicacion...`);
  const pts = INITIAL_POST_TYPES.map((pt) => ({
    id: pt.id,
    label: pt.label,
    slug: pt.slug || null,
    icon_name: pt.iconName || null,
    color: pt.color || null,
    badge_bg: pt.badgeBg || null,
    badge_text: pt.badgeText || null,
    description: pt.description || null,
    display_order: pt.order || 0,
  }));
  const { error: errPts } = await supabase.from('post_types').upsert(pts);
  if (errPts) console.error('Error sembrando tipos de publicacion:', errPts);

  // 6. Businesses
  console.log(`Sembrando ${INITIAL_BUSINESSES.length} comercios...`);
  const bizs = INITIAL_BUSINESSES.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo || null,
    cover_image: b.coverImage || null,
    description: b.description || null,
    category_id: b.categoryId || null,
    sub_category: b.subCategory || null,
    address: b.address || null,
    city: b.city,
    sector: b.sector || null,
    lat: b.coordinates?.lat || null,
    lng: b.coordinates?.lng || null,
    hours: b.hours || null,
    whatsapp: b.whatsapp || null,
    phone: b.phone || null,
    email: b.email || null,
    social_links: b.socialLinks || {},
    rating: b.rating || 5.0,
    verified: !!b.verified,
    featured: !!b.featured,
    status: b.status || 'active',
    subscription: b.subscription || {},
    billing_info: b.billingInfo || {},
    payment_history: b.paymentHistory || [],
    username: b.username || null,
    password: b.password || 'Veci2026',
    owner_name: b.ownerName || null,
    owner_phone: b.ownerPhone || null,
    access_email: b.accessEmail || null,
    access_pin: b.accessPin || '1234',
    metrics: b.metrics || {},
  }));
  const { error: errBiz } = await supabase.from('businesses').upsert(bizs);
  if (errBiz) console.error('Error sembrando comercios:', errBiz);

  // 7. Posts
  console.log(`Sembrando ${INITIAL_POSTS.length} publicaciones...`);
  const psts = INITIAL_POSTS.map((p) => ({
    id: p.id,
    business_id: p.businessId,
    business_name: p.businessName || null,
    business_logo: p.businessLogo || null,
    business_city: p.businessCity || null,
    business_sector: p.businessSector || null,
    business_whatsapp: p.businessWhatsapp || null,
    business_phone: p.businessPhone || null,
    business_address: p.businessAddress || null,
    lat: p.coordinates?.lat || null,
    lng: p.coordinates?.lng || null,
    type: p.type,
    title: p.title,
    description: p.description || null,
    image_url: p.imageUrl || null,
    video_url: p.videoUrl || null,
    media_type: p.mediaType || 'image',
    aspect_ratio: p.aspectRatio || '9:16',
    image_fit: p.imageFit || 'cover',
    original_price: p.originalPrice || null,
    promotional_price: p.promotionalPrice || null,
    starts_at: p.startsAt || new Date().toISOString(),
    expires_at: p.expiresAt || null,
    expiry_label: p.expiryLabel || null,
    validity_schedule: p.validitySchedule || null,
    category_id: p.categoryId || null,
    plan_category_id: p.planCategoryId || null,
    plan_category_name: p.planCategoryName || null,
    featured: !!p.featured,
    tags: p.tags || [],
    status: p.status || 'active',
    metrics: p.metrics || {},
  }));
  const { error: errPsts } = await supabase.from('posts').upsert(psts);
  if (errPsts) console.error('Error sembrando publicaciones:', errPsts);

  // 8. Ready Plans
  console.log(`Sembrando ${READY_PLANS_SEED.length} planes sugeridos...`);
  const rPlans = READY_PLANS_SEED.map((rp) => ({
    id: rp.id,
    title: rp.planTitle || 'Plan Sugerido',
    slug: rp.id,
    category_id: rp.category || null,
    city: rp.municipality || 'Cajicá',
    budget: `$${(rp.estimatedBudget || 0).toLocaleString('es-CO')} COP`,
    budget_num: rp.estimatedBudget || 0,
    duration: rp.scheduledTime || '2 a 3 horas',
    highlight: rp.personalNote || null,
    cover_image: rp.coverImage || null,
    stops: rp.postIds || [],
    is_active: true,
  }));
  const { error: errPlans } = await supabase.from('ready_plans').upsert(rPlans);
  if (errPlans) console.error('Error sembrando planes:', errPlans);

  console.log('--- ¡Siembra de datos en Supabase completada con exito! ---');
}

seed().catch(console.error);
