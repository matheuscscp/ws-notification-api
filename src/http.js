const express = require('express')
const endpoint = require('./endpoint')
const connectionMap = require('./connectionMap')

const app = express()
app.use(express.json())

app.post('/notify', async (req, res, next) => {
  const { body } = req
  console.log(`received notify: ${JSON.stringify(body)}`)

  const { uid, msg } = body

  const ws = connectionMap.getWsByUid(uid)
  if (ws) {
    ws.send(msg)
    console.log(`found uid '${uid}', sending msg '${msg}'`)
  }

  res.json({ success: true })
})

module.exports = app.listen(endpoint.port, () => {
  console.log('endpoint configs:', endpoint)
})
