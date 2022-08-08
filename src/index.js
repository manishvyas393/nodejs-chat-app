const express = require("express")
const app = express()
const path = require("path")
const http = require("http")
const socketIO = require("socket.io")
const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketIO(server)
const Filter = require("bad-words")
const { getUser, getUserRoom, addUser, removeUser } = require("./utils/users")
const { generateMessage, genertateLocation } = require("./utils/messages")
const publicDirectoryPath = path.join(__dirname, "../public")
app.use(express.static(publicDirectoryPath))
io.on("connection", (socket) => {

      socket.on("join", ({ username, room }, callback) => {
            const { error, user } = addUser({ id: socket.id, username, room })
            if (error) {
                  return callback(error)
            }
            socket.join(user.room)
            socket.emit("message", generateMessage("welcome"))
            socket.broadcast.to(room).emit("message", generateMessage(`${user.username} joined`))
            io.to(user.room).emit("roomData",{room:user.room,users:getUserRoom(user.room)})
            callback()
      })

      socket.on("sendmessage", (message, callback) => {
            const user = getUser(socket.id)
            const filter = new Filter()
            if (filter.isProfane(message.text)) {
                  return callback('badword not allowed')
            }
            io.to(user.room).emit("message", generateMessage(user.username,message))
            callback()
      })

      socket.emit("shareLocation", genertateLocation(""))
      socket.on("sendLocation", (pos, callback) => {
            const user = getUser(socket.id)
            io.to(user.room).emit("shareLocation", genertateLocation(user.username,`https://google.com/maps?q=${pos.latitude},${pos.longitude}`))
            callback("location shared")
      })

      socket.on("disconnect", () => {
            const user = removeUser(socket.id)
            if (user) {
                  io.to(user.room).emit('message', generateMessage(`${user.username} left`))
                  io.to(user.room).emit("roomData",{room:user.room,users:getUserRoom(user.room)})
            }

      })
})
server.listen(port, () => console.log(`server started on port ${port}`))