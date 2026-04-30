import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeFullUrl(path: string) {
  if (!path) return 'https://sohelix.com/';
  
  // Already a full canonical URL
  if (path.startsWith('https://sohelix.com')) {
    let url = path;
    const [base, query] = url.split('?');
    const [pathPart, hash] = base.split('#');
    
    let normalized = pathPart;
    if (!normalized.endsWith('/') && !normalized.split('/').pop()?.includes('.')) {
      normalized += '/';
    }
    
    return normalized + (query ? `?${query}` : '') + (hash ? `#${hash}` : '');
  }

  // Handle relative or absolute paths
  const base = 'https://sohelix.com';
  const url = new URL(path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`);
  
  // Force HTTPS if it's our domain
  if (url.hostname === 'sohelix.com' || url.hostname === 'localhost') {
    url.protocol = 'https:';
    url.hostname = 'sohelix.com';
  }

  let pathname = url.pathname;
  if (!pathname.endsWith('/') && !pathname.split('/').pop()?.includes('.')) {
    pathname += '/';
  }
  
  pathname = pathname.replace(/\/+/g, '/');
  return base + pathname + url.search + url.hash;
}

export function normalizeInternalLink(path: string) {
  if (!path) return '/';
  if (path.startsWith('http') && !path.includes('sohelix.com')) return path;
  
  const url = new URL(path, 'https://sohelix.com');
  let pathname = url.pathname;
  
  // Add trailing slash if missing and not a file
  if (!pathname.endsWith('/') && !pathname.split('/').pop()?.includes('.')) {
    pathname += '/';
  }
  
  pathname = pathname.replace(/\/+/g, '/');
  
  return pathname + url.search + url.hash;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
