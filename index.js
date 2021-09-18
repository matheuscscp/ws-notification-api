const express = require('express')
const WebSocket = require('ws')

const app = express()

app.use(express.json())
app.post('/notify', async (req, res, next) => {
  const { body } = req
  console.log(`received notify: ${JSON.stringify(body)}`)

  res.json({ success: true })
})

const server = app.listen(3000)

const wss = new WebSocket.Server({ server })

const wsByUid = new Map()
const onMessage = async (ws, data) => {
  console.log(`received message: ${JSON.stringify(data)}`)
  const uid = data.uid || ''
  if (uid === '') {
    ws.close()
    console.log('invalid uid')
    return
  }

  if (wsByUid.has(uid)) {
    const old = wsByUid.get(uid)
    old.close()
    console.log('user connected again, closing old connection')
  }
  wsByUid.set(uid, ws)
  console.log('stored user connection')
}

const onError = (ws, error) => {
  console.error(`received error: ${JSON.stringify(error)}`)
}

wss.on('connection', (ws, req) => {
  console.log('received connection')
  ws.on('message', msg => onMessage(ws, JSON.parse(msg.toString())))
  ws.on('error', error => onError(ws, error))
})
