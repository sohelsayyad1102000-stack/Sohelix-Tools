import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File, quality: number) => {
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    initialQuality: quality,
  };
  return await imageCompression(file, options);
};

export const resizeImage = (file: File, w?: number, h?: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');

      const targetWidth = w || img.width;
      const targetHeight = h || img.height;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Blob creation failed');
      }, file.type);
    };
    img.onerror = reject;
  });
};

export const cropImage = (file: File, xPct: number, yPct: number, widthPct: number, heightPct: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');

      const x = (xPct / 100) * img.width;
      const y = (yPct / 100) * img.height;
      const w = (widthPct / 100) * img.width;
      const h = (heightPct / 100) * img.height;

      canvas.width = w;
      canvas.height = h;
      
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Blob creation failed');
      }, file.type);
    };
    img.onerror = reject;
  });
};

export const convertFormat = (file: File, format: string, quality: number = 0.9): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');
      canvas.width = img.width;
      canvas.height = img.height;
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Blob creation failed');
      }, format, quality);
    };
    img.onerror = reject;
  });
};

export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const rotateImage = (file: File, angle: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');

      if (angle === 90 || angle === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Blob creation failed');
      }, file.type);
    };
    img.onerror = reject;
  });
};

export const blurImage = (file: File, blurAmount: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Blob creation failed');
      }, file.type);
    };
    img.onerror = reject;
  });
};

export const watermarkImage = (file: File, text: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      ctx.font = `bold ${Math.floor(canvas.width * 0.05)}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Blob creation failed');
      }, file.type);
    };
    img.onerror = reject;
  });
};
