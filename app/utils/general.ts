export function capitalizeString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function waitMillisec(millisec: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), millisec);
  });
}

export function randomString(i: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

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
