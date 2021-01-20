const socket = io()
// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messgaeFormButton = $messageForm.querySelector('button')
const $sendMessageButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
let $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    
    // New message height
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMarginBottom = parseInt(newMessageStyle.marginBottom) 
    const newMessageHeight = parseFloat(newMessageStyle.blockSize) + newMessageMarginBottom

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (Math.floor(containerHeight - newMessageHeight) <= Math.ceil(scrollOffset)) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('location', (data) => {
    const html = Mustache.render(locationTemplate, {
        username: data.username,
        location: data.url,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomsData', (data) => {
    const html = Mustache.render(sideBarTemplate, {
        room: data.room,
        users: data.users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messgaeFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', $messageFormInput.value, () => {
        $messgaeFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

$sendMessageButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Browser does not support geolocation API')
    }

    navigator.geolocation.getCurrentPosition((data) => {
        socket.emit('sendlocation', {
            lat: data.coords.latitude,
            long: data.coords.longitude
        })
    })
})