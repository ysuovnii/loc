import L from 'leaflet';
import styles from './AvatarMarker.module.css';

/**
 * Creates the main tracked user marker: A modern drop pin with the 📍 emoji.
 */
export function createDropPinIcon() {
  return L.divIcon({
    className: styles.marker,
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    popupAnchor: [0, -48],
    html: `
      <div class="${styles.dropPinWrapper}">
        <div class="${styles.ring}"></div>
        <div class="${styles.ring}"></div>
        <div class="${styles.dropPinPointer}"></div>
        <div class="${styles.dropPinHead}">
          <span class="${styles.pinEmoji}">📍</span>
        </div>
      </div>
    `,
  });
}

/**
 * Creates the Viewer's self-location marker ("You are here" blue radar dot)
 */
export function createUserLocationIcon() {
  return L.divIcon({
    className: styles.marker,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    html: `
      <div class="${styles.viewerDotWrapper}">
        <div class="${styles.viewerDotHalo}"></div>
        <div class="${styles.viewerDotCenter}"></div>
      </div>
    `,
  });
}

/**
 * Creates the origin marker for the start of the 24-hour history trail
 */
export function createStartPointIcon() {
  return L.divIcon({
    className: styles.marker,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
    popupAnchor: [0, -14],
    html: `
      <div class="${styles.startDotWrapper}">
        <div class="${styles.startDot}"></div>
        <span class="${styles.startLabel}">START</span>
      </div>
    `,
  });
}

/**
 * Creates an interactive breadcrumb dot along the history trail
 */
export function createWaypointIcon() {
  return L.divIcon({
    className: styles.marker,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -8],
    html: `<div class="${styles.waypointDot}"></div>`,
  });
}

export const dropPinIcon = createDropPinIcon();
export const avatarIcon = dropPinIcon; // Alias for backward compatibility
export const userLocationIcon = createUserLocationIcon();
export const startPointIcon = createStartPointIcon();
export const waypointIcon = createWaypointIcon();
