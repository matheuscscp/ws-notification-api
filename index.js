const express = require('express')
const WebSocket = require('ws')

const wsByUid = new Map()
const uidByWs = new Map()

const app = express()

app.use(express.json())
app.post('/notify', async (req, res, next) => {
  const { body } = req
  console.log(`received notify: ${JSON.stringify(body)}`)

  const { uid, msg } = body
  if (wsByUid.has(uid)) {
    const ws = wsByUid.get(uid)
    ws.send(msg)
    console.log(`found uid '${uid}', sending msg '${msg}'`)
  }
  res.json({ success: true })
})

const server = app.listen(3000)

const wss = new WebSocket.Server({ server })

const onMessage = async (ws, data) => {
  console.log(`received message: ${JSON.stringify(data)}`)
  const uid = data.uid || ''
  if (uid === '') {
    console.log('empty uid received, uid socket not registered')
    return
  }

  if (wsByUid.has(uid)) {
    const old = wsByUid.get(uid)
    if (old === ws) {
      return
    }

    uidByWs.delete(old)
    old.close()
    console.log(
      `uid '${uid}' opened another connection, closing old connection`,
    )
  }
  wsByUid.set(uid, ws)
  uidByWs.set(ws, uid)
  console.log(`stored uid '${uid}' connection`)
}

const onError = (ws, error) => {
  console.error(`received error: ${JSON.stringify(error)}`)
}

wss.on('connection', (ws, req) => {
  console.log('received connection')
  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg.toString())
      onMessage(ws, data)
    } catch (e) {
      console.error(`received invalid message (not JSON): ${msg.toString()}`)
    }
  })
  ws.on('close', () => {
    if (uidByWs.has(ws)) {
      const uid = uidByWs.get(ws)
      uidByWs.delete(ws)
      wsByUid.delete(uid)
      console.log(`uid '${uid}' connection closed`)
    } else {
      console.log('connection closed')
    }
  })
  ws.on('error', error => onError(ws, error))
})
