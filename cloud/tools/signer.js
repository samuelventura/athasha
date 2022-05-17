const crypto = require('crypto');
const path = require('path');
const os = require('os');
const fs = require('fs');

const home = os.homedir();
const pemp = path.join(home, ".ssh", "athasha.pem")
const pem = fs.readFileSync(pemp);
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