const CACHE_NAME = 'refready-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Handle background sync for offline game logging
self.addEventListener('sync', event => {
  if (event.tag === 'game-sync') {
    event.waitUntil(syncGameData());
  }
});

async function syncGameData() {
  // Sync offline game data when back online
  console.log('Syncing game data...');
}

// Handle push notifications for mentor feedback
self.addEventListener('push', event => {
  const options = {
    body: 'You have new feedback from your mentor!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'mentor-feedback',
    actions: [
      {
        action: 'view',
        title: 'View Feedback'
      },
      {
        action: 'later',
        title: 'View Later'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('RefReady - New Feedback', options)
  );
});

