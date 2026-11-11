/* Pérola Leite Studio — cache apenas de recursos públicos, nunca dados das clientes. */
const CACHE_NAME = 'perola-leite-ui-v5';
const OFFLINE_ASSETS = [
  './', './index.html', './styles.css', './data.js', './calendar-ui.js',
  './time-ui.js', './app.js', './forms.js', './pdf.js', './pwa.js', './site.webmanifest',
  './assets/brand-icon.svg'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
      }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok && url.pathname.includes('/Perola_Leite_Studio/')) {
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});