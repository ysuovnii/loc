import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function PixelZoomControl() {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'topright' });

    control.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-bar pixel-zoom-control');
      container.innerHTML = `
        <button type="button" class="pixel-zoom-btn pixel-zoom-in" aria-label="Zoom in">+</button>
        <button type="button" class="pixel-zoom-btn pixel-zoom-out" aria-label="Zoom out">−</button>
      `;

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      container.querySelector('.pixel-zoom-in').addEventListener('click', () => {
        map.zoomIn();
      });
      container.querySelector('.pixel-zoom-out').addEventListener('click', () => {
        map.zoomOut();
      });

      return container;
    };

    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);

  return null;
}
