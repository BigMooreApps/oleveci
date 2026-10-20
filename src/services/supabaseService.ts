import { supabase } from '../utils/supabaseClient';
import { Business, Post, Municipality, CitySector, Category, PlanCategory, PostTypeConfig } from '../types';
import { SimulatedReadyPlan } from '../data/readyPlansData';
import { THEMES } from '../components/InvitationCardPreview';
import { storageService } from './storageService';

export { storageService };

/**
 * Supabase Data Service for OleVeci
 * Provides robust cloud synchronization with graceful offline fallback.
 */

export const supabaseService = {
  /**
   * Fetches all core datasets from Supabase.
   * Returns null for any dataset that encounters an error or network issue.
   */
  async fetchAll() {
    try {
      const [
        { data: businesses, error: errBiz },
        { data: posts, error: errPosts },
        { data: municipalities, error: errMunis },
        { data: sectors, error: errSects },
        { data: categories, error: errCats },
        { data: planCategories, error: errPlanCats },
        { data: postTypes, error: errPostTypes },
        { data: readyPlans, error: errReadyPlans },
      ] = await Promise.all([
        supabase.from('businesses').select('*'),
        supabase.from('posts').select('*'),
        supabase.from('municipalities').select('*'),
        supabase.from('sectors').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('plan_categories').select('*'),
        supabase.from('post_types').select('*'),
        supabase.from('ready_plans').select('*'),
      ]);

      if (errBiz || errPosts) {
        console.warn('Advertencia al consultar Supabase:', { errBiz, errPosts });
      }

      return {
        businesses: businesses ? businesses.map(mapDbBusinessToClient) : null,
        posts: posts ? posts.map(mapDbPostToClient) : null,
        municipalities: municipalities ? municipalities.map(mapDbMuniToClient) : null,
        sectors: sectors ? sectors.map(mapDbSectorToClient) : null,
        categories: categories || null,
        planCategories: planCategories ? planCategories.map(mapDbPlanCategoryToClient) : null,
        postTypes: postTypes ? postTypes.map(mapDbPostTypeToClient) : null,
        readyPlans: readyPlans ? readyPlans.map(mapDbReadyPlanToClient) : null,
      };
    } catch (err) {
      console.warn('Supabase offline o error de red, usando almacenamiento local:', err);
      return null;
    }
  },

  /**
   * Upsert a business record into Supabase
   */
  async upsertBusiness(business: Business) {
    try {
      let finalLogo = business.logo || null;
      let finalCover = business.coverImage || null;

      if (finalLogo && finalLogo.startsWith('data:')) {
        finalLogo = (await storageService.optimizeMediaUrl(finalLogo, 'businesses')) || finalLogo;
      }
      if (finalCover && finalCover.startsWith('data:')) {
        finalCover = (await storageService.optimizeMediaUrl(finalCover, 'businesses')) || finalCover;
      }

      const dbRecord = {
        id: business.id,
        name: business.name,
        slug: business.slug,
        logo: finalLogo,
        cover_image: finalCover,
        description: business.description || null,
        category_id: business.categoryId || null,
        sub_category: business.subCategory || null,
        address: business.address || null,
        city: business.city,
        sector: business.sector || null,
        lat: business.coordinates?.lat || null,
        lng: business.coordinates?.lng || null,
        hours: business.hours || null,
        whatsapp: business.whatsapp || null,
        phone: business.phone || null,
        email: business.email || null,
        social_links: business.socialLinks || {},
        rating: business.rating || 5.0,
        verified: !!business.verified,
        featured: !!business.featured,
        status: business.status || 'active',
        subscription: business.subscription || {},
        billing_info: business.billingInfo || {},
        payment_history: business.paymentHistory || [],
        username: business.username || null,
        password: business.password || 'Veci2026',
        owner_name: business.ownerName || null,
        owner_phone: business.ownerPhone || null,
        access_email: business.accessEmail || null,
        access_pin: business.accessPin || '1234',
        metrics: business.metrics || {},
      };
      await supabase.from('businesses').upsert(dbRecord);
    } catch (err) {
      console.warn('Error sincronizando negocio con Supabase:', err);
    }
  },

  /**
   * Delete a business from Supabase (cascades to posts)
   */
  async deleteBusiness(businessId: string) {
    try {
      await supabase.from('businesses').delete().eq('id', businessId);
    } catch (err) {
      console.warn('Error eliminando negocio en Supabase:', err);
    }
  },

  /**
   * Upsert a post into Supabase
   */
  async upsertPost(post: Post) {
    try {
      let finalImageUrl = post.imageUrl || null;
      let finalVideoUrl = post.videoUrl || null;

      if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        finalImageUrl = (await storageService.optimizeMediaUrl(finalImageUrl, 'posts')) || finalImageUrl;
      }
      if (finalVideoUrl && finalVideoUrl.startsWith('data:')) {
        finalVideoUrl = (await storageService.optimizeMediaUrl(finalVideoUrl, 'posts')) || finalVideoUrl;
      }

      const dbRecord = {
        id: post.id,
        business_id: post.businessId,
        business_name: post.businessName || null,
        business_logo: post.businessLogo || null,
        business_city: post.businessCity || null,
        business_sector: post.businessSector || null,
        business_whatsapp: post.businessWhatsapp || null,
        business_phone: post.businessPhone || null,
        business_address: post.businessAddress || null,
        lat: post.coordinates?.lat || null,
        lng: post.coordinates?.lng || null,
        type: post.type,
        title: post.title,
        description: post.description || null,
        image_url: finalImageUrl,
        video_url: finalVideoUrl,
        media_type: post.mediaType || 'image',
        aspect_ratio: post.aspectRatio || '9:16',
        image_fit: post.imageFit || 'cover',
        original_price: post.originalPrice || null,
        promotional_price: post.promotionalPrice || null,
        starts_at: post.startsAt || new Date().toISOString(),
        expires_at: post.expiresAt || null,
        expiry_label: post.expiryLabel || null,
        validity_schedule: post.validitySchedule || null,
        category_id: post.categoryId || null,
        plan_category_id: post.planCategoryId || null,
        plan_category_name: post.planCategoryName || null,
        featured: !!post.featured,
        tags: post.tags || [],
        status: post.status || 'active',
        metrics: post.metrics || {},
      };
      await supabase.from('posts').upsert(dbRecord);
    } catch (err) {
      console.warn('Error sincronizando publicación con Supabase:', err);
    }
  },

  /**
   * Delete a post from Supabase
   */
  async deletePost(postId: string) {
    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (err) {
      console.warn('Error eliminando publicación en Supabase:', err);
    }
  },

  /**
   * Upsert a ready plan into Supabase
   */
  async upsertReadyPlan(plan: SimulatedReadyPlan) {
    try {
      let finalCover = plan.coverImage || null;
      if (finalCover && finalCover.startsWith('data:')) {
        finalCover = (await storageService.optimizeMediaUrl(finalCover, 'itineraries')) || finalCover;
      }

      const dbRecord = {
        id: plan.id,
        title: plan.planTitle || 'Plan Sugerido',
        slug: plan.id,
        category_id: plan.category || null,
        city: plan.municipality || 'Cajicá',
        budget: `$${(plan.estimatedBudget || 0).toLocaleString('es-CO')} COP`,
        budget_num: plan.estimatedBudget || 0,
        duration: plan.scheduledTime || '2 a 3 horas',
        highlight: plan.personalNote || null,
        cover_image: finalCover,
        stops: plan.postIds || [],
        is_active: true,
        plan_data: { ...plan, coverImage: finalCover || plan.coverImage },
      };
      await supabase.from('ready_plans').upsert(dbRecord);
    } catch (err) {
      console.warn('Error sincronizando plan con Supabase:', err);
    }
  },

  /**
   * Delete a ready plan from Supabase
   */
  async deleteReadyPlan(planId: string) {
    try {
      await supabase.from('ready_plans').delete().eq('id', planId);
    } catch (err) {
      console.warn('Error eliminando plan en Supabase:', err);
    }
  },

  /**
   * Records an interaction event in Supabase for realtime metrics & audit trail
   */
  async recordInteraction(businessId: string, postId?: string, type?: string) {
    try {
      await supabase.from('interactions').insert({
        business_id: businessId,
        post_id: postId || null,
        type: type || 'view',
      });
    } catch (err) {
      // Non-blocking interaction audit
    }
  },
};

