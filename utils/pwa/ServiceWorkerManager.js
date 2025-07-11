export function getRegisterScript() {
  if (process.env.NODE_ENV !== 'production') return '';
  return `if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function (err) {
        console.error('Service worker registration failed:', err);
      });
    });
  }`;
}
