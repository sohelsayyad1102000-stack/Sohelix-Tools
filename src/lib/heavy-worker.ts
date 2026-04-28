/**
 * Sohelix Heavy Processing Worker
 * Handles image manipulation and heavy calculations off-main-thread
 */

self.onmessage = async (e: MessageEvent) => {
  const { action, payload, id } = e.data;

  try {
    switch (action) {
      case 'PROCESS_IMAGE':
        const result = await processImage(payload);
        self.postMessage({ id, result });
        break;
      case 'MINIFY_CSS':
        // Future optimization
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};

async function processImage(payload: { 
  imageBitmap: ImageBitmap, 
  w?: number, 
  h?: number, 
  angle?: number, 
  blur?: number, 
  watermark?: string,
  crop?: { x: number, y: number, w: number, h: number },
  format?: string,
  quality?: number
}) {
  const { imageBitmap, w, h, angle, blur, watermark, crop, format = 'image/jpeg', quality = 0.9 } = payload;
  
  const canvas = new OffscreenCanvas(
    w || (angle === 90 || angle === 270 ? imageBitmap.height : imageBitmap.width),
    h || (angle === 90 || angle === 270 ? imageBitmap.width : imageBitmap.height)
  );
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Handle Rotation
  if (angle) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(imageBitmap, -imageBitmap.width / 2, -imageBitmap.height / 2);
  } else if (crop) {
    canvas.width = crop.w;
    canvas.height = crop.h;
    ctx.drawImage(imageBitmap, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  } else {
    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
  }

  // Handle Blur
  if (blur) {
    // Note: OffscreenCanvas supports filter in most modern browsers
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(canvas, 0, 0);
  }

  // Handle Watermark
  if (watermark) {
    ctx.font = `bold ${Math.floor(canvas.width * 0.05)}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(watermark, canvas.width / 2, canvas.height / 2);
  }

  const blob = await canvas.convertToBlob({ type: format, quality });
  return blob;
}
