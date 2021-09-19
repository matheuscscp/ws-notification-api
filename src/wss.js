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

  try {
    await serverMap.set(uid, endpoint.url)
    connectionMap.set(uid, ws)
  } catch (e) {
    ws.close()
    console.error(`uid '${uid}' kicked since could not store endpoint in redis`)
  }
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
  const wss = new WebSocket.Server({ server, path: '/ws' })

  wss.on('connection', onConnection)
}
