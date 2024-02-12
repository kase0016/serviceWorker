
const version = '1';
const cacheName = `JB-${version}`;

self.addEventListener('install', (ev) => {
  //cache static files, if needed
  self.skipWaiting();
});


self.addEventListener('activate', (ev) => {
  //clear old caches, if desired
  ev.waitUntil(
    caches.keys()
    .then((keys)=>{
      return Promise.all(
        keys.map(key=>{
          if (key !== cacheName){
            return caches.delete(key)}}))
            .then(()=>{
              return self.clients.claim()})
            })
  )
    })
  
  
  
self.addEventListener('fetch', (ev) => {
    if (ev.request.url.includes('random-data-api.com/api/v2/users')){
      ev.respondWith(
      caches.open(cacheName)
      .then((cache)=>{
           return cache.match('users.json')
           .then((response)=>{
            if(response){
              return response 
            } 
            return fetch(ev.request)
            .then((newResp)=>{
              if(newResp.ok){
                cache.put('users.json',newResp.clone())
                console.log({newResp})
                return newResp
              }}).catch((err)=>{
                console.warn(err)
              })
           })
        })

      )
     
    }
});

self.addEventListener('message', (ev) => {
  let message =  ev.data
  let hash = message.hash
  let senderID = ev.source.id
  let action = message.action

  // listen for messages from the main thread
  return self.clients.matchAll()
  .then((clients)=>{
      clients.forEach( (client) => {

        if(client.id === senderID)
       { 
         // Send message to other clients
         sendMessageToMain(hash,senderID,action)}

      })
    })
//   // Get message from main 
//  let  message =  ev.data
//  let hash = message.hash
//  let senderID = ev.source.id

//   // Send message to other clients
//   sendMessageToMain(hash,senderID

});

function sendMessageToMain(hash,senderID,action) {
  //send a message to the main threads of all clients

  return self.clients.matchAll()
  .then((clients)=>{
      clients.forEach( (client) => {
        // Make sure the sender doesn't receive the message 
        if (client.id === senderID) {
          message = { wrong: 'This message was NOT for you'}
        } else {
          message = { hashVal: hash,sender: senderID,action: action }
          console.log(message.sender)
        }

        client.postMessage(message)
        console.log(`Sending message to Main`)
      });
  })

}
