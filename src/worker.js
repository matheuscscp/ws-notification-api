const fetch = require('node-fetch')
const sleep = require('./sleep')
const db = require('./db')
const serverMap = require('./serverMap')
const endpoint = require('./endpoint')
const doNotify = require('./notify')
const basicAuth = require('./basicAuth')

const POOL_SIZE = parseInt(process.env.POOL_SIZE || 4, 10)
const SLEEP_MILLIS = parseInt(process.env.SLEEP_MILLIS || 5000, 10)

let running

const notify = async () => {
  if (!db.connected) {
    throw Error('not connected to db')
  }

  const job = await db.pollJob()
  if (!job) {
    throw Error('no jobs')
  }

  const { id, uid, msg } = job

  const userEndpoint = await serverMap.getEndpointByUid(uid)
  if (!userEndpoint) {
    console.error('user does not have a server')
    return
  }

  if (userEndpoint === endpoint.url) {
    try {
      await doNotify(uid, msg)
    } catch (e) {
      console.error('error do-notifying:', e)
      return
    }
    await db.deleteJob(id)
    return
  }

  try {
    const resp = await fetch(`${userEndpoint}/api/do-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${basicAuth.user}:${basicAuth.pass}`,
        ).toString('base64')}`,
      },
      body: JSON.stringify({ uid, msg }),
    })

    if (!resp.ok) {
      throw Error(resp.status)
    }
  } catch (e) {
    console.error('error proxying do-notify:', e)
    return
  }
  await db.deleteJob(id)
}

const startWorker = async () => {
  while (running) {
    try {
      await notify()
    } catch (e) {
      if (!e.message.includes('no jobs')) {
        console.error('error sending notification, sleeping...', e)
      }
      await sleep(SLEEP_MILLIS)
    }
  }
}

const start = () => {
  running = true
  for (let i = 0; i < POOL_SIZE; i++) {
    startWorker()
  }
}

const stop = () => {
  running = false
}

module.exports = {
  start,
  stop,
}
