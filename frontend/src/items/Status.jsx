import React from 'react'
import Badge from 'react-bootstrap/Badge'
import Tools from "./Tools"

function statusTitle(item, status) {
    if (!item.enabled) {
        return "Disabled"
    }
    if (!status.type) {
        return "Enabled"
    }
    return status.msg
}

function statusMsg(item) {
    if (!item.enabled) {
        return "Disabled"
    }
    return "Enabled"
}

function statusBg(item, status) {
    if (!item.enabled) {
        return "secondary"
    }
    switch (status.type) {
        case "success": return "success"
        case "warn": return "warning"
        case "error": return "danger"
        default: return "primary"
    }
}

function statusOnClick(status) {
    Tools.safeCopy(status.msg)
}

function Status({ item, status }) {
    return (
        <Badge pill bg={statusBg(item, status)} title={statusTitle(item, status)}
            onClick={() => statusOnClick(status)} className='ms-2 user-select-none'>
            {statusMsg(item)}
        </Badge>
    )
}

export default Status
