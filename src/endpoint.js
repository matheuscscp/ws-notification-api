const { HOST = 'localhost', PORT = '3000' } = process.env

module.exports = {
  host: HOST,
  port: PORT,
  url: `http://${HOST}:${PORT}`,
}
