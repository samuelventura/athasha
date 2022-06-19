
//mb air apple silicon : 'macOS'
const mac = navigator.userAgentData.platform.toLowerCase().match("mac")

function isCtrlKey(event) {
    return mac ? event.metaKey : event.ctrlKey
}

export default {
    isCtrlKey,
}
