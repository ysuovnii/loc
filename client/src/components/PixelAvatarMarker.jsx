import { useEffect, useState } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { loadPixelAvatar } from '../utils/pixelateImage';

function createAvatarIcon(dataUrl) {
  return L.divIcon({
    className: 'avatar-marker-icon',
    html: `
      <div class="avatar-marker">
        <span class="avatar-marker-ring avatar-marker-ring--outer"></span>
        <span class="avatar-marker-ring avatar-marker-ring--inner"></span>
        <img class="avatar-marker-img" src="${dataUrl}" alt="You" draggable="false" />
        <span class="avatar-marker-pin"></span>
      </div>
    `,
    iconSize: [72, 88],
    iconAnchor: [36, 80],
    popupAnchor: [0, -72],
  });
}

export default function PixelAvatarMarker({ latitude, longitude, label = 'YOU' }) {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    let active = true;

    loadPixelAvatar()
      .then((dataUrl) => {
        if (active) setIcon(createAvatarIcon(dataUrl));
      })
      .catch(() => {
        if (active) {
          setIcon(
            createAvatarIcon(
              'data:image/svg+xml,' +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="#00e5a0"/></svg>',
                ),
            ),
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!icon) return null;

  return (
    <Marker
      position={[latitude, longitude]}
      icon={icon}
      zIndexOffset={1000}
      eventHandlers={{
        add: (e) => {
          const el = e.target.getElement();
          if (el && label) {
            el.setAttribute('data-label', label);
          }
        },
      }}
    />
  );
}
