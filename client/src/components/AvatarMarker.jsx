import L from 'leaflet';
import styles from './AvatarMarker.module.css';

const AVATAR_URL = 'https://avatars.githubusercontent.com/u/104831263?v=4';

export function createAvatarIcon(label = 'YOU') {
  return L.divIcon({
    className: styles.marker,
    iconSize: [44, 62],
    iconAnchor: [22, 42],
    popupAnchor: [0, -46],
    html: `
      <div class="${styles.pointerWrap}">
        <span class="${styles.avatarRing}"></span>
        <span class="${styles.avatarImg}">
          <img src="${AVATAR_URL}" alt="" />
        </span>
        <span class="${styles.pointerTip}"></span>
        <span class="${styles.avatarLabel}">${label}</span>
      </div>
    `,
  });
}

export function createStartPointIcon() {
  return L.divIcon({
    className: styles.marker,
    iconSize: [30, 24],
    iconAnchor: [15, 22],
    popupAnchor: [0, -26],
    html: `
      <div class="${styles.startWrap}">
        <span class="${styles.startDot}"></span>
        <span class="${styles.startLabel}">START</span>
      </div>
    `,
  });
}

export function createWaypointIcon(opacity = 1) {
  return L.divIcon({
    className: styles.marker,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
    popupAnchor: [0, -10],
    html: `<div class="${styles.waypoint}" style="opacity:${opacity}"></div>`,
  });
}

export const avatarIcon = createAvatarIcon();
export const startPointIcon = createStartPointIcon();
export const waypointIcon = createWaypointIcon();