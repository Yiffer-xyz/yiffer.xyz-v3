export function capitalizeString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function waitMillisec(millisec: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), millisec);
  });
}
