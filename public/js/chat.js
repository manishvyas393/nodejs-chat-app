const socket = io()
const chatForm = document.querySelector("form")
const chatInput = document.querySelector("#message")
const locBtn = document.querySelector("#locBtn")
const messages = document.querySelector("#messages")
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sideBar = document.querySelector("#sideBar")
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
      const newMsg = messages.lastElementChild
      const newMsgStyles = getComputedStyle(newMsg)
      const newMsgMargin = parseInt(newMsgStyles.marginBottom)
      const newMsgHeight = newMsg.offsetHeight + newMsgMargin
      
      const visibleHeight = messages.offsetHeight
      const containerHeight = messages.scrollHeight
      const scrollOfset = messages.scrollTop + visibleHeight
      if (containerHeight - newMsgHeight<=scrollOfset) {
            messages.scrollTop=messages.scrollHeight
      }
}
socket.on("message", (msg) => {
      if (msg.text === "welcome") {
            console.log(msg)
      }
      else {
            const html = Mustache.render(messageTemplate, { user: msg.username, message: msg.text, createdAt: moment(msg.createdAt).format("h:mm A") })
            messages.insertAdjacentHTML("beforeend", html)
            autoScroll()
      }

})
socket.on("shareLocation", (loc) => {
      console.log(loc)
      if (loc.location === "") {
            console.log(loc)
      }
      else {
            const html = Mustache.render(locationTemplate, { username: loc.username, location: loc.location, sharedOn: moment(loc.sharedOn).format("h:mm A") })
            messages.insertAdjacentHTML("beforeend", html)
            autoScroll()
      }
})
socket.emit("join", { username, room }, (err) => {
      if (err) {
            alert(err)
            location.href = "/"
      }
})
socket.on("roomData", ({ room, users }) => {
      console.log(room, users)
      const html = Mustache.render(sideBarTemplate, {
            room,
            users
      })
      sideBar.insertAdjacentHTML("beforeend", html)
})


chatForm.addEventListener("submit", (e) => {
      e.preventDefault()
      chatForm.setAttribute("disabled", "disabled")
      socket.emit("sendmessage", chatInput.value, (eror) => {
            chatForm.removeAttribute("disabled")
            chatInput.value = ""
            return console.log(eror)
      })
})
locBtn.addEventListener("click", () => {

      if (!navigator.geolocation) {
            return alert("geolocation is not supported")
      }
      locBtn.setAttribute("disabled", "disabled")
      navigator.geolocation.getCurrentPosition((position) => {
            socket.emit("sendLocation", {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
            }, (data) => {
                  locBtn.removeAttribute("disabled")
                  console.log(data)
            })
      })
})
