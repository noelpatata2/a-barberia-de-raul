const CACHE_NAME = 'barberia-raul-v3';

// Install: skip waiting to activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate: clear ALL old caches and take control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, fallback to index.html for navigation
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Don't intercept API or Google auth calls
  if (url.href.includes('script.google.com') || url.href.includes('accounts.google.com')) {
    return;
  }

  // For navigation requests (HTML pages), always try network first
  // If it fails, serve index.html (SPA fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('./index.html')
      )
    );
    return;
  }

  // For other assets, network first with cache fallback
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});