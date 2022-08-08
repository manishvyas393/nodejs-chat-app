const generateMessage = (username,text) => {
      return {username, text, createdAt: new Date().toString() }
}
const genertateLocation = (username,loc) => {
      return {
            username,
            location: loc,
            sharedOn: new Date()
      }
}
module.exports = { generateMessage, genertateLocation }