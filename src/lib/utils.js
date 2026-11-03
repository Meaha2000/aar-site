import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${Number(amount).toFixed(2)}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return 'Never';
  const ts = typeof timestamp === 'number' && timestamp < 1e11 ? timestamp * 1000 : timestamp;
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return 'Never';
  const ts = typeof timestamp === 'number' && timestamp < 1e11 ? timestamp * 1000 : timestamp;
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function maskApiKey(key) {
  if (!key) return '••••••••••••••••';
  if (key.length <= 12) return key;
  return `${key.slice(0, 12)}••••••••${key.slice(-4)}`;
}

export async function safeCopyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Suppress unhandled rejection when document is not focused or denied by browser
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = String(text);
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    return false;
  }
}
