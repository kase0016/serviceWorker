



document.addEventListener('DOMContentLoaded', () => {
  registerSW()
  getData();
  handleCardClicks()
  receiveMessageFromSW()
  //register the service worker and add message event listener
  //listen for navigation popstate event
  //get the data for the page
  //add click listener to #cards
});

function registerSW() {
 navigator.serviceWorker.register('/sw.js')
}



function getData() {

  const url = 'https://random-data-api.com/api/v2/users?size=20&is_json=true'

  fetch(url)
  .then((res)=>{
    return res.json()
  }).then((data)=>{
    let cardList =  document.getElementById('cards')
    cardList.innerHTML = ""
    data.forEach((user) => {
      showCards(user)
    });
    return data
    
  }).then((data)=>{
    window.addEventListener('popstate', ()=>{
       let newMatch = location.href.split('index.html#num=')
       console.log(newMatch[1])
       document.querySelectorAll('.card').forEach( card => {
        if( card.dataset.uId !== newMatch[1] ){
            card.style.display = 'none'
        } else {
          card.style.display = 'block'
        }});
      console.log(`popstate has changed`)
    })

    window.addEventListener('hashchange',()=>{

    })
  
  })
  .catch((err)=>{
    console.warn(err)
  })
}



function showCards(user) {

  let cardList =  document.getElementById('cards')

  // Create Elements
  let listItem = document.createElement('li')
  let userName =  document.createElement('h3')
  let userEmail = document.createElement('p')

  //Add Attribute to Element
  cardList.setAttribute('class','cards')
  listItem .setAttribute('class','card')

  // Set Image 
  listItem.style.backgroundImage = `url('${user.avatar}')`

  // Add Text To Element
  userName.textContent = `${user.first_name} ${user.last_name}`;
  userEmail.textContent = `${user.email}`;

  // Save UID for to reference later 
  listItem.dataset.uId = user.uid

  // Append Elements 
  cardList.appendChild(listItem)
  listItem.appendChild(userName)
  listItem.appendChild(userEmail)
}

function handleCardClicks() {
  let cardList =  document.getElementById('cards')

  cardList.addEventListener('click', (ev)=>{

    // Get which card and its hash value 
    const clickedCard = ev.target.closest('.card')

    // Create new URL with hash and change URL in window 
    let newHash = `/index.html#num=${clickedCard.dataset.uId}`
    history.pushState({}, '', newHash);
    
    const hashMatch = newHash.replace('/index.html#num=','')

    let msg = {
      hash: clickedCard.dataset.uId,
      action: 'showOne'
    }

        document.querySelectorAll('.card').forEach( card => {
    if( card.dataset.uId !== hashMatch){
        card.style.display = 'none'
    } else {
      card.style.display = 'block'
    }});

    sendMessageToSW(msg);

  })


  let showAll =  document.querySelector('a')

  showAll.addEventListener('click', () => {
    let msg = {
      hash: '', 
      action: 'showAll' 
    };
    sendMessageToSW(msg);
  })
  
  }

function sendMessageToSW(msg) {
  if(navigator.serviceWorker.controller){
    console.log(`Sending message : ${msg}`)
    navigator.serviceWorker.controller.postMessage(msg)
  }
} 

function receiveMessageFromSW() {
navigator.serviceWorker.addEventListener('message',(ev)=>{
  let msg =  ev.data

 if (msg.action === 'showAll'){
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = 'block'}
  )
 } else if (msg.action === 'showOne') {

  document.querySelectorAll('.card').forEach( card => {

    if( card.dataset.uId !== msg.hashVal){
        card.style.display = 'none'
    } else {
      card.style.display = 'block'
    }})
 }
 

})

}


