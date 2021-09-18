const express = require('express')
const fetch = require('node-fetch')
const endpoint = require('./endpoint')
const connectionMap = require('./connectionMap')
const serverMap = require('./serverMap')

const app = express()
app.use(express.json())

app.post('/notify', async (req, res, next) => {
  const { body } = req
  console.log(`received notify: ${JSON.stringify(body)}`)

  const { uid, msg } = body

  let userEndpoint
  try {
    userEndpoint = await serverMap.getEndpointByUid(uid)
  } catch (e) {
    res.sendStatus(500)
    console.error(`error getting endpoint for uid '${uid}'`)
    return
  }

  if (!userEndpoint) {
    res.sendStatus(404)
    console.log(`uid '${uid}' server not found`)
    return
  }

  if (userEndpoint === endpoint.url) {
    const ws = connectionMap.getWsByUid(uid)
    if (ws) {
      ws.send(msg)
      res.sendStatus(200)
      console.log(`found uid '${uid}' connection, sending msg '${msg}'`)
      return
    }
    res.sendStatus(404)
    console.log(`uid '${uid}' connection not found`)
    return
  }

  try {
    const notifyResp = await fetch(`${userEndpoint}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, msg }),
    })

    if (!notifyResp.ok) {
      res.sendStatus(notifyResp.status)
      console.error(
        `failed to proxy notify uid '${uid}', endpoint '${userEndpoint}' and msg '${msg}'`,
      )
      return
    }
  } catch (error) {
    res.sendStatus(500)
    console.error(
      `failed to proxy notify uid '${uid}', endpoint '${userEndpoint}' and msg '${msg}'`,
    )
    return
  }

  res.sendStatus(200)
  console.log(`success proxying '${uid}' to '${userEndpoint}'`)
})

module.exports = app.listen(endpoint.port, () => {
  console.log('endpoint configs:', endpoint)
})
