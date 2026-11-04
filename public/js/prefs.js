// Reads the saved display settings from the <html> element (set by theme.js and settings.js).
const root = document.documentElement;

export const setting = (name) => root.dataset[name];

// True when motion should be kept to a minimum.
export function reducedMotion() {
  return root.dataset.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const SETTINGS_EVENT = 'cs2guide:settings';
