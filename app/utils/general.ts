import { useLocation } from '@remix-run/react';
import { useMemo } from 'react';
import type { EditAdFormData } from '~/routes/api.edit-ad';
import type { SubmitAdFormData } from '~/routes/api.submit-ad';
import {
  CARD_AD_MAIN_TEXT_MAX_LENGTH,
  CARD_AD_SECONDARY_TEXT_MAX_LENGTH,
} from '~/types/constants';
import type { AdForViewing, ComicForBrowse } from '~/types/types';

export function capitalizeString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeFirstRestLower(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export async function waitMillisec(millisec: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), millisec);
  });
}

const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function randomString(i: number): string {
  let text = '';

  for (let j = 0; j < i; j++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export type FieldChange = {
  field: string;
  oldValue?: string;
  newValue?: string;
  newDataValue?: any;
};

export type ComicImage = {
  base64?: string;
  url?: string;
  file?: File;
};

export async function getFilesWithBase64(files: FileList): Promise<ComicImage[]> {
  const filePromises = Array.from(files).map(file => getFileWithBase64(file));
  return Promise.all(filePromises);
}

export async function getFileWithBase64(file: File): Promise<ComicImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        resolve({ base64: reader.result.toString(), file });
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
}

export function isUsernameUrl(str: string): boolean {
  if (str.includes('http:') || str.includes('https:') || str.includes('www.')) {
    return true;
  }
  if (str.includes('.com') || str.includes('.net')) {
    return true;
  }

  return false;
}

export function boolToInt(bool: boolean): 0 | 1 {
  return bool ? 1 : 0;
}

export function padPageNumber(pageNumber: number) {
  return pageNumber.toString().padStart(4, '0');
}

export function pageNumberToPageName(pageNum: number, filename: string): string {
  const pageNumberString = padPageNumber(pageNum);
  return `${pageNumberString}.${getFileExtension(filename)}`;
}

export function getFileExtension(filename: string) {
  return filename.substring(filename.lastIndexOf('.') + 1).replace('jpeg', 'jpg');
}

export function generateRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function isComic(
  comicOrAd: ComicForBrowse | AdForViewing
): comicOrAd is ComicForBrowse {
  return !!(comicOrAd as ComicForBrowse).name;
}

export function validateAdData(data: SubmitAdFormData | EditAdFormData): {
  error: string | null;
} {
  if (!data.adType || !data.link || !data.adName || !data.id) {
    return { error: 'Missing fields' };
  }
  if (!data.link.includes('http://') && !data.link.includes('https://')) {
    return { error: 'Link must start with http:// or https://' };
  }
  if (data.adType === 'card') {
    if (!data.mainText) {
      return { error: 'Missing main text' };
    }
    if (data.mainText.length > CARD_AD_MAIN_TEXT_MAX_LENGTH) {
      return { error: `Main text too long` };
    }
    if (
      data.secondaryText &&
      data.secondaryText.length > CARD_AD_SECONDARY_TEXT_MAX_LENGTH
    ) {
      return { error: `Secondary text too long` };
    }
  }

  if (isAdEditAdData(data)) {
    if (data.status === 'ACTIVE' && !data.expiryDate) {
      return { error: 'Expiry date must be set for active ads' };
    }
  }

  return { error: null };
}

export function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  return arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i]);
}

export function isAdEditAdData(
  data: SubmitAdFormData | EditAdFormData
): data is EditAdFormData {
  return !!(data as EditAdFormData).id;
}

export function useAuthRedirect() {
  const location = useLocation();

  const redirectAfterAuthStr = useMemo(() => {
    const search = location.search;
    if (!search || search.length === 0 || !search.includes('?redirect')) return null;
    const redirect = search.split('?redirect=')[1];
    if (!redirect || redirect.length === 0 || !redirect.startsWith('/')) return null;
    return redirect;
  }, [location]);

  const redirectSetOnLoginNavStr = useMemo(() => {
    if (location.pathname === '/') return '';
    return `?redirect=${location.pathname + location.search}`;
  }, [location]);

  return { redirectAfterAuthStr, redirectSetOnLoginNavStr };
}

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function chunk(array: string[], size: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
