
function autoFocus(ref) {
    //autoFocus fails with inputs but works with select above
    setTimeout(() => {
        const el = ref.current
        if (el) {
            el.focus()
            //select does not have select
            if (el.select) el.select()
        }
    }, 0)
}

export default {
    autoFocus,
}
