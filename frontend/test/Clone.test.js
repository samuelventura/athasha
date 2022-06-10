// @vitest-environment happy-dom

import { expect, test } from 'vitest'
import Clone from "../src/tools/Clone"

test('shallow clone', () => {
    expect(Clone.shallow(undefined)).toBeUndefined()
    expect(Clone.shallow(null)).toBeNull()
    expect(Clone.shallow([])).toEqual([])
    expect(Clone.shallow({})).toEqual({})
})

test('deep clone', () => {
    expect(Clone.deep(undefined)).toBeUndefined()
    expect(Clone.deep(null)).toBeNull()
    expect(Clone.deep([])).toEqual([])
    expect(Clone.deep({})).toEqual({})
    expect(Clone.deep(1)).toEqual(1)
    expect(Clone.deep(1.2)).toEqual(1.2)
    expect(Clone.deep("1.2")).toEqual("1.2")
})
