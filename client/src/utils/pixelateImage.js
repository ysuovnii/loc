const AVATAR_URL = 'https://avatars.githubusercontent.com/u/104831263?v=4';

let cachedPixelAvatar = null;

export function getAvatarUrl() {
  return AVATAR_URL;
}

export function pixelateImage(source, gridSize = 18, scale = 4) {
  const smallCanvas = document.createElement('canvas');
  const smallCtx = smallCanvas.getContext('2d');
  smallCanvas.width = gridSize;
  smallCanvas.height = gridSize;
  smallCtx.imageSmoothingEnabled = false;
  smallCtx.drawImage(source, 0, 0, gridSize, gridSize);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const outputSize = gridSize * scale;
  canvas.width = outputSize;
  canvas.height = outputSize;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(smallCanvas, 0, 0, gridSize, gridSize, 0, 0, outputSize, outputSize);

  return canvas.toDataURL('image/png');
}

export function loadPixelAvatar() {
  if (cachedPixelAvatar) {
    return Promise.resolve(cachedPixelAvatar);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedPixelAvatar = pixelateImage(img);
      resolve(cachedPixelAvatar);
    };
    img.onerror = reject;
    img.src = AVATAR_URL;
  });
}
