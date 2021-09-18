const express = require('express')
const map = require('./map')

const app = express()
app.use(express.json())

app.post('/notify', async (req, res, next) => {
  const { body } = req
  console.log(`received notify: ${JSON.stringify(body)}`)

  const { uid, msg } = body

  const ws = map.getWsByUid(uid)
  if (ws) {
    ws.send(msg)
    console.log(`found uid '${uid}', sending msg '${msg}'`)
  }

  res.json({ success: true })
})

module.exports = app.listen(3000)
