
//macpro
//'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
const usMac = navigator.userAgent && navigator.userAgent.match(/mac/i)

//mb air apple silicon : 'macOS'
const macPla = navigator.userAgentData && navigator.userAgentData.platform && navigator.userAgentData.platform.match(/mac/i)

const mac = usMac || macPla

function isCtrlKey(event) {
    return mac ? event.metaKey : event.ctrlKey
}

export default {
    isCtrlKey,
}
