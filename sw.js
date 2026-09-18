/* Caches the app so it opens with no connection.
   The page itself is fetched fresh when online, so edits show up on the next launch. */
   const CACHE = "code-dojo-v2";
   const SHELL = [
     "./",
       "./index.html",
         "./manifest.webmanifest",
           "./icon-192.png",
             "./icon-512.png",
               "./icon-maskable-512.png"
               ];
               const LIVE = ["api.anthropic.com", "generativelanguage.googleapis.com", "openrouter.ai"];

               self.addEventListener("install", e => {
                 e.waitUntil(
                     caches.open(CACHE)
                           .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
                                 .then(() => self.skipWaiting())
                                   );
                                   });

                                   self.addEventListener("activate", e => {
                                     e.waitUntil(
                                         caches.keys()
                                               .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
                                                     .then(() => self.clients.claim())
                                                       );
                                                       });

                                                       self.addEventListener("fetch", e => {
                                                         const url = new URL(e.request.url);
                                                           if(e.request.method !== "GET") return;
                                                             if(LIVE.indexOf(url.hostname) !== -1) return;

                                                               const isPage = e.request.mode === "navigate" ||
                                                                                url.pathname.endsWith("/") ||
                                                                                                 url.pathname.endsWith("index.html");

                                                                                                   if(isPage){
                                                                                                       /* newest version wins, cached copy is the fallback when offline */
                                                                                                           e.respondWith(
                                                                                                                 fetch(e.request).then(res => {
                                                                                                                         const copy = res.clone();
                                                                                                                                 caches.open(CACHE).then(c => c.put("./index.html", copy));
                                                                                                                                         return res;
                                                                                                                                               }).catch(() => caches.match("./index.html"))
                                                                                                                                                   );
                                                                                                                                                       return;
                                                                                                                                                         }

                                                                                                                                                           e.respondWith(
                                                                                                                                                               caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
                                                                                                                                                                     const cacheable = res.ok && (
                                                                                                                                                                             url.origin === location.origin ||
                                                                                                                                                                                     url.hostname.endsWith("googleapis.com") ||
                                                                                                                                                                                             url.hostname.endsWith("gstatic.com")
                                                                                                                                                                                                   );
                                                                                                                                                                                                         if(cacheable){
                                                                                                                                                                                                                 const copy = res.clone();
                                                                                                                                                                                                                         caches.open(CACHE).then(c => c.put(e.request, copy));
                                                                                                                                                                                                                               }
                                                                                                                                                                                                                                     return res;
                                                                                                                                                                                                                                         }).catch(() => caches.match("./index.html")))
                                                                                                                                                                                                                                           );
                                                                                                                                                                                                                                           });