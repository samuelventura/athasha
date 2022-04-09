import Api from './Api'

test('grants access if no roles are required', () => {
  const session = {}
  const access = Api.hasAccess(session, [])
  expect(access).toBe(true)
})

test('grants access if user database is empty', () => {
  const session = {id: ":open:"}
  const access = Api.hasAccess(session, ["admin"])
  expect(access).toBe(true)
})

test('grants access if roles match', () => {
  const session = {id: "some", roles: ["admin"]}
  const access = Api.hasAccess(session, ["admin"])
  expect(access).toBe(true)
})

test('rejects access if roles dont match', () => {
  const session = {id: "some", roles: ["user"]}
  const access = Api.hasAccess(session, ["admin"])
  expect(access).toBe(false)
})
 