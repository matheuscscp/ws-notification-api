const init = async () => {
  const db = require('./db')
  try {
    await db.connect()
  } catch (e) {
    console.error('error connecting to db:', e)
    process.exit(-1)
  }

  try {
    await db.migrate()
  } catch (e) {
    console.error('error migrating db:', e)
    process.exit(-1)
  }

  const http = require('./http')
  require('./wss')(http)
  require('./worker').start()
}
init()
