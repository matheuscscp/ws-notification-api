const connectionMap = require('./connectionMap')

module.exports = (uid, msg) => {
  const ws = connectionMap.getWsByUid(uid)
  if (ws) {
    ws.send(msg)
    console.log(`found uid '${uid}' connection, sending msg '${msg}'`)
  } else {
    throw Error(`uid '${uid}' connection not found`)
  }
}
