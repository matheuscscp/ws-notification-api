const init = async () => {
  const db = require('./db')
  try {
    await db.connect()
  } catch (e) {
    console.error('error connecting to db:', e)
    return
  }

  const http = require('./http')
  require('./wss')(http)
  require('./worker').start()
}
init()
