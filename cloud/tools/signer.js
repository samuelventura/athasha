const crypto = require('crypto');
const fs = require('fs');

const pem = fs.readFileSync(process.env.PRIVKEY);
const key = pem.toString('ascii');

function signer({ qty, pid, aid }) {
    const sign = crypto.createSign('RSA-SHA512');
    sign.update(`${qty}:${pid}:${aid}`);
    const signature = sign.sign(key, 'base64');
    return {
        key: pid,
        quantity: qty,
        identity: aid,
        signature: signature,
    }
}

export default signer