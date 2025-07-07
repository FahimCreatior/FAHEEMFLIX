const CACHE_NAME = 'faheemflix-v4';
const OFFLINE_URL = '/offline.html';

// Core assets to cache during installation
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/movies.html',
  '/manifest.json',
  '/pwa.js',
  '/offline.html',
  '/config.js',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-256x256.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon.ico',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Core assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cache => cache !== CACHE_NAME)
          .map(cache => {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          })
      );
    }).then(() => {
      // Claim clients immediately to handle all fetch events
      return self.clients.claim();
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the response if valid
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          // If offline, try to get from cache
          return caches.match(OFFLINE_URL)
            .then(response => response || caches.match('/index.html'));
        })
    );
    return;
  }
  
  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(request).then(response => {
      // Return cached response if found
      if (response) {
        // Update cache in the background
        fetchAndUpdateCache(request, CACHE_NAME);
        return response;
      }
      
      // If not in cache, fetch from network
      return fetchAndUpdateCache(request, CACHE_NAME);
    })
  );
});

// Helper function to fetch and update cache
async function fetchAndUpdateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // If we got a valid response, cache it
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed:', error);
    
    // If it's an image, return a placeholder
    if (request.headers.get('Accept').includes('image')) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="#333"/></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    // For other requests, try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If we don't have a cached version, return an offline page for HTML requests
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match(OFFLINE_URL);
    }
    
    // For other requests, return a generic offline response
    return new Response('You are offline', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Listen for messages from the page
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we got a valid response, cache it
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request)
            .then(response => response || caches.match('/offline.html'));
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
