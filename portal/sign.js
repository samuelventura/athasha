// "#{quantity}:#{key}:#{identity}"
// iex(1)> Auth.generate_local 1, "key"
// %{
//   identity: "99Z06YEPPQ3SCE9MPSSQRZ1VHJ052WY3JY8FCR4SEZ0036XGP9P0",
//   key: "key",
//   quantity: 1,
//   signature: "iLvFXc/tBH0veY6vBly01lZ/Hp6AsEKvitpHdbvY+jCAS0bryXeF6nAyBW+4cPTyKqpOSN0FfG+0vX7g4UTwvzajkK1hp0pxZDf98nlMi5KulJj7Dc8S/PfJXAfIRnHcWoX/Cg06+S5m/EGkLCx/2nola+AZsn/atCX4n0s4ORIK3vBJs/vpXptjREJdicDQTwP2nr0N+s0G8xA7s2OMe75Z9lECs0h4tTtRoNSVOVB8VQje6czJHaAUVWj7zRMbKfj0iLUN9AU2AThj67aHUblISt7XnZWV5695l4dnIQoT50S5hiXEyZxXpFYGIRwdq9sGJoHDbBY76bID7KTJXhZKuvJj3Bcav+9jd4xJu4KAEdGxIVerwGRADK4M+8MlgyyjvqSMR20XVQm6k5olN9hpW0raSyEs7sY/DGdrXRVgaFF3zIi88i6VRbzWUWLnjTxanDbHZ8Aruvwo4l3VivWIA4qfm5psK9Ch0PqzmgPe23XaxHEaiepxNp3iByUExrHWRlK9AJyaHO+3UPJmSa5/13hxARQZVlGx7cpaHO+4WBkM/s5gCgwpvxIjwmjzAMEfTf4sajEtH76cz630s9XHw8vQ5lGgDlxVUhFCa1bCLiFwrUi5d+YwykjY5QTHT5qrbosUOyZpdm+bQ/1fxnrBHlGffIFNukduHJ3Eqfs="
// }

const crypto = require('crypto');
const path = require('path');
const os = require('os');
const fs = require('fs');

const home = os.homedir();
const pemp = path.join(home, ".ssh", "athasha.pem")
const pem = fs.readFileSync(pemp);
const key = pem.toString('ascii');

const sign = crypto.createSign('RSA-SHA512');
sign.update('1:key:99Z06YEPPQ3SCE9MPSSQRZ1VHJ052WY3JY8FCR4SEZ0036XGP9P0');
const signature = sign.sign(key, 'base64');
const baseline = "iLvFXc/tBH0veY6vBly01lZ/Hp6AsEKvitpHdbvY+jCAS0bryXeF6nAyBW+4cPTyKqpOSN0FfG+0vX7g4UTwvzajkK1hp0pxZDf98nlMi5KulJj7Dc8S/PfJXAfIRnHcWoX/Cg06+S5m/EGkLCx/2nola+AZsn/atCX4n0s4ORIK3vBJs/vpXptjREJdicDQTwP2nr0N+s0G8xA7s2OMe75Z9lECs0h4tTtRoNSVOVB8VQje6czJHaAUVWj7zRMbKfj0iLUN9AU2AThj67aHUblISt7XnZWV5695l4dnIQoT50S5hiXEyZxXpFYGIRwdq9sGJoHDbBY76bID7KTJXhZKuvJj3Bcav+9jd4xJu4KAEdGxIVerwGRADK4M+8MlgyyjvqSMR20XVQm6k5olN9hpW0raSyEs7sY/DGdrXRVgaFF3zIi88i6VRbzWUWLnjTxanDbHZ8Aruvwo4l3VivWIA4qfm5psK9Ch0PqzmgPe23XaxHEaiepxNp3iByUExrHWRlK9AJyaHO+3UPJmSa5/13hxARQZVlGx7cpaHO+4WBkM/s5gCgwpvxIjwmjzAMEfTf4sajEtH76cz630s9XHw8vQ5lGgDlxVUhFCa1bCLiFwrUi5d+YwykjY5QTHT5qrbosUOyZpdm+bQ/1fxnrBHlGffIFNukduHJ3Eqfs="
console.log(signature==baseline, signature)
