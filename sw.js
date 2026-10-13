/* global clients */
// Push only. There is deliberately no fetch handler and no cache: a cache
// would keep serving old versions of the app.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

function text(value, fallback) {
  return typeof value === 'string' && value ? value : fallback;
}

self.addEventListener('push', (event) => {
  let message = {};
  try {
    message = (event.data && event.data.json()) || {};
  } catch {
    message = {};
  }
  // Browsers require every push to show a notification, so nothing here may
  // throw or skip it.
  event.waitUntil(
    self.registration.showNotification(text(message.title, '7bam'), {
      badge: 'icon.png',
      body: text(message.body, 'あたらしいお知らせがあります'),
      data: { url: text(message.url, '.') },
      icon: 'icon.png',
      tag: text(message.tag, undefined),
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data;
  const url = new URL((data && data.url) || '.', self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.registration.scope));
      return open ? open.focus() : clients.openWindow(url);
    }),
  );
});
