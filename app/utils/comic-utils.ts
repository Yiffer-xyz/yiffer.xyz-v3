import type { PageDisplay } from '~/types/types';

export function displayToPageStyle(display: PageDisplay, serverSafe = false) {
  const useWindowDim = !serverSafe && typeof window !== 'undefined';
  let widthPadding = 32;
  if (useWindowDim) {
    if (document.body.clientWidth > 768) {
      widthPadding = 40;
    }
  }

  if (display === 'Fit width') {
    return {
      width: 'auto',
      maxHeight: 'none',
      maxWidth: useWindowDim ? document.body.clientWidth - widthPadding + 'px' : '100%',
    };
  }
  if (display === 'Fit height') {
    return {
      width: 'auto',
      maxHeight: useWindowDim ? document.body.clientHeight + 'px' : '100vh',
      maxWidth: '100%',
    };
  }
  if (display === 'Full size') {
    return {
      width: 'auto',
      maxHeight: 'none',
      maxWidth: 'none',
    };
  }
  return {
    width: '100px',
    maxHeight: 'none',
    maxWidth: '100%',
  };
}
