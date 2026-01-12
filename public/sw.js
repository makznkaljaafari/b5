
const CACHE_NAME = 'alshwaia-v3-stable';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx', // Added main entry point
  '/metadata.json', // Ensure metadata is cached
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // حظر الكاش لطلبات البيانات الحية وللتأكد من أن JS/CSS يتم تحديثها من الشبكة
  // Vite build output files often have hashes, so caching them directly is fine after initial fetch.
  const isDynamicRequest = 
    url.hostname.includes('supabase.co') || 
    url.hostname.includes('googleapis.com') ||
    url.pathname.includes('/api/');

  if (isDynamicRequest) {
    // For dynamic requests, always try network first. Fallback to cache (if any) on network failure.
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If cached, return cached response
      if (cachedResponse) return cachedResponse;
      
      // If not cached, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache valid network responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fetch fails (e.g., offline), and it's a navigation request, serve index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // For other types of requests (e.g., assets), return a generic offline fallback or error
        // A more robust app might have an explicit offline.html
        return new Response('Network request failed and no cache available.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({'Content-Type': 'text/plain'})
        });
      });
    })
  );
});