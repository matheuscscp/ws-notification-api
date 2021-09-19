const express = require('express')
const endpoint = require('./endpoint')
const db = require('./db')
const doNotify = require('./notify')
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

router.post('/do-notify', async (req, res, next) => {
  const { body } = req
  console.log(`received do-notify: ${JSON.stringify(body)}`)

  const { uid, msg } = body

  try {
    await doNotify(uid, msg)
    res.sendStatus(200)
  } catch (e) {
    res.sendStatus(404)
    console.error('error do-notifying:', e)
  }
})

router.post('/notify', async (req, res, next) => {
  const { body } = req
  console.log(`received notify: ${JSON.stringify(body)}`)

  const { uid, msg } = body

  try {
    await db.createJob(uid, msg)
    res.sendStatus(200)
    console.log('success creating notify job')
  } catch (e) {
    res.sendStatus(500)
    console.error('error storing notify job:', e)
  }
})

module.exports = app.listen(endpoint.port, () => {
  console.log('endpoint configs:', endpoint)
})
