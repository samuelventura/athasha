import Log from '../tools/Log'
import Clone from '../tools/Clone'

const errors = {total : 0, missing: 0, invalid: 0, unknown: 0}

function clear() {
    errors.total = 0
    errors.missing = 0
    errors.invalid = 0
    errors.unknown = 0
}

function get() {
    return Clone.deep(errors)
}

function apply(initial, target, check) {
    Object.keys(target).forEach(key => {
        if (!(key in initial)) {
            delete target[key]
            errors.unknown ++
            errors.total ++
        }
    })
    Object.keys(initial).forEach(key => {
        const value = target[key]
        if (value === undefined || value === null) {
            Log.log(`Missing key ${key}`)
            target[key] = initial[key]
            errors.missing ++
            errors.total ++
            return
        }
        //force null exception if undefined checks 
        //is passed when a valid one is expected
        if (arguments.length > 2) {
            try { check(key, value) }
            catch (ex) {
                Log.log(key, ex)
                errors.invalid ++
                errors.total ++
                target[key] = initial[key]
            }
        }
    })
    return errors
}


export default {
    apply,
    clear,
    get,
} 
