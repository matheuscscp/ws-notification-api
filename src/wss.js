const WebSocket = require('ws')
const endpoint = require('./endpoint')
const connectionMap = require('./connectionMap')
const serverMap = require('./serverMap')

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

  connectionMap.set(uid, ws)
  serverMap.set(uid, endpoint.url)
}

const onClose = ws => connectionMap.deleteWs(ws)

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
