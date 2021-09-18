const endpointByUid = new Map()

const set = (uid, endpoint) => endpointByUid.set(uid, endpoint)

const getEndpointByUid = uid => endpointByUid.get(uid)

module.exports = {
  set,
  getEndpointByUid,
}
