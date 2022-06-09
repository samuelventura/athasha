import Log from '../tools/Log'
import Clone from '../tools/Clone'

const errors = init()

function init() {
    return {
        total : [], 
        missing: [], 
        invalid: [], 
        unknown: [],
    }
}

function clear() {
    const empty = init()
    errors.total = empty.total
    errors.missing = empty.missing
    errors.invalid = empty.invalid
    errors.unknown = empty.unknown
}

function get() {
    return Clone.deep(errors)
}

function apply(initial, target, check) {
    Object.keys(target).forEach(key => {
        if (!(key in initial)) {
            delete target[key]
            const error= `Prop ${key}: Unknown`
            errors.unknown.push(error)
            errors.total.push(error)
            Log.log(error)
        }
    })
    Object.keys(initial).forEach(key => {
        const value = target[key]
        if (value === undefined || value === null) {
            const error = `Prop ${key}: Missing`
            target[key] = initial[key]
            errors.missing.push(error)
            errors.total.push(error)
            Log.log(error)
            return
        }
        //force null exception if undefined checks 
        //is passed when a valid one is expected
        if (arguments.length > 2) {
            try { check(key, value) }
            catch (ex) {
                const error = `${ex}`
                errors.missing.push(error)
                errors.total.push(error)
                Log.log(error)
                }
        }
    })
    return errors
}


export default {
    apply,
    clear,
    init,
    get,
} 
