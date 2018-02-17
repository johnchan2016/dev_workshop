importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

var config = {
  messagingSenderId: "781609338216"
}

firebase.initializeApp(config); 
var messaging = firebase.messaging();

//cache info
var cacheName = 'Firebase_PWA';
var filesToCache = [
  '/',
  '/index/index.html',
  '/index/push.html',
  '/index/offlinePage.html',
  '/stylesheets/style.css',
  '/images/clear.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/rain.png',
  '/images/wind.png',
  '/images/pwa_icon.png',
  '/images/pwa_badge.png',
  '/images/firebase-logo.png'
];

var isCurrentWindowFocus = false;

// Install service worker
self.addEventListener('install', function(e) {
  console.log(`[ServiceWorker]  Install`);
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log(`[ServiceWorker] Caching app shell`);
      return cache.addAll(filesToCache);
    })
  );
});

//Removing old cache in activate stage
self.addEventListener('activate', function(e) {
  console.log(`[ServiceWorker] Activate`);
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
      }));
    })
  );
  return self.clients.claim();
});


//fetch 事件的觸發時機
  //1.Service Worker 要成功被註冊
  //2. 必須要等到 activate 執行完，才會監聽 fetch 事件。
  //3.網頁上要有 request 送出
  //4.將每一次的 Response 做 cache，才可以在離線的時候做存取

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);

  // If you fail to serve something from the cache, 
  // and/or network you may want to provide a generic fallback.
  e.respondWith(
    // Try the cache
    caches.match(e.request).then(function(response) {
      // Fall back to network
      return response || fetch(e.request);
    })
    .catch(function(err){
      return caches.open(cacheName)
        .then(function(cache){
            // If both fail, show a generic fallback:
            return cache.match('/index/offlinePage.html');
        });
    })
  );
});


self.addEventListener('notificationclick', event => {
  console.log(`[ServiceWorker] Notification click Received.`);
  event.notification.close();

  if(event.notification.data && event.notification.data.click_url) {
    var click_url = event.notification.data.click_url;

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
      type: "window"
    }).then(function(clientList) {
      
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];

        if(client.url === click_url && 'focus' in client){
          return client.focus();
        }
      }

        if (clients.openWindow)  return clients.openWindow(click_url);
    }));
  }
});

// When a browser receives a message, 
// it sends a push event to the service worker
self.addEventListener("push", function(e) {
  console.log('SW worker push: ' + e.data.text());
  if (!isCurrentWindowFocus) {
    ShowNotification(e.data.json());
  }
});

self.addEventListener('message', function (e) {
  console.log('message event received', e.data);
  isCurrentWindowFocus = e.data === 'visible';
  console.log('isCurrentWindowFocus: ' + isCurrentWindowFocus);
  //e.waitUntil(ShowNotification(e.data));
});

// Shows a notification
function ShowNotification(message) { 
  const notificationTitle = message.notification.title;

  // The notification properties
  const notificationOptions = {
    body: message.notification.body,
    icon: message.notification.icon,
    data: {
      click_url: 'https://firebase.google.com/'          
    },
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    requireInteraction: true
  };

  console.log('show notification');
  return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
}

//background push 
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  ShowNotification(payload);
  self.registration.hideNotification();
});

/*
//twitter offline example
self.addEventListener('notificationclick', event => {  
  //twitter offline
  if (event.notification.tag == 'new-email') {
    // Assume that all of the resources needed to render
    // /inbox/ have previously been cached, e.g. as part
    // of the install handler.
    new WindowClient('/inbox/');
  }
}

self.addEventListener("push", function(e) {
  var tagName = 'new_message';

  if (event.data.text() == tagName) {
    event.waitUntil(
      caches.open(cacheName).then(function(cache) {
        return fetch('/inbox.json').then(function(response) {
          cache.put('/inbox.json', response.clone());
          return response.json();
        });
      }).then(function(emails) {
        registration.showNotification("New email", {
          body: "From " + emails[0].from.name,
          tag: tagName
        });
      })
    );
  }
}
*/