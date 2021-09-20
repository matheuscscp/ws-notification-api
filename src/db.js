const { Client } = require('pg')

const TIMEOUT_SECS = parseInt(process.env.WORKER_TIMEOUT_SECS || 5 * 60, 10)

const [STATUS_QUEUED, STATUS_PROCESSING] = ['queued', 'processing']

const client = new Client(
  process.env.DB_URL || 'postgres://postgres@postgres/ws_notification_api',
)

const connect = () => client.connect()

const createJob = async (uid, msg) => {
  console.log('creating job...')
  await client.query(
    'INSERT INTO jobs (uid, msg, status) VALUES ($1, $2, $3)',
    [uid, msg, STATUS_QUEUED],
  )
}

const pollJob = async () => {
  const resp = await client.query(
    `UPDATE jobs SET status = $1, updated_at = now() WHERE id IN (
      SELECT id
      FROM jobs
      WHERE status = $2 OR (status = $1 AND EXTRACT(EPOCH FROM (now() - updated_at)) > $3)
      ORDER BY updated_at ASC
      LIMIT 1
      FOR UPDATE
    ) RETURNING id, uid, msg, EXTRACT(EPOCH FROM (now() - created_at)) as age`,
    [STATUS_PROCESSING, STATUS_QUEUED, TIMEOUT_SECS],
  )
  const job = resp.rows[0]
  if (job) {
    console.log('polled job:', job)
  }
  return job
}

const deleteJob = async id => {
  console.log('deleting job...')
  await client.query('DELETE FROM jobs WHERE id = $1', [id])
}

module.exports = {
  connect,
  createJob,
  pollJob,
  deleteJob,
}
