const WebSocket = require('ws')
const map = require('./map')

const onMessage = async (ws, msg) => {
  let data
  try {
    data = JSON.parse(msg.toString())
  } catch (e) {
    console.error(`received invalid message (not JSON): ${msg.toString()}`)
    return
  }

  console.log(`received message: ${JSON.stringify(data)}`)
  const uid = data.uid || ''
  if (uid === '') {
    console.error('empty uid received, uid socket not registered')
    return
  }

  map.set(uid, ws)
}

const onClose = ws => map.deleteWs(ws)

const onError = (ws, error) => {
  console.error(`received error: ${JSON.stringify(error)}`)
}

const onConnection = (ws, req) => {
  console.log('received connection')
  ws.on('message', msg => onMessage(ws, msg))
  ws.on('close', () => onClose(ws))
  ws.on('error', error => onError(ws, error))
}

module.exports = server => {
  const wss = new WebSocket.Server({ server })

  wss.on('connection', onConnection)
}
