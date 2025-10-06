// --- Service Worker dla aplikacji "Wydatki miesięczne" ---
// Wersja: 1.0 (2025-10-06)

const CACHE_NAME = "wydatki-cache-v1";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.ico"
];

// Instalacja (pierwsze uruchomienie)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Dodawanie do cache...");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Aktywacja (czyści stare wersje cache)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Usuwanie starego cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Przechwytywanie zapytań (tryb offline)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jeśli plik jest w cache → zwracamy
      if (response) return response;
      // Jeśli nie → pobieramy z sieci i zapisujemy
      return fetch(event.request)
        .then(res => {
          // Pomijamy żądania z innych domen
          if (!event.request.url.startsWith(self.location.origin)) return res;
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match("./index.html")); // awaryjnie ładuje stronę offline
    })
  );
});
