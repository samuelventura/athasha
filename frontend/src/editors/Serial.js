
const configList = ["8N1", "8E1", "8O1", "8N2", "8E2", "8O2", "7N1", "7E1", "7O1", "7N2", "7E2", "7O2"]

const configOptions = configList.map(c => <option value={c}>{c}</option>)

export {
    configOptions,
}
