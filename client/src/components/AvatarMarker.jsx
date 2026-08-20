import L from 'leaflet';
import styles from './AvatarMarker.module.css';

const AVATAR_URL = 'https://avatars.githubusercontent.com/u/104831263?v=4';

export function createAvatarIcon() {
  return L.divIcon({
    className: styles.marker,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    html: `
      <img class="${styles.avatar}" src="${AVATAR_URL}" alt="marker" draggable="false" />
      <div class="${styles.pointer}"></div>
      <div class="${styles.ring}"></div>
      <div class="${styles.ring}"></div>
    `,
  });
}

export const avatarIcon = createAvatarIcon();
