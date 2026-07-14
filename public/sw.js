/**
 * Service Worker for InnovaSci Open Academy
 * Handles caching, offline support, and background sync
 */

const CACHE_NAME = 'innovasci-v1';
const STATIC_CACHE_NAME = 'innovasci-static-v1';
const API_CACHE_NAME = 'innovasci-api-v1';
const IMAGE_CACHE_NAME = 'innovasci-images-v1';

// Cache configurations
const CACHE_CONFIGS = {
  static: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  api: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  image: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxSize: 100 * 1024 * 1024, // 100MB
  },
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// API routes that should be cached
const CACHEABLE_API_ROUTES = [
  '/api/courses',
  '/api/categories',
  '/api/domains',
  '/api/scholarships',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.log('[SW] Failed to cache some static assets:', err);
        });
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanOldCaches(),
      // Claim all clients immediately
      self.clients.claim(),
    ])
  );
});

// Fetch event - main caching logic
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (except for API)
  if (request.method !== 'GET' && !url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle image requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(handleDefaultRequest(request));
});

// Check if request is for a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.css', '.woff', '.woff2',
    '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.json', '.xml', '.yaml', '.yml',
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Check if request is for an image
function isImageRequest(request) {
  const acceptHeader = request.headers.get('accept');
  return acceptHeader && acceptHeader.includes('image');
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const shouldCache = CACHEABLE_API_ROUTES.some((route) => 
    url.pathname.startsWith(route)
  );

  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Clone response for caching
    const responseToCache = networkResponse.clone();

    // Cache successful responses
    if (networkResponse.ok && shouldCache) {
      const cache = await caches.open(API_CACHE_NAME);
      
      // Add timestamp to cached response
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const cachedResponse = new Response(await networkResponse.clone().text(), {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers,
      });
      
      await cache.put(request, cachedResponse);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', url.pathname);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('sw-cached', 'true');
      
      return new Response(await cachedResponse.text(), {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    // Return offline response for API
    return new Response(
      JSON.stringify({
        success: false,
        error: 'You are offline. This request has been queued.',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Refresh cache in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response);
        }
      })
      .catch(() => {});
    
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page if available
    const offlineResponse = await cache.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Handle image requests with cache-first, stale-while-revalidate
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder for images
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect fill="#1e293b" width="200" height="200"/>
        <text fill="#64748b" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Image unavailable offline</text>
      </svg>`,
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }
}

// Handle navigation requests with network-first, falling back to cached page
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache the page
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // Try to return cached page
    const cache = await caches.open(STATIC_CACHE_NAME);
    
    // Try exact match first
    let cachedResponse = await cache.match(request);
    
    // Then try index
    if (!cachedResponse) {
      cachedResponse = await cache.match('/');
    }
    
    // Then try offline page
    if (!cachedResponse) {
      cachedResponse = await cache.match('/offline');
    }

    if (cachedResponse) {
      return cachedResponse;
    }

    // Last resort: return basic offline page
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - InnovaSci</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            max-width: 500px;
            text-align: center;
          }
          h1 { font-size: 2rem; margin-bottom: 1rem; }
          p { color: #94a3b8; margin-bottom: 2rem; }
          button {
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          }
          button:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again. Your cached content is still available.</p>
          <button onclick="location.reload()">Try Again</button>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// Default handler: network first with cache fallback
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', {
      status: 503,
    });
  }
}

// Clean up old caches
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const validCacheNames = [
    CACHE_NAME,
    STATIC_CACHE_NAME,
    API_CACHE_NAME,
    IMAGE_CACHE_NAME,
  ];

  return Promise.all(
    cacheNames
      .filter((name) => !validCacheNames.includes(name))
      .map((name) => {
        console.log('[SW] Deleting old cache:', name);
        return caches.delete(name);
      })
  );
}

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-operations') {
    event.waitUntil(syncQueuedOperations());
  }
});

async function syncQueuedOperations() {
  try {
    // Get all pending operations from IndexedDB
    // This will be handled by the main app's sync manager
    const clients = await self.clients.matchAll();
    
    // Notify all clients to sync
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_REQUESTED',
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CLEAR_CACHE':
      cleanOldCaches();
      event.ports[0]?.postMessage({ success: true });
      break;
    
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_NAME });
      break;
  }
});

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});

console.log('[SW] Service worker loaded');
