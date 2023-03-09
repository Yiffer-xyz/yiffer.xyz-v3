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
