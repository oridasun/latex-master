/**
 * LaTeX Master – Service Worker
 * Cache-first para el app shell; network-first para CDN externas.
 */
'use strict';

const CACHE = 'latex-master-v1';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './favicon.png',
  './favicon-128.png',
  './favicon-32.png',
  './manifest.json',
];

/* ── Install: precache app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

/* ── Activate: delete old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch strategy ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // App shell → cache first, network fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // CDN (MathJax) → network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
