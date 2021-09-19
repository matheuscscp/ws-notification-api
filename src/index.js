const http = require('./http')
require('./wss')(http)
require('./db').connect()
require('./worker').start()
