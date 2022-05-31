import Log from './Log'

export default function (initial, target, check) {
    Object.keys(initial).forEach(key => {
        const value = target[key]
        if (value === undefined || value === null) {
            Log.log(`Missing key ${key}`)
            target[key] = initial[key]
            return
        }
        //force null exception if undefined checks 
        //is passed when a valid one is expected
        if (arguments.length > 2) {
            try { check(key, value) }
            catch (ex) {
                Log.log(key, ex)
                target[key] = initial[key]
            }
        }
    })
}
