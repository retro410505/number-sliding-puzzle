// sw.js — Service Worker. Runs in a background thread, not in the page.

// 1) CACHE NAME — includes a version number.
// Bump this ("v1" -> "v2") every time you change index.html, style.css
// or script.js. Otherwise users keep seeing the OLD cached files forever.
const CACHE_NAME = "slide-theory-v1";

// 2) THE PRECACHE LIST — the exact files needed to play offline.
// "./" and "./index.html" are both listed because a visit to the folder
// root and a visit to /index.html are two different cache keys.
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon.png",
];

// 3) INSTALL — fires once, the first time this worker is registered.
self.addEventListener("install", (event) => {
  // event.waitUntil() tells the browser "don't finish installing
  // until this promise resolves". Without it the worker could be
  // killed mid-download.
  event.waitUntil(
    caches
      .open(CACHE_NAME)          // open (or create) the named cache
      .then((cache) => cache.addAll(ASSETS)) // download every file into it
  );

  // Don't wait for old tabs to close — activate this version immediately.
  self.skipWaiting();
});

// 4) ACTIVATE — fires after install, when this worker takes control.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()                                  // list ALL cache names on this origin
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME) // keep only the current one
            .map((key) => caches.delete(key))    // delete every older version
        )
      )
      .then(() => self.clients.claim())        // take over pages already open
  );
});

// 5) FETCH — every request the page makes passes through here.
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests. POST etc. must go straight to the network.
  if (request.method !== "GET") return;

  // Only handle our own files. Google Fonts (fonts.googleapis.com /
  // fonts.gstatic.com) are a different origin — we let those pass
  // through untouched, so they simply fail offline and the font falls back.
  if (new URL(request.url).origin !== self.location.origin) return;

  // respondWith() lets us supply the answer instead of the network.
  event.respondWith(
    caches.match(request).then((cached) => {
      // CACHE FIRST: if we have it, return it instantly. Offline play
      // works because the answer never touches the network.
      if (cached) return cached;

      // Otherwise fetch from the network...
      return fetch(request)
        .then((response) => {
          // ...and stash a copy, but only for clean, successful,
          // same-origin responses (status 200, type "basic").
          // Caching error pages or opaque responses causes bugs.
          if (response && response.status === 200 && response.type === "basic") {
            // clone() is required: the body can only be read once —
            // one copy goes to the cache, one to the page.
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // Network failed and nothing cached. For a page navigation,
          // fall back to the app shell so the game still opens.
          if (request.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});