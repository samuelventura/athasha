import sha1 from 'sync-sha1/rawSha1'

function SHA1(message) {
    const msgUint8 = new TextEncoder().encode(message)
    const hashBuffer = sha1(msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const exports = {
    SHA1,
}

export default exports
