var config = {
  messagingSenderId: "781609338216"
}

firebase.initializeApp(config); 
var messaging = firebase.messaging();
var header = null,
    confirm = null, // can change to pushBtn
    userToken = null,
    isSubscribed = false


window.addEventListener('load', () => {
  header = document.getElementById("pwa_header");
  confirm = document.getElementById("pwa_confirm");

  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
          .then(registration => {
              messaging.useServiceWorker(registration)
              initializePush()
          })
          .catch(err => console.log('Service Worker Error', err))
  } else {
      console.log( 'Push not supported.')
  }
})

function initializePush(){
    userToken = localStorage.getItem('pushToken')

    isSubscribed = userToken !== null
    updateBtn();

    confirm.addEventListener("click", function(e) {
      if (isSubscribed) return unsubscribeUser()

      return subscribeUser()
    })
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        confirm.innerText = 'Subscription blocked'
        return
    }

    if(isSubscribed){
      header.style.display = "none";
      confirm.innerText  = 'Subscribed';
    }else{
      header.style.display = "table";
      confirm.innerText  = 'We need your permission to enable push notification.';
    }
}

function subscribeUser() {
  messaging.requestPermission()
    .then(() => messaging.getToken())
    .then(token => {

        //updateSubscriptionOnServer(token)
        isSubscribed = true
        userToken = token
        localStorage.setItem('pushToken', token)
        console.log('token: ' + token);
        updateBtn()
    })
    .catch(err => console.log('Denied', err))
}

messaging.onMessage(payload => {
  console.log("Message received. ", payload);
})

/*
window.onload = function() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
    header = document.getElementById("pwa_header");
    var isSWRegistered = navigator.serviceWorker.controller;

    console.log('header: ' + header );
    console.log('isSWRegistered: ' + isSWRegistered );

    if(isSWRegistered){
      swRegister();
    }else{
      header.style.display = "table";
      var confirm = document.getElementById("pwa_confirm");
      confirm.addEventListener("click", function(e) {
        swRegister();
      })
    }
  } else {
    console.log('Push is not supported');
  }
}

  function swRegister(){
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(swRegistration => {
        messaging.useServiceWorker(swRegistration);
    })
    .then(swRegistration => {
        PermissionRequest(swRegistration);
    })
    .catch(err => {
        console.log('Service Worker register error.')
        console.log('Error: ' + err)
    });

    setTimeout(() => {
        console.log('adding image')
        const img = new Image();
        img.src = '../images/pwa_badge.png';
        document.body.appendChild(img);
    }, 3000);
  }


  function PermissionRequest(swRegistration){
    messaging.requestPermission()
    .then(function(result) {
      if (result === 'denied') {
          console.log('Permission wasn\'t granted. Allow a retry.');
          return;
      }
      if (result === 'default') {
          console.log('The permission request was dismissed.');
          return;
      }
      GetToken(swRegistration);
    })
    .catch(function(err) {
      console.log('Unable to get permission to notify.', err);
    });
  }

  function GetToken(swRegistration){
    messaging.getToken()
      .then((currentToken) => {
        if (currentToken) {
          console.log('currentToken: ' + currentToken );
          header.style.display = "none";
          //sendTokenToServer(currentToken)
        } else {
          // you don't have permission to show notifications
          // detect whether they are blocked or not, then show your custom UI  
          console.log('not get token');
        }
      })
      .catch((err) => {
        // retrieving token failed, analyze the error
        console.log('error message:' + err);
      })
  }

  messaging.onMessage(function(payload) {
    console.log("onMessage. ", payload);
  });*/