// Data mappers to preserve camelCase frontend contracts
function mapDbBusinessToClient(db: any): Business {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    logo: db.logo || '',
    coverImage: db.cover_image || '',
    description: db.description || '',
    categoryId: db.category_id || '',
    subCategory: db.sub_category || '',
    address: db.address || '',
    city: db.city || '',
    sector: db.sector || '',
    coordinates: { lat: db.lat || 4.9192, lng: db.lng || -74.0265 },
    hours: db.hours || '',
    whatsapp: db.whatsapp || '',
    phone: db.phone || '',
    email: db.email,
    socialLinks: db.social_links || {},
    rating: db.rating || 5.0,
    verified: !!db.verified,
    featured: !!db.featured,
    status: db.status || 'active',
    subscription: db.subscription || {
      status: 'active',
      planName: 'Plan Mensual OleVeci',
      priceCOP: 29900,
      billingCycle: 'monthly',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
    },
    billingInfo: db.billing_info,
    paymentHistory: db.payment_history || [],
    username: db.username,
    password: db.password || 'Veci2026',
    ownerName: db.owner_name,
    ownerPhone: db.owner_phone,
    accessEmail: db.access_email,
    accessPin: db.access_pin || '1234',
    metrics: db.metrics || { views: 0, whatsappClicks: 0, mapsClicks: 0, calls: 0, shares: 0, qrRedemptions: 0 },
    createdAt: db.created_at || new Date().toISOString(),
  };
}

