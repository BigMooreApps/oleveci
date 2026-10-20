import L from 'leaflet';

export interface OleVeciPinOptions {
  label?: string;
  priceTag?: string;
  isDraggable?: boolean;
  size?: number;
  pulse?: boolean;
}

/**
 * Creates a Leaflet divIcon using the official OleVeci pin asset with inline SVG vector fallback.
 * Anchors accurately at the bottom tip of the pin onto the exact map coordinates.
 */
export const createOleVeciPinIcon = (options: OleVeciPinOptions = {}) => {
  const {
    label,
    priceTag,
    isDraggable = false,
    size = 58,
    pulse = true,
  } = options;

  const cursorClass = isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer';
  // Aspect ratio of the official 164x186 asset is ~1.134
  const width = size;
  const height = Math.round(width * (186 / 164));

  // In the clean 164x186 image without floor shadow, the pin tip converges at x=74 (~45%) and y=174 (~94%)
  const anchorX = Math.round(width * 0.45);
  const anchorY = Math.round(height * 0.94);

  const html = `
    <div style="position: relative; width: ${width}px; height: ${height}px; user-select: none;" class="${cursorClass}">
      ${
        label || priceTag
          ? `<div style="position: absolute; bottom: calc(100% + 5px); left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; pointer-events: none; z-index: 50; filter: drop-shadow(0 4px 12px rgba(4,31,94,0.35));">
              <div style="background: linear-gradient(135deg, #041f5e, #007af7); color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; white-space: nowrap; border: 1.5px solid #ffffff; letter-spacing: 0.2px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; line-height: 1.25; display: flex; align-items: center; gap: 4px;">
                ${priceTag ? `<span style="background: #ff7700; color: #ffffff; padding: 1px 6px; border-radius: 9999px; font-size: 10px; font-weight: 900;">${priceTag}</span>` : ''}
                ${label ? `<span>${label}</span>` : ''}
              </div>
              <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #007af7; margin-top: -1px;"></div>
            </div>`
          : ''
      }
      <svg
        viewBox="0 0 164 186"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; filter: drop-shadow(0 6px 14px rgba(4,31,94,0.35));"
      >
        <path d="M82 178 C82 178 12 110 12 66 C12 28 43 2 82 2 C121 2 152 28 152 66 C152 110 82 178 82 178 Z" fill="url(#pinBlueGrad-${Math.round(anchorX)})" />
        <circle cx="82" cy="66" r="36" fill="#ffffff" />
        <path d="M66 58 L98 58 L94 74 L70 74 Z" fill="#021b58" />
        <rect x="74" y="74" width="16" height="18" rx="2" fill="#007af7" />
        <defs>
          <linearGradient id="pinBlueGrad-${Math.round(anchorX)}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0088ff" />
            <stop offset="50%" stop-color="#0062f5" />
            <stop offset="100%" stop-color="#021b58" />
          </linearGradient>
        </defs>
      </svg>
      <img
        src="https://gpdqjihnnjetoxxfsfxh.supabase.co/storage/v1/object/public/oleveci-media/brand/Icono_Oleveci_sin_fondo.png"
        alt=""
        aria-hidden="true"
        onerror="if(this.src!=='/Icono_Oleveci_sin_fondo.png'){this.src='/Icono_Oleveci_sin_fondo.png';}else{this.style.opacity='0';}"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; display: block; filter: drop-shadow(0 8px 16px rgba(4,31,94,0.35)); pointer-events: none; z-index: 1;"
        draggable="false"
      />
      ${
        pulse
          ? `<div style="position: absolute; top: ${anchorY}px; left: ${anchorX}px; transform: translate(-50%, -50%); width: 26px; height: 10px; background: radial-gradient(ellipse at center, rgba(0,122,247,0.6) 0%, rgba(0,122,247,0) 75%); border-radius: 9999px; pointer-events: none; z-index: -1;"></div>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    className: 'oleveci-leaflet-marker',
    html,
    iconSize: [width, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -height - 8],
  });
};
