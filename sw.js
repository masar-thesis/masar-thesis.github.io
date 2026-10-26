/* مسار — service worker: notifications only (no offline caching) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'مسار', {
    body: d.body || 'تحديث جديد على رسالتك',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || 'masar',
    renotify: true,
    dir: 'rtl',
    lang: 'ar',
    data: { url: d.url || self.registration.scope },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) {
        await w.navigate(url).catch(() => {});
        return w.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