function mapDbPostToClient(db: any): Post {
  return {
    id: db.id,
    businessId: db.business_id,
    businessName: db.business_name || '',
    businessLogo: db.business_logo || '',
    businessCity: db.business_city || '',
    businessSector: db.business_sector || '',
    businessWhatsapp: db.business_whatsapp || '',
    businessPhone: db.business_phone || '',
    businessAddress: db.business_address || '',
    coordinates: { lat: db.lat || 4.9192, lng: db.lng || -74.0265 },
    type: db.type,
    title: db.title,
    description: db.description || '',
    imageUrl: db.image_url || '',
    videoUrl: db.video_url,
    mediaType: db.media_type || 'image',
    aspectRatio: db.aspect_ratio || '9:16',
    imageFit: db.image_fit || 'cover',
    originalPrice: db.original_price ? Number(db.original_price) : undefined,
    promotionalPrice: db.promotional_price ? Number(db.promotional_price) : undefined,
    startsAt: db.starts_at || new Date().toISOString(),
    expiresAt: db.expires_at,
    expiryLabel: db.expiry_label,
    validitySchedule: db.validity_schedule,
    categoryId: db.category_id || '',
    planCategoryId: db.plan_category_id,
    planCategoryName: db.plan_category_name,
    featured: !!db.featured,
    tags: db.tags || [],
    status: db.status || 'active',
    metrics: db.metrics || { views: 0, whatsappClicks: 0, mapsClicks: 0, calls: 0, shares: 0, qrRedemptions: 0 },
    createdAt: db.created_at || new Date().toISOString(),
  };
}

function mapDbMuniToClient(db: any): Municipality {
  return {
    id: db.id,
    name: db.name,
    department: db.department,
    coordinates: { lat: db.lat, lng: db.lng },
    code: db.code,
    isPilot: !!db.is_pilot,
    isActive: db.is_active ?? true,
  };
}

function mapDbSectorToClient(db: any): CitySector {
  return {
    id: db.id,
    name: db.name,
    cityName: db.city_name,
    coordinates: { lat: db.lat, lng: db.lng },
    type: db.type || 'urban',
    radiusMeters: db.radius_meters,
  };
}

function mapDbPlanCategoryToClient(db: any): PlanCategory {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    subtitle: db.subtitle || '',
    iconName: db.icon_name || 'Tag',
    color: db.color || '#007af7',
    badgeBg: db.badge_bg,
    badgeText: db.badge_text,
    allowedCategoryIds: db.allowed_category_ids || [],
    maxMainDishes: db.max_main_dishes || 1,
    preventDuplicateCategories: db.prevent_duplicate_categories ?? true,
    isActive: db.is_active ?? true,
    order: db.display_order || 0,
  };
}

function mapDbPostTypeToClient(db: any): PostTypeConfig {
  return {
    id: db.id,
    label: db.label,
    slug: db.slug,
    iconName: db.icon_name,
    color: db.color,
    badgeBg: db.badge_bg,
    badgeText: db.badge_text,
    description: db.description,
    order: db.display_order || 0,
  };
}

function mapDbReadyPlanToClient(db: any): SimulatedReadyPlan {
  if (db.plan_data && typeof db.plan_data === 'object' && db.plan_data.id) {
    return db.plan_data as SimulatedReadyPlan;
  }
  return {
    id: db.id,
    planTitle: db.title,
    scheduledTime: db.duration || '2 a 3 horas',
    coverImage: db.cover_image,
    personalNote: db.highlight,
    hidePrices: false,
    cardTemplate: 'vip_club',
    theme: THEMES.dark_vip,
    bgLayout: 'cinematic',
    postIds: Array.isArray(db.stops) ? db.stops : [],
    category: db.category_id || 'plan_otros',
    estimatedBudget: Number(db.budget_num) || 0,
    municipality: db.city || 'Cajicá',
    timeOfDay: 'tarde',
    dayType: 'weekend',
    tags: [],
  };
}
