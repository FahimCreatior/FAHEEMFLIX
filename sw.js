const CACHE_NAME = 'faheemflix-v6';
const OFFLINE_URL = '/offline.html';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/movies.html',
  '/manifest.json',
  '/pwa.js',
  '/offline.html',
  '/browserconfig.xml',
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
  '/icons/favicon-32x32.png',
  '/icons/mstile-70x70.png',
  '/icons/mstile-150x150.png',
  '/icons/mstile-310x150.png',
  '/icons/mstile-310x310.png'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap',
  'https://image.tmdb.org/t/p/w500',
  'https://image.tmdb.org/t/p/original'
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
        
        // Cache core assets
        return Promise.all([
          cache.addAll(CORE_ASSETS)
            .then(() => console.log('[Service Worker] Core assets cached')),
          cache.addAll(EXTERNAL_ASSETS.map(url => new Request(url, { mode: 'no-cors' })))
            .then(() => console.log('[Service Worker] External assets cached'))
        ]);
      })
      .catch(error => {
            console.error('[Service Worker] Error caching core assets:', error);
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Remove previous cached data
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      // Take control of all pages under this service worker's scope
      return self.clients.claim();
    })
  );
});

// Fetch event handler
// Handle fetch events with different caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.hostname === 'api.themoviedb.org') {
    event.respondWith(
      fetchAndCache(request, 'api-cache')
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Handle image requests with cache-first strategy
  if (url.hostname === 'image.tmdb.org') {
    event.respondWith(
      cacheFirst(request, 'images-cache')
    );
    return;
  }
  
  // For all other requests, try cache first, then network
  event.respondWith(
    cacheFirst(request, CACHE_NAME)
  );
});

// Network-first strategy with fallback to cache
async function fetchAndCache(request, cacheName) {
  try {
    // Always try to fetch from network first
    const networkResponse = await fetch(request);
    
    // If we got a valid response, cache it
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, serving from cache', error);
    
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache and we're offline, show offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

// Cache-first strategy with network fallback
async function cacheFirst(request, cacheName) {
  try {
    // Try to get from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // If we got a valid response, cache it
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Error in cacheFirst:', error);
    
    // If we're offline and the request is for HTML, show offline page
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

// Clean up old caches during activation
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name.startsWith('faheemflix-'))
          .map(name => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
  
  console.log('[Service Worker] Activated and ready to handle fetches');
});

// Listen for messages from the page
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If we got a valid response, cache it
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match('/offline.html')
            .then(response => response || caches.match('/index.html'));
        })
    );
    return;
  }
  
  // For API requests, try network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If we got a valid response, cache it
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network
        return fetch(request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // If this is an image, return a placeholder
            if (request.headers.get('Accept').includes('image')) {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // For other requests, return offline page if it's an HTML request
            if (request.headers.get('Accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Listen for the 'message' event (for PWA installation and updates)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting on install');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    console.log('[Service Worker] Claiming clients');
    self.clients.claim();
  }
});

// Listen for push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  
  const title = 'FaheemFlix';
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
