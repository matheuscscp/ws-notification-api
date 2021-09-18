const wsByUid = new Map()
const uidByWs = new Map()

const set = (uid, ws) => {
  if (wsByUid.has(uid)) {
    const oldWs = wsByUid.get(uid)
    if (oldWs === ws) {
      return
    }

    uidByWs.delete(oldWs)
    oldWs.close()
    console.log(
      `uid '${uid}' opened another connection, closing old connection`,
    )
  }
  wsByUid.set(uid, ws)
  uidByWs.set(ws, uid)
  console.log(`stored uid '${uid}' connection`)
}

const deleteWs = ws => {
  if (uidByWs.has(ws)) {
    const uid = uidByWs.get(ws)
    uidByWs.delete(ws)
    wsByUid.delete(uid)
    console.log(`uid '${uid}' connection closed`)
  } else {
    console.log('connection closed')
  }
}

const getWsByUid = uid => wsByUid.get(uid)

module.exports = {
  set,
  deleteWs,
  getWsByUid,
}
