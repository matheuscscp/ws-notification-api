const redis = require('redis')

const REDIS_TTL_SECS = 60 * 60 * 24

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
})

const set = (uid, endpoint) =>
  new Promise((resolve, reject) => {
    client.setex(uid, REDIS_TTL_SECS, endpoint, (err, reply) => {
      if (err) reject(err)
      else resolve(reply)
    })
  })

const getEndpointByUid = uid =>
  new Promise((resolve, reject) => {
    client.get(uid, (err, endpoint) => {
      if (err) reject(err)
      else resolve(endpoint)
    })
  })

module.exports = {
  set,
  getEndpointByUid,
}
