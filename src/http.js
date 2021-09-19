const express = require('express')
const fetch = require('node-fetch')
const endpoint = require('./endpoint')
const connectionMap = require('./connectionMap')
const serverMap = require('./serverMap')
const basicAuth = require('./basicAuth')

const app = express()
const router = express.Router()

router.use(express.json())
router.use((req, res, next) => {
  const [basic, authz] = req.headers.authorization.split(' ')
  if (basic !== 'Basic') {
    res.sendStatus(400)
    console.error('invalid authz header')
    return
  }

  const [user, pass] = Buffer.from(authz, 'base64').toString().split(':')
  if (
    (basicAuth.user || basicAuth.pass) &&
    (user !== basicAuth.user || pass !== basicAuth.pass)
  ) {
    res.sendStatus(401)
    console.error('invalid authz')
    return
  }

  next()
})
app.use('/api', router)

router.post('/notify', async (req, res, next) => {
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
    const notifyResp = await fetch(`${userEndpoint}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${basicAuth.user}:${basicAuth.pass}`,
        ).toString('base64')}`,
      },
      body: JSON.stringify({ uid, msg }),
    })

    if (!notifyResp.ok) {
      res.sendStatus(notifyResp.status)
      console.error(
        `not ok status proxying notify uid '${uid}', endpoint '${userEndpoint}' and msg '${msg}'`,
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
