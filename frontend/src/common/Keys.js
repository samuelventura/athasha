
const mac = navigator.userAgentData.platform.match("Mac")

function isCtrlKey(event) {
    return mac ? event.metaKey : event.ctrlKey
}

export default {
    isCtrlKey,
}
