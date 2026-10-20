/**
 * Web Push Notification Manager for OleVeci PWA
 * Handles VAPID key exchange, Service Worker subscription and background sync
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch('/api/push/vapid-public-key');
    if (!res.ok) return null;
    const data = await res.json();
    return data.publicKey || null;
  } catch (err) {
    console.warn('[Push] Error obteniendo clave pública VAPID:', err);
    return null;
  }
}

export async function subscribeUserToPush(options?: {
  city?: string;
  sector?: string;
}): Promise<{ success: boolean; subscription?: PushSubscription; error?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Este navegador o dispositivo no soporta Notificaciones Web Push.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      return { success: false, error: 'El Service Worker no está activo aún.' };
    }

    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
      return { success: false, error: 'No se pudo obtener la clave VAPID del servidor.' };
    }

    // Convert key to Uint8Array
    const convertedKey = urlBase64ToUint8Array(publicKey);

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // Send subscription to server & Supabase
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        city: options?.city,
        sector: options?.sector,
        userAgent: navigator.userAgent,
      }),
    });

    return { success: true, subscription };
  } catch (err: any) {
    console.warn('[Push] Error al suscribir dispositivo a Web Push:', err?.message);
    return { success: false, error: err?.message || 'Error al solicitar suscripción.' };
  }
}

export async function unsubscribeUserFromPush(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }
    return true;
  } catch (err) {
    console.warn('[Push] Error al desuscribir:', err);
    return false;
  }
}

export async function broadcastPushNotification(payload: {
  title: string;
  body: string;
  url?: string;
  city?: string;
  sector?: string;
}): Promise<{ success: boolean; sent?: number; failed?: number }> {
  try {
    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch {
    return { success: false };
  }
}
