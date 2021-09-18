const endpointByUid = new Map()

const getEndpointByUid = uid => endpointByUid.get(uid)

module.exports = {
  getEndpointByUid,
}
